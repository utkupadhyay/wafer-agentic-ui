import { useMemo } from "react";
import { useAgentClient } from "./useAgentClient";
import { useAgentState } from "./useAgentState";

export function useApprovals() {
  const client = useAgentClient();
  const state = useAgentState();

  const approvals = useMemo(() => Object.values(state.approvals), [state.approvals]);

  return {
    approvals,
    resolveApproval: (approvalId: string, runId: string, decision: "approved" | "rejected") =>
      client.resolveApproval(approvalId, runId, decision)
  };
}
