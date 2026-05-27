import { useMemo } from "react";
import { useAgentState } from "./useAgentState";

export function useThread() {
  const state = useAgentState();

  return useMemo(
    () => ({
      threadId: state.threadId,
      messages: state.messages,
      status: state.status,
      lastError: state.lastError
    }),
    [state.lastError, state.messages, state.status, state.threadId]
  );
}
