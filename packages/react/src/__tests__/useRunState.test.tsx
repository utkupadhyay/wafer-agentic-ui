import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useRunState } from "../hooks/useRunState";
import { makeClient, makeWrapper } from "./helpers";

describe("useRunState", () => {
  it("returns initial empty state", () => {
    const client = makeClient();
    const { result } = renderHook(() => useRunState(), { wrapper: makeWrapper(client) });
    expect(result.current.status).toBe("idle");
    expect(result.current.runs).toEqual([]);
    expect(result.current.toolCalls).toEqual([]);
  });

  it("reflects runs as an array after a message is sent", async () => {
    const client = makeClient();
    const { result } = renderHook(() => useRunState(), { wrapper: makeWrapper(client) });

    await act(async () => {
      await client.sendUserMessage("hello");
    });

    expect(result.current.runs).toHaveLength(1);
  });

  it("returns status running while transport is in-flight", async () => {
    const { createAgentClient } = await import("@wafer/core");
    let resolveTransport!: () => void;
    const transport = {
      sendUserMessage: () =>
        new Promise<void>((resolve) => {
          resolveTransport = resolve;
        })
    };
    const client = createAgentClient({ transport });
    const { result } = renderHook(() => useRunState(), { wrapper: makeWrapper(client) });

    act(() => {
      void client.sendUserMessage("hi");
    });

    expect(result.current.status).toBe("running");

    await act(async () => {
      resolveTransport();
    });
  });
});
