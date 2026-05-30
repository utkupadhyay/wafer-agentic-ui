import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useThread } from "../hooks/useThread";
import { makeClient, makeWrapper } from "./helpers";

describe("useThread", () => {
  it("returns initial thread state", () => {
    const client = makeClient("thread_test");
    const { result } = renderHook(() => useThread(), { wrapper: makeWrapper(client) });
    expect(result.current.threadId).toBe("thread_test");
    expect(result.current.status).toBe("idle");
    expect(result.current.messages).toEqual([]);
    expect(result.current.lastError).toBeUndefined();
  });

  it("reflects messages after sendUserMessage", async () => {
    const client = makeClient();
    const { result } = renderHook(() => useThread(), { wrapper: makeWrapper(client) });

    await act(async () => {
      await client.sendUserMessage("test message");
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]?.content).toBe("test message");
  });

  it("reflects error status when transport throws", async () => {
    const { createAgentClient } = await import("@wafer/core");
    const transport = {
      sendUserMessage: async () => {
        throw new Error("boom");
      }
    };
    const client = createAgentClient({ transport });
    const { result } = renderHook(() => useThread(), { wrapper: makeWrapper(client) });

    await act(async () => {
      await client.sendUserMessage("hi");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.lastError).toBe("boom");
  });
});
