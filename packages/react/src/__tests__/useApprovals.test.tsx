import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useApprovals } from "../hooks/useApprovals";
import { makeClient, makeWrapper } from "./helpers";

describe("useApprovals", () => {
  it("returns empty approvals initially", () => {
    const client = makeClient();
    const { result } = renderHook(() => useApprovals(), { wrapper: makeWrapper(client) });
    expect(result.current.approvals).toEqual([]);
  });

  it("exposes a resolveApproval function", () => {
    const client = makeClient();
    const { result } = renderHook(() => useApprovals(), { wrapper: makeWrapper(client) });
    expect(typeof result.current.resolveApproval).toBe("function");
  });

  it("resolveApproval delegates to client.resolveApproval", async () => {
    const client = makeClient();
    const spy = vi.spyOn(client, "resolveApproval").mockResolvedValue(undefined);
    const { result } = renderHook(() => useApprovals(), { wrapper: makeWrapper(client) });

    await act(async () => {
      await result.current.resolveApproval("ap_1", "run_1", "approved");
    });

    expect(spy).toHaveBeenCalledWith("ap_1", "run_1", "approved");
  });
});
