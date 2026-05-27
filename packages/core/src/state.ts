import type { AgentState } from "./types";

export function createInitialState(threadId: string): AgentState {
  return {
    threadId,
    status: "idle",
    events: [],
    messages: [],
    runs: {},
    toolCalls: {},
    approvals: {}
  };
}
