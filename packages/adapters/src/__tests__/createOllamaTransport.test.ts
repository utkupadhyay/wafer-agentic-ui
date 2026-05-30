import type { EmitEvent } from "@wafer/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createOllamaTransport } from "../ollama/createOllamaTransport";

const BASE_INPUT = {
  threadId: "thread_1",
  runId: "run_1",
  messageId: "msg_1",
  text: "hello",
  history: [] as Array<{ role: "user" | "assistant" | "system" | "tool"; content: string }>
};

function makeStreamResponse(chunks: object[]): Response {
  const lines = chunks.map((c) => JSON.stringify(c)).join("\n");
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(lines));
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

describe("createOllamaTransport (streaming, no tools)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls the Ollama chat endpoint with the correct URL", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      makeStreamResponse([
        { message: { role: "assistant", content: "Hi" }, done: false },
        { message: { role: "assistant", content: "" }, done: true }
      ])
    );

    const transport = createOllamaTransport({ model: "llama3", baseUrl: "http://ollama:11434" });
    const emit = vi.fn() as unknown as EmitEvent;
    await transport.sendUserMessage(BASE_INPUT, emit);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://ollama:11434/api/chat",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("emits message.delta events for streamed content", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeStreamResponse([
        { message: { role: "assistant", content: "Hello" }, done: false },
        { message: { role: "assistant", content: " world" }, done: false },
        { message: { role: "assistant", content: "" }, done: true }
      ])
    );

    const transport = createOllamaTransport({ model: "llama3" });
    const events: Parameters<EmitEvent>[0][] = [];
    await transport.sendUserMessage(BASE_INPUT, (e) => events.push(e));

    const deltas = events.filter((e) => e.type === "message.delta");
    expect(deltas).toHaveLength(2);
    expect((deltas[0] as { delta: string }).delta).toBe("Hello");
    expect((deltas[1] as { delta: string }).delta).toBe(" world");
  });

  it("emits run.completed after streaming finishes", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeStreamResponse([{ message: { role: "assistant", content: "" }, done: true }])
    );

    const transport = createOllamaTransport({ model: "llama3" });
    const events: Parameters<EmitEvent>[0][] = [];
    await transport.sendUserMessage(BASE_INPUT, (e) => events.push(e));

    expect(events.some((e) => e.type === "run.completed")).toBe(true);
  });

  it("throws and emits tool.failed on non-OK HTTP response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("Service Unavailable", { status: 503 }));

    const transport = createOllamaTransport({ model: "llama3" });
    const events: Parameters<EmitEvent>[0][] = [];

    await expect(transport.sendUserMessage(BASE_INPUT, (e) => events.push(e))).rejects.toThrow(
      "503"
    );
    expect(events.some((e) => e.type === "tool.failed")).toBe(true);
  });

  it("includes systemPrompt in messages when provided", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      makeStreamResponse([{ message: { role: "assistant", content: "" }, done: true }])
    );

    const transport = createOllamaTransport({ model: "llama3", systemPrompt: "You are helpful." });
    await transport.sendUserMessage(BASE_INPUT, vi.fn());

    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(body.messages[0]).toMatchObject({ role: "system", content: "You are helpful." });
  });

  it("passes requestOptions to Ollama as 'options' field", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      makeStreamResponse([{ message: { role: "assistant", content: "" }, done: true }])
    );

    const transport = createOllamaTransport({
      model: "llama3",
      requestOptions: { temperature: 0 }
    });
    await transport.sendUserMessage(BASE_INPUT, vi.fn());

    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(body.options).toEqual({ temperature: 0 });
  });
});

