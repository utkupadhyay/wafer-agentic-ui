import type { AgentState } from "@wafer/react";
import { formatPayload } from "../utils/formatPayload";
import { buttonGhostClass, cardLabelClass, stateChipClass, toolCallCardClass } from "./theme";
import { PayloadSection } from "./ui/PayloadSection";

type ToolCall = AgentState["toolCalls"][string];

interface ToolCallCardProps {
  toolCall: ToolCall;
  onViewDetails?: (toolCall: ToolCall) => void;
}

export function ToolCallCard({ toolCall, onViewDetails }: ToolCallCardProps) {
  return (
    <article className={toolCallCardClass(toolCall.status)}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className={cardLabelClass}>Tool</p>
          <h4 className="mt-1 text-sm font-semibold text-slate-900">{toolCall.name}</h4>
          <p className="text-xs text-slate-500">run: {toolCall.runId}</p>
        </div>
        <span className={stateChipClass(toolCall.status)}>{toolCall.status}</span>
      </header>

      <PayloadSection label="Input" content={formatPayload(toolCall.input)} />

      {toolCall.status === "completed" ? (
        <PayloadSection label="Output" content={formatPayload(toolCall.output)} />
      ) : null}

      {toolCall.status === "failed" ? (
        <PayloadSection label="Error" content={toolCall.error ?? "Unknown tool error."} error />
      ) : null}

      {onViewDetails ? (
        <div className="flex justify-end">
          <button
            className={buttonGhostClass}
            type="button"
            onClick={() => onViewDetails(toolCall)}
          >
            View details
          </button>
        </div>
      ) : null}
    </article>
  );
}
