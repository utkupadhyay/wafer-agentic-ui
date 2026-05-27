export type MessageRole = "system" | "user" | "assistant" | "tool";

export interface BaseAgentEvent {
  threadId: string;
  createdAt: string;
}

export interface RunStartedEvent extends BaseAgentEvent {
  type: "run.started";
  runId: string;
}

export interface RunCompletedEvent extends BaseAgentEvent {
  type: "run.completed";
  runId: string;
}

export interface RunFailedEvent extends BaseAgentEvent {
  type: "run.failed";
  runId: string;
  error: string;
}

export interface MessageCreatedEvent extends BaseAgentEvent {
  type: "message.created";
  messageId: string;
  role: MessageRole;
  content: string;
  runId?: string;
}

export interface MessageDeltaEvent extends BaseAgentEvent {
  type: "message.delta";
  messageId: string;
  delta: string;
  runId: string;
}

export interface ToolCalledEvent extends BaseAgentEvent {
  type: "tool.called";
  runId: string;
  toolCallId: string;
  toolName: string;
  input: unknown;
}

export interface ToolCompletedEvent extends BaseAgentEvent {
  type: "tool.completed";
  runId: string;
  toolCallId: string;
  output: unknown;
}

export interface ToolFailedEvent extends BaseAgentEvent {
  type: "tool.failed";
  runId: string;
  toolCallId: string;
  error: string;
}

export interface ApprovalRequestedEvent extends BaseAgentEvent {
  type: "approval.requested";
  runId: string;
  approvalId: string;
  actionLabel: string;
  reason?: string;
}

export interface ApprovalResolvedEvent extends BaseAgentEvent {
  type: "approval.resolved";
  runId: string;
  approvalId: string;
  decision: "approved" | "rejected";
}

export interface ErrorEvent extends BaseAgentEvent {
  type: "error";
  error: string;
}

export type AgentEvent =
  | RunStartedEvent
  | RunCompletedEvent
  | RunFailedEvent
  | MessageCreatedEvent
  | MessageDeltaEvent
  | ToolCalledEvent
  | ToolCompletedEvent
  | ToolFailedEvent
  | ApprovalRequestedEvent
  | ApprovalResolvedEvent
  | ErrorEvent;
