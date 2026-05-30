import { describe, expect, it, vi } from "vitest";
import { createAgentClient } from "../client/AgentClient";
import type { AgentTransport, EmitEvent } from "../types";

function makeMockTransport(overrides?: Partial<AgentTransport>): AgentTransport {
  return {
    sendUserMessage: vi.fn().mockResolvedValue(undefined),
    ...overrides
  };
}

describe("AgentClient", () => {
  describe("constructor / createAgentClient", () => {
    it("initializes with idle status", () => {
      const client = createAgentClient({ transport: makeMockTransport() });
      expect(client.getState().status).toBe("idle");
    });

    it("uses the provided threadId", () => {
      const client = createAgentClient({ transport: makeMockTransport(), threadId: "my-thread" });
      expect(client.getState().threadId).toBe("my-thread");
    });

    it("generates a threadId when none is provided", () => {
      const client = createAgentClient({ transport: makeMockTransport() });
      expect(client.getState().threadId).toBeTruthy();
      expect(typeof client.getState().threadId).toBe("string");
    });

    it("starts with empty messages, runs, toolCalls, approvals", () => {
      const state = createAgentClient({ transport: makeMockTransport() }).getState();
      expect(state.messages).toEqual([]);
      expect(state.runs).toEqual({});
      expect(state.toolCalls).toEqual({});
      expect(state.approvals).toEqual({});
    });
  });

  describe("subscribe / getState", () => {
    it("calls listener when state changes", async () => {
      const client = createAgentClient({ transport: makeMockTransport() });
      const listener = vi.fn();
      client.subscribe(listener);
      await client.sendUserMessage("hello");
      expect(listener).toHaveBeenCalled();
    });

    it("returns an unsubscribe function that stops notifications", async () => {
      const client = createAgentClient({ transport: makeMockTransport() });
      const listener = vi.fn();
      const unsub = client.subscribe(listener);
      unsub();
      await client.sendUserMessage("hello");
      expect(listener).not.toHaveBeenCalled();
    });

    it("supports multiple simultaneous listeners", async () => {
      const client = createAgentClient({ transport: makeMockTransport() });
      const l1 = vi.fn();
      const l2 = vi.fn();
      client.subscribe(l1);
      client.subscribe(l2);
      await client.sendUserMessage("hi");
      expect(l1).toHaveBeenCalled();
      expect(l2).toHaveBeenCalled();
    });
  });

  describe("sendUserMessage", () => {
    it("adds a user message to state", async () => {
      const client = createAgentClient({ transport: makeMockTransport() });
      await client.sendUserMessage("hello");
      const { messages } = client.getState();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({ role: "user", content: "hello" });
    });

    it("creates a run entry", async () => {
      const client = createAgentClient({ transport: makeMockTransport() });
      await client.sendUserMessage("hello");
      expect(Object.keys(client.getState().runs)).toHaveLength(1);
    });

    it("calls transport.sendUserMessage with the text and history", async () => {
      const transport = makeMockTransport();
      const client = createAgentClient({ transport });
      await client.sendUserMessage("hello");
      expect(transport.sendUserMessage).toHaveBeenCalledWith(
        expect.objectContaining({ text: "hello" }),
        expect.any(Function)
      );
    });

    it("passes accumulated history on subsequent messages", async () => {
      const transport = makeMockTransport();
      const client = createAgentClient({ transport });
      await client.sendUserMessage("first");
      await client.sendUserMessage("second");
      const secondCall = vi.mocked(transport.sendUserMessage).mock.calls[1];
      expect(secondCall?.[0].history.length).toBeGreaterThanOrEqual(1);
    });

    it("processes events emitted by transport", async () => {
      const transport = makeMockTransport({
        sendUserMessage: vi.fn().mockImplementation(async (input, emit: EmitEvent) => {
          emit({
            type: "message.created",
            threadId: input.threadId,
            messageId: "assistant_msg",
            role: "assistant",
            content: "I can help",
            runId: input.runId,
            createdAt: new Date().toISOString()
          });
          emit({
            type: "run.completed",
            threadId: input.threadId,
            runId: input.runId,
            createdAt: new Date().toISOString()
          });
        })
      });
      const client = createAgentClient({ transport });
      await client.sendUserMessage("hello");
      const state = client.getState();
      expect(state.status).toBe("idle");
      expect(state.messages).toHaveLength(2);
      expect(state.messages[1]).toMatchObject({ role: "assistant", content: "I can help" });
    });

    it("emits run.failed and error events when transport throws", async () => {
      const transport = makeMockTransport({
        sendUserMessage: vi.fn().mockRejectedValue(new Error("network failure"))
      });
      const client = createAgentClient({ transport });
      await client.sendUserMessage("hello");
      const state = client.getState();
      expect(state.status).toBe("error");
      expect(state.lastError).toBe("network failure");
    });

    it("handles non-Error thrown values", async () => {
      const transport = makeMockTransport({
        sendUserMessage: vi.fn().mockRejectedValue("plain string error")
      });
      const client = createAgentClient({ transport });
      await client.sendUserMessage("hello");
      expect(client.getState().status).toBe("error");
      expect(client.getState().lastError).toBe("Unknown error");
    });
  });

  describe("resolveApproval", () => {
    it("throws when transport does not implement submitApproval", async () => {
      const client = createAgentClient({ transport: makeMockTransport() });
      await expect(client.resolveApproval("ap_1", "run_1", "approved")).rejects.toThrow(
        "does not support approvals"
      );
    });

    it("calls transport.submitApproval with correct payload", async () => {
      const submitApproval = vi.fn().mockResolvedValue(undefined);
      const client = createAgentClient({ transport: makeMockTransport({ submitApproval }) });
      await client.resolveApproval("ap_1", "run_1", "approved");
      expect(submitApproval).toHaveBeenCalledWith(
        expect.objectContaining({ approvalId: "ap_1", runId: "run_1", decision: "approved" }),
        expect.any(Function)
      );
    });

    it("calls transport.submitApproval with rejected decision", async () => {
      const submitApproval = vi.fn().mockResolvedValue(undefined);
      const client = createAgentClient({ transport: makeMockTransport({ submitApproval }) });
      await client.resolveApproval("ap_1", "run_1", "rejected");
      expect(submitApproval).toHaveBeenCalledWith(
        expect.objectContaining({ decision: "rejected" }),
        expect.any(Function)
      );
    });
  });
});
