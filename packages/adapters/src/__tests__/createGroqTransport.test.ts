import type { EmitEvent } from "@wafer/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGroqTransport } from "../groq/createGroqTransport";

const BASE_INPUT = {
  threadId: "thread_1",
  runId: "run_1",
  messageId: "msg_1",
  text: "hello",
  history: [] as Array<{ role: "user" | "assistant" | "system" | "tool"; content: string }>
};

function makeSseResponse(
  chunks: Array<{ choices: Array<{ delta: { content?: string }; finish_reason: string | null }> }>,
  includesDone = true
): Response {
  const lines = chunks.map((c) => `data: ${JSON.stringify(c)}`).join("\n");
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(lines + (includesDone ? "\ndata: [DONE]" : "")));
      controller.close();
    }
  });
  return new Response(body, { status: 200 });
}

function makeJsonResponse(body: object): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

// ─── streaming mode (no tools) ───────────────────────────────────────────────

describe("createGroqTransport (streaming, no tools)", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("calls the configured endpoint with POST", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      makeSseResponse([{ choices: [{ delta: { content: "" }, finish_reason: "stop" }] }])
    );

    const transport = createGroqTransport({ endpoint: "/api/groq" });
    await transport.sendUserMessage(BASE_INPUT, vi.fn());

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/groq",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("uses default endpoint /api/chat when none provided", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      makeSseResponse([{ choices: [{ delta: {}, finish_reason: "stop" }] }])
    );

    const transport = createGroqTransport({});
    await transport.sendUserMessage(BASE_INPUT, vi.fn());

    expect(fetchMock).toHaveBeenCalledWith("/api/chat", expect.any(Object));
  });

  it("emits message.created before streaming", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeSseResponse([{ choices: [{ delta: {}, finish_reason: "stop" }] }])
    );

    const events: Parameters<EmitEvent>[0][] = [];
    await createGroqTransport({}).sendUserMessage(BASE_INPUT, (e) => events.push(e));

    const [first] = events;
    expect(first?.type).toBe("message.created");
    expect((first as { role: string }).role).toBe("assistant");
  });

  it("emits message.delta for each streamed content chunk", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeSseResponse([
        { choices: [{ delta: { content: "Hello" }, finish_reason: null }] },
        { choices: [{ delta: { content: " world" }, finish_reason: null }] },
        { choices: [{ delta: {}, finish_reason: "stop" }] }
      ])
    );

    const events: Parameters<EmitEvent>[0][] = [];
    await createGroqTransport({}).sendUserMessage(BASE_INPUT, (e) => events.push(e));

    const deltas = events.filter((e) => e.type === "message.delta");
    expect(deltas).toHaveLength(2);
    expect((deltas[0] as { delta: string }).delta).toBe("Hello");
    expect((deltas[1] as { delta: string }).delta).toBe(" world");
  });

  it("emits run.completed after streaming", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeSseResponse([{ choices: [{ delta: {}, finish_reason: "stop" }] }])
    );

    const events: Parameters<EmitEvent>[0][] = [];
    await createGroqTransport({}).sendUserMessage(BASE_INPUT, (e) => events.push(e));

    expect(events.some((e) => e.type === "run.completed")).toBe(true);
  });

  it("emits run.completed as fallback when stream ends without finish_reason", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeSseResponse([{ choices: [{ delta: { content: "partial" }, finish_reason: null }] }])
    );

    const events: Parameters<EmitEvent>[0][] = [];
    await createGroqTransport({}).sendUserMessage(BASE_INPUT, (e) => events.push(e));

    expect(events.some((e) => e.type === "run.completed")).toBe(true);
  });

  it("emits tool.failed and throws on non-OK HTTP response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("Service Unavailable", { status: 503 }));

    const events: Parameters<EmitEvent>[0][] = [];
    await expect(
      createGroqTransport({}).sendUserMessage(BASE_INPUT, (e) => events.push(e))
    ).rejects.toThrow("503");

    expect(events.some((e) => e.type === "tool.failed")).toBe(true);
  });

  it("includes systemPrompt in the request messages", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      makeSseResponse([{ choices: [{ delta: {}, finish_reason: "stop" }] }])
    );

    await createGroqTransport({ systemPrompt: "Be helpful." }).sendUserMessage(BASE_INPUT, vi.fn());

    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(body.messages[0]).toMatchObject({ role: "system", content: "Be helpful." });
  });

  it("sends stream: true in the request body", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      makeSseResponse([{ choices: [{ delta: {}, finish_reason: "stop" }] }])
    );

    await createGroqTransport({}).sendUserMessage(BASE_INPUT, vi.fn());

    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(body.stream).toBe(true);
  });

  it("includes history messages in the request", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      makeSseResponse([{ choices: [{ delta: {}, finish_reason: "stop" }] }])
    );

    const inputWithHistory = {
      ...BASE_INPUT,
      history: [
        { role: "user" as const, content: "first message" },
        { role: "assistant" as const, content: "first reply" }
      ]
    };
    await createGroqTransport({}).sendUserMessage(inputWithHistory, vi.fn());

    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(body.messages.some((m: { content: string }) => m.content === "first message")).toBe(
      true
    );
  });

  it("handles no-body response without throwing", async () => {
    const noBodyResponse = new Response(null, { status: 200 });
    Object.defineProperty(noBodyResponse, "body", { value: null });
    vi.mocked(fetch).mockResolvedValueOnce(noBodyResponse);

    const events: Parameters<EmitEvent>[0][] = [];
    await createGroqTransport({}).sendUserMessage(BASE_INPUT, (e) => events.push(e));

    expect(events.some((e) => e.type === "run.completed")).toBe(true);
  });

  it("handles SSE chunk with pending buffer after stream ends", async () => {
    const chunk = { choices: [{ delta: { content: "end" }, finish_reason: "stop" }] };
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(chunk)}`));
        controller.close();
      }
    });
    vi.mocked(fetch).mockResolvedValueOnce(new Response(body, { status: 200 }));

    const events: Parameters<EmitEvent>[0][] = [];
    await createGroqTransport({}).sendUserMessage(BASE_INPUT, (e) => events.push(e));

    expect(events.some((e) => e.type === "run.completed")).toBe(true);
  });
});

// ─── tool calling mode ────────────────────────────────────────────────────────

describe("createGroqTransport (tool calling mode)", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  function makeTool(name: string, executeMock = vi.fn().mockResolvedValue({ ok: true })) {
    return {
      function: { name, description: "A tool", parameters: { type: "object", properties: {} } },
      execute: executeMock
    };
  }

  function makeToolCallResponse(
    toolName: string,
    args: Record<string, unknown> = {},
    content = ""
  ) {
    return makeJsonResponse({
      choices: [
        {
          message: {
            role: "assistant",
            content,
            tool_calls: [
              {
                id: "tc_1",
                type: "function",
                function: { name: toolName, arguments: JSON.stringify(args) }
              }
            ]
          },
          finish_reason: "tool_calls"
        }
      ]
    });
  }

  function makeFinalResponse(content = "All done.") {
    return makeJsonResponse({
      choices: [
        {
          message: { role: "assistant", content, tool_calls: [] },
          finish_reason: "stop"
        }
      ]
    });
  }

  it("sends stream: false and tools schema in tool mode", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(makeFinalResponse());

    const tool = makeTool("search");
    await createGroqTransport({ tools: [tool] }).sendUserMessage(BASE_INPUT, vi.fn());

    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(body.stream).toBe(false);
    expect(body.tools[0].function.name).toBe("search");
  });

  it("executes a tool and emits tool events", async () => {
    const executeMock = vi.fn().mockResolvedValue({ result: "found" });
    vi.mocked(fetch)
      .mockResolvedValueOnce(makeToolCallResponse("search", { q: "cats" }))
      .mockResolvedValueOnce(makeFinalResponse());

    const events: Parameters<EmitEvent>[0][] = [];
    await createGroqTransport({ tools: [makeTool("search", executeMock)] }).sendUserMessage(
      BASE_INPUT,
      (e) => events.push(e)
    );

    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({ q: "cats" }),
      expect.objectContaining({ toolName: "search" })
    );
    expect(events.some((e) => e.type === "tool.completed")).toBe(true);
    expect(events.some((e) => e.type === "run.completed")).toBe(true);
  });

  it("emits tool.failed and throws for unknown tool name", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeToolCallResponse("nonexistent_tool"));

    const events: Parameters<EmitEvent>[0][] = [];
    await expect(
      createGroqTransport({ tools: [makeTool("search")] }).sendUserMessage(BASE_INPUT, (e) =>
        events.push(e)
      )
    ).rejects.toThrow("nonexistent_tool");

    expect(events.some((e) => e.type === "tool.failed")).toBe(true);
  });

  it("emits tool.failed and throws when tool.execute rejects", async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error("execute failed"));
    vi.mocked(fetch).mockResolvedValueOnce(makeToolCallResponse("bad_tool"));

    const events: Parameters<EmitEvent>[0][] = [];
    await expect(
      createGroqTransport({ tools: [makeTool("bad_tool", executeMock)] }).sendUserMessage(
        BASE_INPUT,
        (e) => events.push(e)
      )
    ).rejects.toThrow("execute failed");

    expect(events.some((e) => e.type === "tool.failed")).toBe(true);
  });

  it("emits tool.failed and throws on non-OK HTTP in tool mode", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("Bad Gateway", { status: 502 }));

    const events: Parameters<EmitEvent>[0][] = [];
    await expect(
      createGroqTransport({ tools: [makeTool("search")] }).sendUserMessage(BASE_INPUT, (e) =>
        events.push(e)
      )
    ).rejects.toThrow("502");

    expect(events.some((e) => e.type === "tool.failed")).toBe(true);
  });

  it("throws when maxToolRounds is exhausted", async () => {
    vi.mocked(fetch).mockImplementation(() => Promise.resolve(makeToolCallResponse("loop_tool")));

    const executeMock = vi.fn().mockResolvedValue("ok");
    await expect(
      createGroqTransport({
        tools: [makeTool("loop_tool", executeMock)],
        maxToolRounds: 2
      }).sendUserMessage(BASE_INPUT, vi.fn())
    ).rejects.toThrow("maximum number of tool rounds");
  });

  it("persists messages across multiple sendUserMessage calls", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(makeFinalResponse("First reply."))
      .mockResolvedValueOnce(makeFinalResponse("Second reply."));

    const transport = createGroqTransport({ tools: [makeTool("search")] });
    await transport.sendUserMessage(BASE_INPUT, vi.fn());
    await transport.sendUserMessage({ ...BASE_INPUT, text: "follow-up" }, vi.fn());

    const secondBody = JSON.parse((fetchMock.mock.calls[1]?.[1] as RequestInit).body as string);
    expect(secondBody.messages.some((m: { content: string }) => m.content === "follow-up")).toBe(
      true
    );
  });

  it("uses forceToolCallRetry when tool calls are absent on first round", async () => {
    const executeMock = vi.fn().mockResolvedValue("ok");
    vi.mocked(fetch)
      .mockResolvedValueOnce(makeFinalResponse("Let me think."))
      .mockResolvedValueOnce(makeToolCallResponse("search"))
      .mockResolvedValueOnce(makeFinalResponse("Done."));

    await createGroqTransport({
      tools: [makeTool("search", executeMock)],
      maxToolRounds: 4,
      forceToolCallRetryCount: 1
    }).sendUserMessage(BASE_INPUT, vi.fn());

    expect(executeMock).toHaveBeenCalled();
  });

  it("normalizes string tool arguments to a plain object", async () => {
    const executeMock = vi.fn().mockResolvedValue("ok");
    vi.mocked(fetch)
      .mockResolvedValueOnce(makeToolCallResponse("search", { q: "dogs" }))
      .mockResolvedValueOnce(makeFinalResponse());

    await createGroqTransport({ tools: [makeTool("search", executeMock)] }).sendUserMessage(
      BASE_INPUT,
      vi.fn()
    );

    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({ q: "dogs" }),
      expect.any(Object)
    );
  });

  it("normalizes invalid/empty tool arguments to empty object", async () => {
    const executeMock = vi.fn().mockResolvedValue("ok");
    const response = makeJsonResponse({
      choices: [
        {
          message: {
            role: "assistant",
            content: "",
            tool_calls: [
              { id: "tc_1", type: "function", function: { name: "search", arguments: "" } }
            ]
          },
          finish_reason: "tool_calls"
        }
      ]
    });
    vi.mocked(fetch).mockResolvedValueOnce(response).mockResolvedValueOnce(makeFinalResponse());

    await createGroqTransport({ tools: [makeTool("search", executeMock)] }).sendUserMessage(
      BASE_INPUT,
      vi.fn()
    );

    expect(executeMock).toHaveBeenCalledWith({}, expect.any(Object));
  });

  it("stringifies object tool output into tool message content", async () => {
    const executeMock = vi.fn().mockResolvedValue({ count: 99 });
    vi.mocked(fetch)
      .mockResolvedValueOnce(makeToolCallResponse("counter"))
      .mockResolvedValueOnce(makeFinalResponse());

    const events: Parameters<EmitEvent>[0][] = [];
    await createGroqTransport({ tools: [makeTool("counter", executeMock)] }).sendUserMessage(
      BASE_INPUT,
      (e) => events.push(e)
    );

    expect(events.some((e) => e.type === "run.completed")).toBe(true);
  });

  it("emits message.delta when assistant content accompanies tool calls", async () => {
    const executeMock = vi.fn().mockResolvedValue("ok");
    const response = makeJsonResponse({
      choices: [
        {
          message: {
            role: "assistant",
            content: "Calling the tool now.",
            tool_calls: [
              { id: "tc_1", type: "function", function: { name: "search", arguments: "{}" } }
            ]
          },
          finish_reason: "tool_calls"
        }
      ]
    });
    vi.mocked(fetch).mockResolvedValueOnce(response).mockResolvedValueOnce(makeFinalResponse());

    const events: Parameters<EmitEvent>[0][] = [];
    await createGroqTransport({ tools: [makeTool("search", executeMock)] }).sendUserMessage(
      BASE_INPUT,
      (e) => events.push(e)
    );

    expect(events.some((e) => e.type === "message.delta")).toBe(true);
  });

  it("uses explicit tool type when provided in tool schema", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(makeFinalResponse());

    const tool = {
      type: "function" as const,
      function: {
        name: "typed_tool",
        description: "T",
        parameters: { type: "object", properties: {} }
      },
      execute: vi.fn().mockResolvedValue("ok")
    };
    await createGroqTransport({ tools: [tool] }).sendUserMessage(BASE_INPUT, vi.fn());

    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(body.tools[0].type).toBe("function");
  });
});

// ─── submitApproval ───────────────────────────────────────────────────────────

describe("createGroqTransport (submitApproval)", () => {
  it("emits approval.resolved with the given decision", async () => {
    const transport = createGroqTransport({});
    const events: Parameters<EmitEvent>[0][] = [];

    await transport.submitApproval?.(
      { threadId: "t1", runId: "r1", approvalId: "ap_1", decision: "approved", history: [] },
      (e) => events.push(e)
    );

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: "approval.resolved",
      approvalId: "ap_1",
      decision: "approved"
    });
  });

  it("emits approval.resolved with rejected decision", async () => {
    const transport = createGroqTransport({});
    const events: Parameters<EmitEvent>[0][] = [];

    await transport.submitApproval?.(
      { threadId: "t1", runId: "r1", approvalId: "ap_2", decision: "rejected", history: [] },
      (e) => events.push(e)
    );

    expect(events[0]).toMatchObject({ type: "approval.resolved", decision: "rejected" });
  });
});
