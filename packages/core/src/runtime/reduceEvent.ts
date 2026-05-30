import type { AgentEvent } from "@wafer/protocol";
import type { AgentState } from "../types";

function appendMessageContent(messages: AgentState["messages"], messageId: string, delta: string) {
  const nextMessages = [...messages];
  const index = nextMessages.findIndex((message) => message.id === messageId);

  if (index === -1) {
    return nextMessages;
  }

  const existing = nextMessages[index];
  if (!existing) {
    return nextMessages;
  }

  nextMessages[index] = {
    ...existing,
    content: `${existing.content}${delta}`
  };

  return nextMessages;
}

export function reduceEvent(state: AgentState, event: AgentEvent): AgentState {
  const baseState = {
    ...state,
    events: [...state.events, event]
  };

  switch (event.type) {
    case "run.started":
      return {
        ...baseState,
        status: "running",
        runs: {
          ...baseState.runs,
          [event.runId]: {
            id: event.runId,
            status: "running"
          }
        }
      };

    case "run.completed": {
      const completedRun = baseState.runs[event.runId];
      return {
        ...baseState,
        status: "idle",
        runs: {
          ...baseState.runs,
          [event.runId]: {
            id: event.runId,
            status: "completed",
            ...(completedRun?.error ? { error: completedRun.error } : {})
          }
        }
      };
    }

    case "run.failed": {
      const failedRun = baseState.runs[event.runId];
      return {
        ...baseState,
        status: "error",
        lastError: event.error,
        runs: {
          ...baseState.runs,
          [event.runId]: {
            id: event.runId,
            status: "failed",
            error: event.error ?? failedRun?.error
          }
        }
      };
    }

    case "message.created":
      return {
        ...baseState,
        messages: [
          ...baseState.messages,
          {
            id: event.messageId,
            role: event.role,
            content: event.content,
            runId: event.runId,
            createdAt: event.createdAt
          }
        ]
      };

    case "message.delta":
      return {
        ...baseState,
        messages: appendMessageContent(baseState.messages, event.messageId, event.delta)
      };

    case "tool.called":
      return {
        ...baseState,
        toolCalls: {
          ...baseState.toolCalls,
          [event.toolCallId]: {
            id: event.toolCallId,
            runId: event.runId,
            name: event.toolName,
            input: event.input,
            status: "running"
          }
        }
      };

    case "tool.completed":
      return {
        ...baseState,
        toolCalls: {
          ...baseState.toolCalls,
          [event.toolCallId]: {
            ...baseState.toolCalls[event.toolCallId],
            id: event.toolCallId,
            runId: event.runId,
            name: baseState.toolCalls[event.toolCallId]?.name ?? "tool",
            input: baseState.toolCalls[event.toolCallId]?.input,
            status: "completed",
            output: event.output
          }
        }
      };

    case "tool.failed":
      return {
        ...baseState,
        toolCalls: {
          ...baseState.toolCalls,
          [event.toolCallId]: {
            ...baseState.toolCalls[event.toolCallId],
            id: event.toolCallId,
            runId: event.runId,
            name: baseState.toolCalls[event.toolCallId]?.name ?? "tool",
            input: baseState.toolCalls[event.toolCallId]?.input,
            status: "failed",
            error: event.error
          }
        }
      };

    case "approval.requested":
      return {
        ...baseState,
        approvals: {
          ...baseState.approvals,
          [event.approvalId]: {
            id: event.approvalId,
            runId: event.runId,
            actionLabel: event.actionLabel,
            reason: event.reason,
            status: "pending"
          }
        }
      };

    case "approval.resolved":
      return {
        ...baseState,
        approvals: {
          ...baseState.approvals,
          [event.approvalId]: {
            ...baseState.approvals[event.approvalId],
            id: event.approvalId,
            runId: event.runId,
            actionLabel: baseState.approvals[event.approvalId]?.actionLabel ?? "approval",
            status: event.decision
          }
        }
      };

    case "error":
      return {
        ...baseState,
        status: "error",
        lastError: event.error
      };

    default:
      return baseState;
  }
}
