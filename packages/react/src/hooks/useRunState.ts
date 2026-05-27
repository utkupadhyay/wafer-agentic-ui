import { useMemo } from "react";
import { useAgentState } from "./useAgentState";

export function useRunState() {
  const state = useAgentState();

  return useMemo(
    () => ({
      status: state.status,
      runs: Object.values(state.runs),
      toolCalls: Object.values(state.toolCalls)
    }),
    [state.runs, state.status, state.toolCalls]
  );
}
