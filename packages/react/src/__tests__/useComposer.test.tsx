import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useComposer } from "../hooks/useComposer";
import { makeClient, makeWrapper } from "./helpers";

describe("useComposer", () => {
  it("initializes with empty input", () => {
    const client = makeClient();
    const { result } = renderHook(() => useComposer(), { wrapper: makeWrapper(client) });
    expect(result.current.input).toBe("");
  });

  it("isRunning is false initially", () => {
    const client = makeClient();
    const { result } = renderHook(() => useComposer(), { wrapper: makeWrapper(client) });
    expect(result.current.isRunning).toBe(false);
  });

  it("setInput updates the input value", () => {
    const client = makeClient();
    const { result } = renderHook(() => useComposer(), { wrapper: makeWrapper(client) });

    act(() => {
      result.current.setInput("hello");
    });

    expect(result.current.input).toBe("hello");
  });

  it("submit sends the current input and clears it", async () => {
    const sendUserMessage = vi
      .spyOn((await import("@wafer/core")).AgentClient.prototype, "sendUserMessage")
      .mockResolvedValue(undefined);

    const client = makeClient();
    const { result } = renderHook(() => useComposer(), { wrapper: makeWrapper(client) });

    act(() => {
      result.current.setInput("my message");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(sendUserMessage).toHaveBeenCalledWith("my message");
    expect(result.current.input).toBe("");

    sendUserMessage.mockRestore();
  });

  it("submit with explicit value overrides input state", async () => {
    const sendUserMessage = vi
      .spyOn((await import("@wafer/core")).AgentClient.prototype, "sendUserMessage")
      .mockResolvedValue(undefined);

    const client = makeClient();
    const { result } = renderHook(() => useComposer(), { wrapper: makeWrapper(client) });

    await act(async () => {
      await result.current.submit("explicit value");
    });

    expect(sendUserMessage).toHaveBeenCalledWith("explicit value");

    sendUserMessage.mockRestore();
  });

  it("submit does nothing when input is blank", async () => {
    const client = makeClient();
    const sendSpy = vi.spyOn(client, "sendUserMessage");
    const { result } = renderHook(() => useComposer(), { wrapper: makeWrapper(client) });

    await act(async () => {
      await result.current.submit();
    });

    expect(sendSpy).not.toHaveBeenCalled();
  });

  it("submit does nothing when explicit value is whitespace", async () => {
    const client = makeClient();
    const sendSpy = vi.spyOn(client, "sendUserMessage");
    const { result } = renderHook(() => useComposer(), { wrapper: makeWrapper(client) });

    await act(async () => {
      await result.current.submit("   ");
    });

    expect(sendSpy).not.toHaveBeenCalled();
  });
});
