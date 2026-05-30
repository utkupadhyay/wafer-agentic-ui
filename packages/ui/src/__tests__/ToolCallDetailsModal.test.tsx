import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AgentState } from "@wafer/react";
import { describe, expect, it, vi } from "vitest";
import { ToolCallDetailsModal } from "../components/ToolCallDetailsModal";

type ToolCall = AgentState["toolCalls"][string];

function makeToolCall(overrides?: Partial<ToolCall>): ToolCall {
  return {
    id: "tc_1",
    runId: "run_1",
    name: "search",
    input: { query: "test" },
    status: "running",
    ...overrides
  };
}

describe("ToolCallDetailsModal", () => {
  it("renders nothing when toolCall is null", () => {
    const { container } = render(<ToolCallDetailsModal toolCall={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the tool name when a toolCall is provided", () => {
    render(<ToolCallDetailsModal toolCall={makeToolCall()} onClose={vi.fn()} />);
    expect(screen.getByText("search")).toBeInTheDocument();
  });

  it("renders the run ID", () => {
    render(<ToolCallDetailsModal toolCall={makeToolCall()} onClose={vi.fn()} />);
    expect(screen.getByText(/run_1/)).toBeInTheDocument();
  });

  it("renders the status chip", () => {
    render(
      <ToolCallDetailsModal toolCall={makeToolCall({ status: "completed" })} onClose={vi.fn()} />
    );
    expect(screen.getByText("completed")).toBeInTheDocument();
  });

  it("renders output section when status is completed", () => {
    render(
      <ToolCallDetailsModal
        toolCall={makeToolCall({ status: "completed", output: { answer: 42 } })}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it("renders error section when status is failed", () => {
    render(
      <ToolCallDetailsModal
        toolCall={makeToolCall({ status: "failed", error: "tool exploded" })}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText(/tool exploded/)).toBeInTheDocument();
  });

  it("calls onClose when Close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ToolCallDetailsModal toolCall={makeToolCall()} onClose={onClose} />);
    await user.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ToolCallDetailsModal toolCall={makeToolCall()} onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ToolCallDetailsModal toolCall={makeToolCall()} onClose={onClose} />);
    await user.click(screen.getByLabelText("Close modal"));
    expect(onClose).toHaveBeenCalled();
  });
});
