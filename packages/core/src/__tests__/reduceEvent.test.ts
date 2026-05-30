import { describe, expect, it } from "vitest";
import { reduceEvent } from "../runtime/reduceEvent";
import { createInitialState } from "../state";
import type { AgentState } from "../types";

const base = { threadId: "thread_1", createdAt: "2024-01-01T00:00:00.000Z" };

function makeState(overrides?: Partial<AgentState>): AgentState {
  return { ...createInitialState("thread_1"), ...overrides };
}

describe("reduceEvent", () => {
  describe("run.started", () => {
    it("sets status to running", () => {
      const next = reduceEvent(makeState(), { ...base, type: "run.started", runId: "run_1" });
      expect(next.status).toBe("running");
    });

    it("creates a run entry with running status", () => {
      const next = reduceEvent(makeState(), { ...base, type: "run.started", runId: "run_1" });
      expect(next.runs.run_1).toEqual({ id: "run_1", status: "running" });
    });

    it("appends event to events array", () => {
      const event = { ...base, type: "run.started" as const, runId: "run_1" };
      const next = reduceEvent(makeState(), event);
      expect(next.events).toContain(event);
    });

    it("preserves existing runs", () => {
      const state = makeState({ runs: { run_0: { id: "run_0", status: "completed" } } });
      const next = reduceEvent(state, { ...base, type: "run.started", runId: "run_1" });
      expect(next.runs.run_0).toEqual({ id: "run_0", status: "completed" });
      expect(next.runs.run_1).toBeDefined();
    });
  });

  describe("run.completed", () => {
    it("sets status to idle", () => {
      const state = makeState({ status: "running" });
      const next = reduceEvent(state, { ...base, type: "run.completed", runId: "run_1" });
      expect(next.status).toBe("idle");
    });

    it("marks run as completed", () => {
      const state = makeState({ runs: { run_1: { id: "run_1", status: "running" } } });
      const next = reduceEvent(state, { ...base, type: "run.completed", runId: "run_1" });
      expect(next.runs.run_1?.status).toBe("completed");
    });
  });

  describe("run.failed", () => {
    it("sets status to error", () => {
      const state = makeState({ status: "running" });
      const next = reduceEvent(state, {
        ...base,
        type: "run.failed",
        runId: "run_1",
        error: "timeout"
      });
      expect(next.status).toBe("error");
    });

    it("sets lastError to the error message", () => {
      const next = reduceEvent(makeState(), {
        ...base,
        type: "run.failed",
        runId: "run_1",
        error: "timeout"
      });
      expect(next.lastError).toBe("timeout");
    });

    it("marks run as failed with error", () => {
      const next = reduceEvent(makeState(), {
        ...base,
        type: "run.failed",
        runId: "run_1",
        error: "timeout"
      });
      expect(next.runs.run_1).toMatchObject({ id: "run_1", status: "failed", error: "timeout" });
    });
  });

  describe("message.created", () => {
    it("adds message to messages array", () => {
      const next = reduceEvent(makeState(), {
        ...base,
        type: "message.created",
        messageId: "msg_1",
        role: "user",
        content: "hello",
        runId: "run_1"
      });
      expect(next.messages).toHaveLength(1);
      expect(next.messages[0]).toMatchObject({ id: "msg_1", role: "user", content: "hello" });
    });

    it("preserves existing messages", () => {
      const state = makeState({
        messages: [{ id: "msg_0", role: "user", content: "prev", createdAt: base.createdAt }]
      });
      const next = reduceEvent(state, {
        ...base,
        type: "message.created",
        messageId: "msg_1",
        role: "assistant",
        content: "reply"
      });
      expect(next.messages).toHaveLength(2);
    });

    it("stores createdAt on message", () => {
      const next = reduceEvent(makeState(), {
        ...base,
        type: "message.created",
        messageId: "msg_1",
        role: "assistant",
        content: "hi"
      });
      expect(next.messages[0]?.createdAt).toBe(base.createdAt);
    });
  });

  describe("message.delta", () => {
    it("appends delta to existing message content", () => {
      const state = makeState({
        messages: [
          {
            id: "msg_1",
            role: "assistant",
            content: "Hello",
            runId: "run_1",
            createdAt: base.createdAt
          }
        ]
      });
      const next = reduceEvent(state, {
        ...base,
        type: "message.delta",
        messageId: "msg_1",
        delta: " world",
        runId: "run_1"
      });
      expect(next.messages[0]?.content).toBe("Hello world");
    });

    it("accumulates multiple deltas", () => {
      let state = makeState({
        messages: [
          { id: "msg_1", role: "assistant", content: "", runId: "run_1", createdAt: base.createdAt }
        ]
      });
      state = reduceEvent(state, {
        ...base,
        type: "message.delta",
        messageId: "msg_1",
        delta: "A",
        runId: "run_1"
      });
      state = reduceEvent(state, {
        ...base,
        type: "message.delta",
        messageId: "msg_1",
        delta: "B",
        runId: "run_1"
      });
      state = reduceEvent(state, {
        ...base,
        type: "message.delta",
        messageId: "msg_1",
        delta: "C",
        runId: "run_1"
      });
      expect(state.messages[0]?.content).toBe("ABC");
    });

    it("does nothing for unknown messageId", () => {
      const state = makeState({
        messages: [
          {
            id: "msg_1",
            role: "assistant",
            content: "Hello",
            runId: "run_1",
            createdAt: base.createdAt
          }
        ]
      });
      const next = reduceEvent(state, {
        ...base,
        type: "message.delta",
        messageId: "msg_unknown",
        delta: " world",
        runId: "run_1"
      });
      expect(next.messages[0]?.content).toBe("Hello");
    });
  });

  describe("tool.called", () => {
    it("creates a tool call entry with running status", () => {
      const next = reduceEvent(makeState(), {
        ...base,
        type: "tool.called",
        runId: "run_1",
        toolCallId: "tc_1",
        toolName: "search",
        input: { query: "cats" }
      });
      expect(next.toolCalls.tc_1).toMatchObject({
        id: "tc_1",
        runId: "run_1",
        name: "search",
        input: { query: "cats" },
        status: "running"
      });
    });
  });

  describe("tool.completed", () => {
    it("marks tool call as completed with output", () => {
      const state = makeState({
        toolCalls: {
          tc_1: { id: "tc_1", runId: "run_1", name: "search", input: {}, status: "running" }
        }
      });
      const next = reduceEvent(state, {
        ...base,
        type: "tool.completed",
        runId: "run_1",
        toolCallId: "tc_1",
        output: { results: [] }
      });
      expect(next.toolCalls.tc_1).toMatchObject({ status: "completed", output: { results: [] } });
    });

    it("handles completion for an entry not yet tracked, using fallback name", () => {
      const next = reduceEvent(makeState(), {
        ...base,
        type: "tool.completed",
        runId: "run_1",
        toolCallId: "tc_new",
        output: "result"
      });
      expect(next.toolCalls.tc_new?.status).toBe("completed");
      expect(next.toolCalls.tc_new?.name).toBe("tool");
    });
  });

  describe("tool.failed", () => {
    it("marks tool call as failed with error", () => {
      const state = makeState({
        toolCalls: {
          tc_1: { id: "tc_1", runId: "run_1", name: "search", input: {}, status: "running" }
        }
      });
      const next = reduceEvent(state, {
        ...base,
        type: "tool.failed",
        runId: "run_1",
        toolCallId: "tc_1",
        error: "not found"
      });
      expect(next.toolCalls.tc_1).toMatchObject({ status: "failed", error: "not found" });
    });

    it("handles failure for an entry not yet tracked, using fallback name", () => {
      const next = reduceEvent(makeState(), {
        ...base,
        type: "tool.failed",
        runId: "run_1",
        toolCallId: "tc_new",
        error: "boom"
      });
      expect(next.toolCalls.tc_new?.name).toBe("tool");
    });
  });

  describe("approval.requested", () => {
    it("creates an approval entry with pending status", () => {
      const next = reduceEvent(makeState(), {
        ...base,
        type: "approval.requested",
        runId: "run_1",
        approvalId: "ap_1",
        actionLabel: "Deploy to prod",
        reason: "critical change"
      });
      expect(next.approvals.ap_1).toEqual({
        id: "ap_1",
        runId: "run_1",
        actionLabel: "Deploy to prod",
        reason: "critical change",
        status: "pending"
      });
    });

    it("creates approval without optional reason", () => {
      const next = reduceEvent(makeState(), {
        ...base,
        type: "approval.requested",
        runId: "run_1",
        approvalId: "ap_1",
        actionLabel: "Delete records"
      });
      expect(next.approvals.ap_1?.reason).toBeUndefined();
      expect(next.approvals.ap_1?.status).toBe("pending");
    });
  });

  describe("approval.resolved", () => {
    it("updates approval to approved", () => {
      const state = makeState({
        approvals: {
          ap_1: { id: "ap_1", runId: "run_1", actionLabel: "Deploy", status: "pending" }
        }
      });
      const next = reduceEvent(state, {
        ...base,
        type: "approval.resolved",
        runId: "run_1",
        approvalId: "ap_1",
        decision: "approved"
      });
      expect(next.approvals.ap_1?.status).toBe("approved");
    });

    it("updates approval to rejected", () => {
      const state = makeState({
        approvals: {
          ap_1: { id: "ap_1", runId: "run_1", actionLabel: "Deploy", status: "pending" }
        }
      });
      const next = reduceEvent(state, {
        ...base,
        type: "approval.resolved",
        runId: "run_1",
        approvalId: "ap_1",
        decision: "rejected"
      });
      expect(next.approvals.ap_1?.status).toBe("rejected");
    });

    it("uses fallback actionLabel when entry is missing", () => {
      const next = reduceEvent(makeState(), {
        ...base,
        type: "approval.resolved",
        runId: "run_1",
        approvalId: "ap_new",
        decision: "approved"
      });
      expect(next.approvals.ap_new?.actionLabel).toBe("approval");
    });
  });

  describe("error", () => {
    it("sets status to error", () => {
      const state = makeState({ status: "running" });
      const next = reduceEvent(state, { ...base, type: "error", error: "network error" });
      expect(next.status).toBe("error");
    });

    it("sets lastError to the error message", () => {
      const next = reduceEvent(makeState(), { ...base, type: "error", error: "network error" });
      expect(next.lastError).toBe("network error");
    });
  });

  describe("immutability", () => {
    it("does not mutate the original state object", () => {
      const state = makeState();
      const statusBefore = state.status;
      const runsBefore = state.runs;
      reduceEvent(state, { ...base, type: "run.started", runId: "run_1" });
      expect(state.status).toBe(statusBefore);
      expect(state.runs).toBe(runsBefore);
    });

    it("does not mutate the original messages array", () => {
      const state = makeState();
      const messagesBefore = state.messages;
      reduceEvent(state, {
        ...base,
        type: "message.created",
        messageId: "msg_1",
        role: "user",
        content: "hi"
      });
      expect(state.messages).toBe(messagesBefore);
      expect(state.messages).toHaveLength(0);
    });
  });
});
