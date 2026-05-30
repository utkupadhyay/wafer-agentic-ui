import { describe, expect, it } from "vitest";
import { createInitialState } from "../state";

describe("createInitialState", () => {
  it("sets the provided threadId", () => {
    const state = createInitialState("thread_abc");
    expect(state.threadId).toBe("thread_abc");
  });

  it("initializes status as idle", () => {
    const state = createInitialState("t");
    expect(state.status).toBe("idle");
  });

  it("initializes events as empty array", () => {
    expect(createInitialState("t").events).toEqual([]);
  });

  it("initializes messages as empty array", () => {
    expect(createInitialState("t").messages).toEqual([]);
  });

  it("initializes runs as empty object", () => {
    expect(createInitialState("t").runs).toEqual({});
  });

  it("initializes toolCalls as empty object", () => {
    expect(createInitialState("t").toolCalls).toEqual({});
  });

  it("initializes approvals as empty object", () => {
    expect(createInitialState("t").approvals).toEqual({});
  });

  it("has no lastError", () => {
    expect(createInitialState("t").lastError).toBeUndefined();
  });

  it("produces independent state objects for different threadIds", () => {
    const a = createInitialState("a");
    const b = createInitialState("b");
    expect(a.threadId).not.toBe(b.threadId);
    a.messages.push({ id: "x", role: "user", content: "hi", createdAt: "" });
    expect(b.messages).toHaveLength(0);
  });
});
