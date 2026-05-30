import type { AgentState } from "@wafer/react";

type AgentStatus = AgentState["status"];
type RunStatus = AgentState["runs"][string]["status"];
type ToolCallStatus = AgentState["toolCalls"][string]["status"];
type ApprovalStatus = AgentState["approvals"][string]["status"];
type MessageRole = AgentState["messages"][number]["role"];

const toneClassByStatus = {
  idle: "border-slate-200 bg-slate-100 text-slate-700",
  running: "border-amber-200 bg-amber-100 text-amber-800",
  completed: "border-emerald-200 bg-emerald-100 text-emerald-800",
  approved: "border-emerald-200 bg-emerald-100 text-emerald-800",
  failed: "border-rose-200 bg-rose-100 text-rose-700",
  rejected: "border-rose-200 bg-rose-100 text-rose-700",
  error: "border-rose-200 bg-rose-100 text-rose-700",
  pending: "border-sky-200 bg-sky-100 text-sky-800"
} as const;

const messageToneByRole: Record<MessageRole, string> = {
  user: "border-blue-200 bg-blue-50",
  assistant: "border-violet-200 bg-violet-50",
  system: "border-slate-300 bg-slate-50 border-dashed",
  tool: "border-amber-200 bg-amber-50 border-dashed"
};

export const panelClass = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm";

export const sectionTitleClass = "text-xs font-semibold uppercase tracking-wide text-slate-500";

export const cardLabelClass = "text-[11px] font-semibold uppercase tracking-wide text-slate-500";

export const codeBlockClass =
  "overflow-x-auto rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-700";

export const buttonGhostClass =
  "inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

export function statusBadgeClass(status: AgentStatus) {
  return `inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${toneClassByStatus[status]}`;
}

export function stateChipClass(status: RunStatus | ToolCallStatus | ApprovalStatus) {
  return `inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${toneClassByStatus[status]}`;
}

export function messageCardClass(role: MessageRole) {
  return `rounded-lg border px-3 py-2 ${messageToneByRole[role]}`;
}

export function toolCallCardClass(status: ToolCallStatus) {
  const borderTone = {
    running: "border-amber-200",
    completed: "border-emerald-200",
    failed: "border-rose-200"
  } as const;

  return `rounded-lg border bg-white p-3 shadow-sm ${borderTone[status]}`;
}
