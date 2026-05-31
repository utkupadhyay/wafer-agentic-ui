// Core types
export type { AgentClient, AgentState, AgentTransport } from "@wafer/core";

// React layer
export {
  AgentProvider,
  createAgentClient,
  useAgentClient,
  useAgentState,
  useApprovals,
  useComposer,
  useRunState,
  useThread
} from "@wafer/react";

// Pre-built UI components
export {
  AgentThread,
  ApprovalPanel,
  Composer,
  RunTimeline,
  StatusBadge,
  ToolCallCard,
  ToolCallDetailsModal
} from "@wafer/ui";
