import { describe, expect, it } from "vitest";
import { agentEventSchema, eventBatchSchema } from "../schemas";

const base = { threadId: "thread_1", createdAt: "2024-01-01T00:00:00.000Z" };

describe("agentEventSchema", () => {
  it("validates run.started", () => {
    expect(
      agentEventSchema.safeParse({ ...base, type: "run.started", runId: "run_1" }).success
    ).toBe(true);
  });

  it("validates run.completed", () => {
    expect(
      agentEventSchema.safeParse({ ...base, type: "run.completed", runId: "run_1" }).success
    ).toBe(true);
  });

  it("validates run.failed", () => {
    expect(
      agentEventSchema.safeParse({ ...base, type: "run.failed", runId: "run_1", error: "timeout" })
        .success
    ).toBe(true);
  });

  it("validates message.created with role user", () => {
    expect(
      agentEventSchema.safeParse({
        ...base,
        type: "message.created",
        messageId: "msg_1",
        role: "user",
        content: "hello"
      }).success
    ).toBe(true);
  });

  it("validates message.created with optional runId", () => {
    const result = agentEventSchema.safeParse({
      ...base,
      type: "message.created",
      messageId: "msg_1",
      role: "assistant",
      content: "hi",
      runId: "run_1"
    });
    expect(result.success).toBe(true);
  });

  it("validates message.delta", () => {
    expect(
      agentEventSchema.safeParse({
        ...base,
        type: "message.delta",
        messageId: "msg_1",
        delta: " world",
        runId: "run_1"
      }).success
    ).toBe(true);
  });

  it("validates tool.called", () => {
    expect(
      agentEventSchema.safeParse({
        ...base,
        type: "tool.called",
        runId: "run_1",
        toolCallId: "tc_1",
        toolName: "search",
        input: { query: "cats" }
      }).success
    ).toBe(true);
  });

  it("validates tool.completed", () => {
    expect(
      agentEventSchema.safeParse({
        ...base,
        type: "tool.completed",
        runId: "run_1",
        toolCallId: "tc_1",
        output: { results: [] }
      }).success
    ).toBe(true);
  });

  it("validates tool.failed", () => {
    expect(
      agentEventSchema.safeParse({
        ...base,
        type: "tool.failed",
        runId: "run_1",
        toolCallId: "tc_1",
        error: "not found"
      }).success
    ).toBe(true);
  });

  it("validates approval.requested without reason", () => {
    expect(
      agentEventSchema.safeParse({
        ...base,
        type: "approval.requested",
        runId: "run_1",
        approvalId: "ap_1",
        actionLabel: "Deploy"
      }).success
    ).toBe(true);
  });

  it("validates approval.requested with reason", () => {
    expect(
      agentEventSchema.safeParse({
        ...base,
        type: "approval.requested",
        runId: "run_1",
        approvalId: "ap_1",
        actionLabel: "Deploy",
        reason: "critical path"
      }).success
    ).toBe(true);
  });

  it("validates approval.resolved with approved", () => {
    expect(
      agentEventSchema.safeParse({
        ...base,
        type: "approval.resolved",
        runId: "run_1",
        approvalId: "ap_1",
        decision: "approved"
      }).success
    ).toBe(true);
  });

  it("validates approval.resolved with rejected", () => {
    expect(
      agentEventSchema.safeParse({
        ...base,
        type: "approval.resolved",
        runId: "run_1",
        approvalId: "ap_1",
        decision: "rejected"
      }).success
    ).toBe(true);
  });

  it("validates error event", () => {
    expect(
      agentEventSchema.safeParse({ ...base, type: "error", error: "network error" }).success
    ).toBe(true);
  });

  it("rejects unknown event type", () => {
    expect(agentEventSchema.safeParse({ ...base, type: "unknown.type" }).success).toBe(false);
  });

  it("rejects run.started missing runId", () => {
    expect(agentEventSchema.safeParse({ ...base, type: "run.started" }).success).toBe(false);
  });

  it("rejects message.created with invalid role", () => {
    expect(
      agentEventSchema.safeParse({
        ...base,
        type: "message.created",
        messageId: "msg_1",
        role: "robot",
        content: "hi"
      }).success
    ).toBe(false);
  });

  it("rejects approval.resolved with invalid decision", () => {
    expect(
      agentEventSchema.safeParse({
        ...base,
        type: "approval.resolved",
        runId: "run_1",
        approvalId: "ap_1",
        decision: "maybe"
      }).success
    ).toBe(false);
  });

  it("rejects event missing threadId", () => {
    expect(
      agentEventSchema.safeParse({ type: "run.started", runId: "run_1", createdAt: base.createdAt })
        .success
    ).toBe(false);
  });

  it("rejects event missing createdAt", () => {
    expect(
      agentEventSchema.safeParse({ type: "run.started", runId: "run_1", threadId: base.threadId })
        .success
    ).toBe(false);
  });
});

describe("eventBatchSchema", () => {
  it("validates an array of events", () => {
    expect(
      eventBatchSchema.safeParse([
        { ...base, type: "run.started", runId: "run_1" },
        { ...base, type: "run.completed", runId: "run_1" }
      ]).success
    ).toBe(true);
  });

  it("validates an empty array", () => {
    expect(eventBatchSchema.safeParse([]).success).toBe(true);
  });

  it("rejects non-array input", () => {
    expect(eventBatchSchema.safeParse("not an array").success).toBe(false);
  });

  it("rejects array with invalid event", () => {
    expect(eventBatchSchema.safeParse([{ ...base, type: "bogus" }]).success).toBe(false);
  });
});
