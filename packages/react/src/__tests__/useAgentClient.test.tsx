import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAgentClient } from "../hooks/useAgentClient";
import { makeClient, makeWrapper } from "./helpers";

describe("useAgentClient", () => {
  it("throws when used outside AgentProvider", () => {
    expect(() => renderHook(() => useAgentClient())).toThrow(
      "useAgentClient must be used inside <AgentProvider />"
    );
  });

  it("returns the client when inside AgentProvider", () => {
    const client = makeClient();
    const { result } = renderHook(() => useAgentClient(), { wrapper: makeWrapper(client) });
    expect(result.current).toBe(client);
  });
});