describe("createOllamaTransport (tool calling mode)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls fetch with tools schema", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      makeJsonResponse({
        message: { role: "assistant", content: "done", tool_calls: [] },
        done: true
      })
    );

    const tool = {
      function: {
        name: "my_tool",
        description: "A tool",
        parameters: { type: "object", properties: {} }
      },
      execute: vi.fn().mockResolvedValue({ ok: true })
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool] });
    await transport.sendUserMessage(BASE_INPUT, vi.fn());

    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(body.tools).toBeDefined();
    expect(body.tools[0].function.name).toBe("my_tool");
  });

  it("executes a tool when the LLM requests it", async () => {
    const fetchMock = vi.mocked(fetch);
    const executeMock = vi.fn().mockResolvedValue({ result: "done" });

    fetchMock
      .mockResolvedValueOnce(
        makeJsonResponse({
          message: {
            role: "assistant",
            content: "",
            tool_calls: [{ function: { name: "my_tool", arguments: { q: "test" } } }]
          },
          done: true
        })
      )
      .mockResolvedValueOnce(
        makeJsonResponse({
          message: { role: "assistant", content: "Here is the result.", tool_calls: [] },
          done: true
        })
      );

    const tool = {
      function: {
        name: "my_tool",
        description: "A tool",
        parameters: { type: "object", properties: {} }
      },
      execute: executeMock
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool], maxToolRounds: 3 });
    const events: Parameters<EmitEvent>[0][] = [];
    await transport.sendUserMessage(BASE_INPUT, (e) => events.push(e));

    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({ q: "test" }),
      expect.objectContaining({ toolName: "my_tool" })
    );
    expect(events.some((e) => e.type === "tool.completed")).toBe(true);
    expect(events.some((e) => e.type === "run.completed")).toBe(true);
  });

  it("emits tool.failed for an unknown tool name", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      makeJsonResponse({
        message: {
          role: "assistant",
          content: "",
          tool_calls: [{ function: { name: "nonexistent_tool", arguments: {} } }]
        },
        done: true
      })
    );

    const tool = {
      function: {
        name: "my_tool",
        description: "A tool",
        parameters: { type: "object", properties: {} }
      },
      execute: vi.fn()
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool] });
    const events: Parameters<EmitEvent>[0][] = [];

    await expect(transport.sendUserMessage(BASE_INPUT, (e) => events.push(e))).rejects.toThrow(
      "nonexistent_tool"
    );
    expect(events.some((e) => e.type === "tool.failed")).toBe(true);
  });

  it("throws when maxToolRounds is exhausted without completion", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        makeJsonResponse({
          message: {
            role: "assistant",
            content: "",
            tool_calls: [{ function: { name: "loop_tool", arguments: {} } }]
          },
          done: true
        })
      )
    );

    const tool = {
      function: {
        name: "loop_tool",
        description: "Loops",
        parameters: { type: "object", properties: {} }
      },
      execute: vi.fn().mockResolvedValue("ok")
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool], maxToolRounds: 2 });

    await expect(transport.sendUserMessage(BASE_INPUT, vi.fn())).rejects.toThrow(
      "maximum number of tool rounds"
    );
  });
});

describe("createOllamaTransport (submitApproval)", () => {
  it("emits approval.resolved with the given decision", async () => {
    const transport = createOllamaTransport({ model: "llama3" });
    const events: Parameters<EmitEvent>[0][] = [];

    await transport.submitApproval?.(
      {
        threadId: "t1",
        runId: "run_1",
        approvalId: "ap_1",
        decision: "approved",
        history: []
      },
      (e) => events.push(e)
    );

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: "approval.resolved",
      approvalId: "ap_1",
      decision: "approved"
    });
  });
});

describe("createOllamaTransport (streaming edge cases)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("emits tool.failed and throws when a chunk contains an error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeStreamResponse([{ error: "model overloaded" }]));

    const transport = createOllamaTransport({ model: "llama3" });
    const events: Parameters<EmitEvent>[0][] = [];

    await expect(transport.sendUserMessage(BASE_INPUT, (e) => events.push(e))).rejects.toThrow(
      "model overloaded"
    );
    expect(events.some((e) => e.type === "tool.failed")).toBe(true);
  });

  it("handles a response with no body by falling back to json()", async () => {
    const noBodyResponse = new Response(null, { status: 200 });
    Object.defineProperty(noBodyResponse, "json", {
      value: vi.fn().mockResolvedValue({ message: { role: "assistant", content: "" }, done: true })
    });
    Object.defineProperty(noBodyResponse, "body", { value: null });

    vi.mocked(fetch).mockResolvedValueOnce(noBodyResponse);

    const transport = createOllamaTransport({ model: "llama3" });
    const events: Parameters<EmitEvent>[0][] = [];
    await transport.sendUserMessage(BASE_INPUT, (e) => events.push(e));

    expect(events.some((e) => e.type === "run.completed")).toBe(true);
  });

  it("emits run.completed even when stream ends without done:true", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeStreamResponse([{ message: { role: "assistant", content: "partial" }, done: false }])
    );

    const transport = createOllamaTransport({ model: "llama3" });
    const events: Parameters<EmitEvent>[0][] = [];
    await transport.sendUserMessage(BASE_INPUT, (e) => events.push(e));

    expect(events.some((e) => e.type === "run.completed")).toBe(true);
    expect(events.some((e) => e.type === "tool.completed")).toBe(true);
  });

  it("includes history messages in the Ollama request", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      makeStreamResponse([{ message: { role: "assistant", content: "" }, done: true }])
    );

    const transport = createOllamaTransport({ model: "llama3" });
    const inputWithHistory = {
      ...BASE_INPUT,
      history: [
        { role: "user" as const, content: "first question" },
        { role: "assistant" as const, content: "first answer" }
      ]
    };
    await transport.sendUserMessage(inputWithHistory, vi.fn());

    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(body.messages.some((m: { content: string }) => m.content === "first question")).toBe(
      true
    );
  });
});

