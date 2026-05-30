import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAgentState } from "../hooks/useAgentState";
import { makeClient, makeWrapper } from "./helpers";

describe("useAgentState", () => {
  it("returns the initial agent state", () => {
    const client = makeClient("thread_test");
    const { result } = renderHook(() => useAgentState(), { wrapper: makeWrapper(client) });
    expect(result.current.status).toBe("idle");
    expect(result.current.threadId).toBe("thread_test");
    expect(result.current.messages).toEqual([]);
  });

  it("updates when client state changes", async () => {
    const client = makeClient();
    const { result } = renderHook(() => useAgentState(), { wrapper: makeWrapper(client) });

    await act(async () => {
      await client.sendUserMessage("hello");
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({ role: "user", content: "hello" });
  });
});
