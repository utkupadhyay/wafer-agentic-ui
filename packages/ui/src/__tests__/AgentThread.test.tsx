import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AgentThread } from "../components/AgentThread";
import { makeClient, makeWrapper } from "./helpers";

describe("AgentThread", () => {
  it("shows default empty state message", () => {
    const client = makeClient();
    render(<AgentThread />, { wrapper: makeWrapper(client) });
    expect(screen.getByText("Say hi to your local Ollama agent.")).toBeInTheDocument();
  });

  it("shows custom emptyStateMessage", () => {
    const client = makeClient();
    render(<AgentThread emptyStateMessage="No messages yet." />, { wrapper: makeWrapper(client) });
    expect(screen.getByText("No messages yet.")).toBeInTheDocument();
  });

  it("shows contextHint when provided", () => {
    const client = makeClient();
    render(<AgentThread contextHint="Ask me anything." />, { wrapper: makeWrapper(client) });
    expect(screen.getByText("Ask me anything.")).toBeInTheDocument();
  });

  it("does not show contextHint when not provided", () => {
    const client = makeClient();
    render(<AgentThread />, { wrapper: makeWrapper(client) });
    expect(screen.queryByText("Ask me anything.")).not.toBeInTheDocument();
  });

  it("renders custom title", () => {
    const client = makeClient();
    render(<AgentThread title="My Thread" />, { wrapper: makeWrapper(client) });
    expect(screen.getByText("My Thread")).toBeInTheDocument();
  });

  it("renders a user message after it is sent", async () => {
    const client = makeClient();
    render(<AgentThread />, { wrapper: makeWrapper(client) });

    await act(async () => {
      await client.sendUserMessage("hello agent");
    });

    expect(screen.getByText("hello agent")).toBeInTheDocument();
  });

  it("shows status badge", () => {
    const client = makeClient();
    render(<AgentThread />, { wrapper: makeWrapper(client) });
    expect(screen.getByText("idle")).toBeInTheDocument();
  });

  it("shows error message when lastError is set", async () => {
    const { createAgentClient } = await import("@wafer/react");
    const transport = {
      sendUserMessage: async () => {
        throw new Error("connection refused");
      }
    };
    const client = createAgentClient({ transport });
    render(<AgentThread />, { wrapper: makeWrapper(client) });

    await act(async () => {
      await client.sendUserMessage("hi");
    });

    expect(screen.getByText(/connection refused/)).toBeInTheDocument();
  });
});
