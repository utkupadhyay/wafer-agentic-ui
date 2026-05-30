import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { EmitEvent } from "@wafer/core";
import { createAgentClient } from "@wafer/react";
import { describe, expect, it, vi } from "vitest";
import { ApprovalPanel } from "../components/ApprovalPanel";
import { makeClient, makeWrapper } from "./helpers";

function makePendingTransport() {
  let capturedEmit!: EmitEvent;
  const transport = {
    sendUserMessage: vi.fn().mockImplementation((_input: unknown, emit: EmitEvent) => {
      capturedEmit = emit;
      return new Promise<void>(() => {});
    }),
    submitApproval: vi.fn().mockResolvedValue(undefined)
  };
  return { transport, getEmit: () => capturedEmit };
}

async function renderWithPendingApproval(actionLabel: string) {
  const { transport, getEmit } = makePendingTransport();
  const client = createAgentClient({ transport, threadId: "t1" });
  render(<ApprovalPanel />, { wrapper: makeWrapper(client) });

  await act(async () => {
    void client.sendUserMessage("trigger");
  });

  await act(async () => {
    getEmit()({
      type: "approval.requested",
      threadId: "t1",
      runId: "run_1",
      approvalId: "ap_1",
      actionLabel,
      createdAt: new Date().toISOString()
    });
  });

  return { transport };
}

describe("ApprovalPanel", () => {
  it("shows 'No pending approvals.' when there are none", () => {
    const client = makeClient();
    render(<ApprovalPanel />, { wrapper: makeWrapper(client) });
    expect(screen.getByText("No pending approvals.")).toBeInTheDocument();
  });

  it("renders Approve and Reject buttons for a pending approval", async () => {
    await renderWithPendingApproval("Deploy to prod");

    expect(screen.getByText("Deploy to prod")).toBeInTheDocument();
    expect(screen.getByText("Approve")).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();
  });

  it("calls resolveApproval with approved when Approve is clicked", async () => {
    const user = userEvent.setup();
    const { transport } = await renderWithPendingApproval("Delete records");

    await user.click(screen.getByText("Approve"));
    expect(transport.submitApproval).toHaveBeenCalledWith(
      expect.objectContaining({ approvalId: "ap_1", decision: "approved" }),
      expect.any(Function)
    );
  });

  it("calls resolveApproval with rejected when Reject is clicked", async () => {
    const user = userEvent.setup();
    const { transport } = await renderWithPendingApproval("Delete records");

    await user.click(screen.getByText("Reject"));
    expect(transport.submitApproval).toHaveBeenCalledWith(
      expect.objectContaining({ approvalId: "ap_1", decision: "rejected" }),
      expect.any(Function)
    );
  });
});
