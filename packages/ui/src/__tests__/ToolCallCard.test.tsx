import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AgentState } from "@wafer/react";
import { describe, expect, it, vi } from "vitest";
import { ToolCallCard } from "../components/ToolCallCard";

type ToolCall = AgentState["toolCalls"][string];

function makeToolCall(overrides?: Partial<ToolCall>): ToolCall {
  return {
    id: "tc_1",
    runId: "run_1",
    name: "my_tool",
    input: { query: "cats" },
    status: "running",
    ...overrides
  };
}

describe("ToolCallCard", () => {
  it("renders the tool name", () => {
    render(<ToolCallCard toolCall={makeToolCall()} />);
    expect(screen.getByText("my_tool")).toBeInTheDocument();
  });

  it("renders the run id", () => {
    render(<ToolCallCard toolCall={makeToolCall()} />);
    expect(screen.getByText(/run_1/)).toBeInTheDocument();
  });

  it("renders the status chip", () => {
    render(<ToolCallCard toolCall={makeToolCall({ status: "running" })} />);
    expect(screen.getByText("running")).toBeInTheDocument();
  });

  it("renders input payload", () => {
    render(<ToolCallCard toolCall={makeToolCall({ input: { query: "cats" } })} />);
    expect(screen.getByText(/cats/)).toBeInTheDocument();
  });

  it("renders output section when status is completed", () => {
    render(
      <ToolCallCard
        toolCall={makeToolCall({ status: "completed", output: { results: ["cat1"] } })}
      />
    );
    expect(screen.getByText(/cat1/)).toBeInTheDocument();
  });

  it("does not render output section when status is running", () => {
    render(<ToolCallCard toolCall={makeToolCall({ status: "running" })} />);
    expect(screen.queryByText(/Output/)).not.toBeInTheDocument();
  });

  it("renders error section when status is failed", () => {
    render(
      <ToolCallCard toolCall={makeToolCall({ status: "failed", error: "something broke" })} />
    );
    expect(screen.getByText(/something broke/)).toBeInTheDocument();
  });

  it("renders View details button when onViewDetails is provided", () => {
    const onViewDetails = vi.fn();
    render(<ToolCallCard toolCall={makeToolCall()} onViewDetails={onViewDetails} />);
    expect(screen.getByText("View details")).toBeInTheDocument();
  });

  it("does not render View details button when onViewDetails is not provided", () => {
    render(<ToolCallCard toolCall={makeToolCall()} />);
    expect(screen.queryByText("View details")).not.toBeInTheDocument();
  });

  it("calls onViewDetails when View details is clicked", async () => {
    const user = userEvent.setup();
    const onViewDetails = vi.fn();
    const toolCall = makeToolCall();
    render(<ToolCallCard toolCall={toolCall} onViewDetails={onViewDetails} />);
    await user.click(screen.getByText("View details"));
    expect(onViewDetails).toHaveBeenCalledWith(toolCall);
  });
});
