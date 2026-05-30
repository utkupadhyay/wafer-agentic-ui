import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RunTimeline } from "../components/RunTimeline";
import { makeClient, makeWrapper } from "./helpers";

describe("RunTimeline", () => {
  it("shows 'No runs yet.' when empty", () => {
    const client = makeClient();
    render(<RunTimeline />, { wrapper: makeWrapper(client) });
    expect(screen.getByText("No runs yet.")).toBeInTheDocument();
  });

  it("shows 'No tool activity yet.' when empty", () => {
    const client = makeClient();
    render(<RunTimeline />, { wrapper: makeWrapper(client) });
    expect(screen.getByText("No tool activity yet.")).toBeInTheDocument();
  });

  it("shows a run entry after sendUserMessage", async () => {
    const client = makeClient();
    render(<RunTimeline />, { wrapper: makeWrapper(client) });

    await act(async () => {
      await client.sendUserMessage("trigger a run");
    });

    const runEntries = screen.getAllByRole("listitem");
    expect(runEntries.length).toBeGreaterThan(0);
  });

  it("does not render modal initially", () => {
    const client = makeClient();
    render(<RunTimeline />, { wrapper: makeWrapper(client) });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
