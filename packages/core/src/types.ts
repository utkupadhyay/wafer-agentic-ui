import type { AgentEvent, MessageRole } from "@wafer/protocol";

export type AgentStatus = "idle" | "running" | "error";

export interface ThreadMessage {
  id: string;
  role: MessageRole;
  content: string;
  runId?: string;
  createdAt: string;
}

export interface ToolCallState {
  id: string;
  runId: string;
  name: string;
  input: unknown;
  output?: unknown;
  status: "running" | "completed" | "failed";
  error?: string;
}

export interface ApprovalState {
  id: string;
  runId: string;
  actionLabel: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
}

export interface RunState {
  id: string;
  status: "running" | "completed" | "failed";
  error?: string;
}

export interface AgentState {
  threadId: string;
  status: AgentStatus;
  events: AgentEvent[];
  messages: ThreadMessage[];
  runs: Record<string, RunState>;
  toolCalls: Record<string, ToolCallState>;
  approvals: Record<string, ApprovalState>;
  lastError?: string;
}

export interface SendUserMessageInput {
  threadId: string;
  runId: string;
  messageId: string;
  text: string;
  history: Array<{
    role: MessageRole;
    content: string;
  }>;
}

export interface SubmitApprovalInput {
  threadId: string;
  runId: string;
  approvalId: string;
  decision: "approved" | "rejected";
  history: Array<{
    role: MessageRole;
    content: string;
  }>;
}

export type EmitEvent = (event: AgentEvent) => void;

export interface AgentTransport {
  sendUserMessage(input: SendUserMessageInput, emit: EmitEvent): Promise<void>;
  submitApproval?(input: SubmitApprovalInput, emit: EmitEvent): Promise<void>;
}