describe("createOllamaTransport (argument normalisation & tool schema)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("passes string arguments as parsed JSON to tool execute", async () => {
    const executeMock = vi.fn().mockResolvedValue("ok");
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        makeJsonResponse({
          message: {
            role: "assistant",
            content: "",
            tool_calls: [{ function: { name: "str_tool", arguments: '{"q":"cats"}' } }]
          }
        })
      )
      .mockResolvedValueOnce(
        makeJsonResponse({ message: { role: "assistant", content: "Done.", tool_calls: [] } })
      );

    const tool = {
      function: {
        name: "str_tool",
        description: "T",
        parameters: { type: "object", properties: {} }
      },
      execute: executeMock
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool], maxToolRounds: 3 });
    await transport.sendUserMessage(BASE_INPUT, vi.fn());

    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({ q: "cats" }),
      expect.any(Object)
    );
  });

  it("treats empty string arguments as empty object", async () => {
    const executeMock = vi.fn().mockResolvedValue("ok");
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        makeJsonResponse({
          message: {
            role: "assistant",
            content: "",
            tool_calls: [{ function: { name: "empty_tool", arguments: "" } }]
          }
        })
      )
      .mockResolvedValueOnce(
        makeJsonResponse({ message: { role: "assistant", content: "Done.", tool_calls: [] } })
      );

    const tool = {
      function: {
        name: "empty_tool",
        description: "T",
        parameters: { type: "object", properties: {} }
      },
      execute: executeMock
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool], maxToolRounds: 3 });
    await transport.sendUserMessage(BASE_INPUT, vi.fn());

    expect(executeMock).toHaveBeenCalledWith({}, expect.any(Object));
  });

  it("treats null/undefined arguments as empty object", async () => {
    const executeMock = vi.fn().mockResolvedValue("ok");
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        makeJsonResponse({
          message: {
            role: "assistant",
            content: "",
            tool_calls: [{ function: { name: "null_tool", arguments: null } }]
          }
        })
      )
      .mockResolvedValueOnce(
        makeJsonResponse({ message: { role: "assistant", content: "Done.", tool_calls: [] } })
      );

    const tool = {
      function: {
        name: "null_tool",
        description: "T",
        parameters: { type: "object", properties: {} }
      },
      execute: executeMock
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool], maxToolRounds: 3 });
    await transport.sendUserMessage(BASE_INPUT, vi.fn());

    expect(executeMock).toHaveBeenCalledWith({}, expect.any(Object));
  });

  it("passes think option to Ollama when set explicitly", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      makeJsonResponse({ message: { role: "assistant", content: "Done.", tool_calls: [] } })
    );

    const tool = {
      function: { name: "t", description: "T", parameters: { type: "object", properties: {} } },
      execute: vi.fn().mockResolvedValue("ok")
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool], think: true });
    await transport.sendUserMessage(BASE_INPUT, vi.fn());

    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(body.think).toBe(true);
  });

  it("throws on non-OK HTTP response in tool-calling mode", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("Service Unavailable", { status: 503 }));

    const tool = {
      function: { name: "t", description: "T", parameters: { type: "object", properties: {} } },
      execute: vi.fn()
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool] });
    const events: Parameters<EmitEvent>[0][] = [];

    await expect(transport.sendUserMessage(BASE_INPUT, (e) => events.push(e))).rejects.toThrow(
      "503"
    );
    expect(events.some((e) => e.type === "tool.failed")).toBe(true);
  });

  it("recovers tool calls from fenced JSON code block in content", async () => {
    const executeMock = vi.fn().mockResolvedValue({ ok: true });
    const fencedContent = `\`\`\`json\n${JSON.stringify({ name: "fence_tool", arguments: {} })}\n\`\`\``;
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        makeJsonResponse({
          message: { role: "assistant", content: fencedContent, tool_calls: [] }
        })
      )
      .mockResolvedValueOnce(
        makeJsonResponse({ message: { role: "assistant", content: "Done.", tool_calls: [] } })
      );

    const tool = {
      function: {
        name: "fence_tool",
        description: "T",
        parameters: { type: "object", properties: {} }
      },
      execute: executeMock
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool], maxToolRounds: 3 });
    await transport.sendUserMessage(BASE_INPUT, vi.fn());

    expect(executeMock).toHaveBeenCalled();
  });

  it("persists conversation history across multiple sendUserMessage calls", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(
        makeJsonResponse({
          message: { role: "assistant", content: "First reply.", tool_calls: [] }
        })
      )
      .mockResolvedValueOnce(
        makeJsonResponse({
          message: { role: "assistant", content: "Second reply.", tool_calls: [] }
        })
      );

    const tool = {
      function: { name: "t", description: "T", parameters: { type: "object", properties: {} } },
      execute: vi.fn()
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool] });
    await transport.sendUserMessage(BASE_INPUT, vi.fn());
    await transport.sendUserMessage({ ...BASE_INPUT, text: "follow-up" }, vi.fn());

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondBody = JSON.parse((fetchMock.mock.calls[1]?.[1] as RequestInit).body as string);
    expect(secondBody.messages.some((m: { content: string }) => m.content === "follow-up")).toBe(
      true
    );
  });

  it("recovers tool calls from a JSON array in content", async () => {
    const executeMock = vi.fn().mockResolvedValue("ok");
    const arrayContent = JSON.stringify([{ name: "array_tool", arguments: { n: 1 } }]);
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        makeJsonResponse({ message: { role: "assistant", content: arrayContent, tool_calls: [] } })
      )
      .mockResolvedValueOnce(
        makeJsonResponse({ message: { role: "assistant", content: "Done.", tool_calls: [] } })
      );

    const tool = {
      function: {
        name: "array_tool",
        description: "T",
        parameters: { type: "object", properties: {} }
      },
      execute: executeMock
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool], maxToolRounds: 3 });
    await transport.sendUserMessage(BASE_INPUT, vi.fn());

    expect(executeMock).toHaveBeenCalled();
  });

  it("recovers tool calls from a tool_calls wrapper object in content", async () => {
    const executeMock = vi.fn().mockResolvedValue("ok");
    const wrapperContent = JSON.stringify({
      tool_calls: [{ function: { name: "wrapped_tool", arguments: {} } }]
    });
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        makeJsonResponse({
          message: { role: "assistant", content: wrapperContent, tool_calls: [] }
        })
      )
      .mockResolvedValueOnce(
        makeJsonResponse({ message: { role: "assistant", content: "Done.", tool_calls: [] } })
      );

    const tool = {
      function: {
        name: "wrapped_tool",
        description: "T",
        parameters: { type: "object", properties: {} }
      },
      execute: executeMock
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool], maxToolRounds: 3 });
    await transport.sendUserMessage(BASE_INPUT, vi.fn());

    expect(executeMock).toHaveBeenCalled();
  });

  it("does not call execute when content cannot be parsed as tool calls", async () => {
    const executeMock = vi.fn();
    vi.mocked(fetch).mockResolvedValueOnce(
      makeJsonResponse({
        message: { role: "assistant", content: "Just plain text, no JSON.", tool_calls: [] }
      })
    );

    const tool = {
      function: { name: "t", description: "T", parameters: { type: "object", properties: {} } },
      execute: executeMock
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool], maxToolRounds: 1 });
    await transport.sendUserMessage(BASE_INPUT, vi.fn());
    expect(executeMock).not.toHaveBeenCalled();
  });

  it("uses explicit tool type when provided on tool schema", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      makeJsonResponse({ message: { role: "assistant", content: "Done.", tool_calls: [] } })
    );

    const tool = {
      type: "function" as const,
      function: {
        name: "typed_tool",
        description: "T",
        parameters: { type: "object", properties: {} }
      },
      execute: vi.fn().mockResolvedValue("ok")
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool] });
    await transport.sendUserMessage(BASE_INPUT, vi.fn());

    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(body.tools[0].type).toBe("function");
  });
});

describe("createOllamaTransport (tool calling edge cases)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("emits tool.failed when tool.execute throws", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeJsonResponse({
        message: {
          role: "assistant",
          content: "",
          tool_calls: [{ function: { name: "bad_tool", arguments: {} } }]
        }
      })
    );

    const tool = {
      function: {
        name: "bad_tool",
        description: "Fails",
        parameters: { type: "object", properties: {} }
      },
      execute: vi.fn().mockRejectedValue(new Error("execute failed"))
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool] });
    const events: Parameters<EmitEvent>[0][] = [];

    await expect(transport.sendUserMessage(BASE_INPUT, (e) => events.push(e))).rejects.toThrow(
      "execute failed"
    );
    expect(events.filter((e) => e.type === "tool.failed").length).toBeGreaterThan(0);
  });

  it("emits tool.failed and throws when LLM response contains body.error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse({ error: "model not found" }));

    const tool = {
      function: {
        name: "my_tool",
        description: "A tool",
        parameters: { type: "object", properties: {} }
      },
      execute: vi.fn()
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool] });
    const events: Parameters<EmitEvent>[0][] = [];

    await expect(transport.sendUserMessage(BASE_INPUT, (e) => events.push(e))).rejects.toThrow(
      "model not found"
    );
    expect(events.some((e) => e.type === "tool.failed")).toBe(true);
  });

  it("recovers tool calls embedded in assistant message content (JSON fallback)", async () => {
    const executeMock = vi.fn().mockResolvedValue({ ok: true });
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        makeJsonResponse({
          message: {
            role: "assistant",
            content: JSON.stringify({ name: "recover_tool", arguments: { x: 1 } }),
            tool_calls: []
          }
        })
      )
      .mockResolvedValueOnce(
        makeJsonResponse({ message: { role: "assistant", content: "Done.", tool_calls: [] } })
      );

    const tool = {
      function: {
        name: "recover_tool",
        description: "Recoverable",
        parameters: { type: "object", properties: {} }
      },
      execute: executeMock
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool], maxToolRounds: 3 });
    const events: Parameters<EmitEvent>[0][] = [];
    await transport.sendUserMessage(BASE_INPUT, (e) => events.push(e));

    expect(executeMock).toHaveBeenCalled();
    expect(events.some((e) => e.type === "run.completed")).toBe(true);
  });

  it("retries with forceToolCallRetryCount when no tool calls on first round", async () => {
    const executeMock = vi.fn().mockResolvedValue({ ok: true });
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        makeJsonResponse({
          message: { role: "assistant", content: "Let me call a tool.", tool_calls: [] }
        })
      )
      .mockResolvedValueOnce(
        makeJsonResponse({
          message: {
            role: "assistant",
            content: "",
            tool_calls: [{ function: { name: "forced_tool", arguments: {} } }]
          }
        })
      )
      .mockResolvedValueOnce(
        makeJsonResponse({ message: { role: "assistant", content: "Done.", tool_calls: [] } })
      );

    const tool = {
      function: {
        name: "forced_tool",
        description: "Forced",
        parameters: { type: "object", properties: {} }
      },
      execute: executeMock
    };
    const transport = createOllamaTransport({
      model: "llama3",
      tools: [tool],
      maxToolRounds: 4,
      forceToolCallRetryCount: 1
    });
    await transport.sendUserMessage(BASE_INPUT, vi.fn());

    expect(executeMock).toHaveBeenCalled();
  });

  it("throws when tool name is empty string", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeJsonResponse({
        message: {
          role: "assistant",
          content: "",
          tool_calls: [{ function: { name: "", arguments: {} } }]
        }
      })
    );

    const tool = {
      function: {
        name: "valid_tool",
        description: "A tool",
        parameters: { type: "object", properties: {} }
      },
      execute: vi.fn()
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool] });

    await expect(transport.sendUserMessage(BASE_INPUT, vi.fn())).rejects.toThrow("no tool name");
  });

  it("stringifies non-string tool output for the tool message", async () => {
    const executeMock = vi.fn().mockResolvedValue({ count: 42 });
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        makeJsonResponse({
          message: {
            role: "assistant",
            content: "",
            tool_calls: [{ function: { name: "count_tool", arguments: {} } }]
          }
        })
      )
      .mockResolvedValueOnce(
        makeJsonResponse({ message: { role: "assistant", content: "Got 42.", tool_calls: [] } })
      );

    const tool = {
      function: {
        name: "count_tool",
        description: "Counts",
        parameters: { type: "object", properties: {} }
      },
      execute: executeMock
    };
    const transport = createOllamaTransport({ model: "llama3", tools: [tool], maxToolRounds: 3 });
    const events: Parameters<EmitEvent>[0][] = [];
    await transport.sendUserMessage(BASE_INPUT, (e) => events.push(e));

    expect(events.some((e) => e.type === "run.completed")).toBe(true);
  });
});
