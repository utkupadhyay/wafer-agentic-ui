import type { AgentState } from "@wafer/react";
import {
  buttonGhostClass,
  cardLabelClass,
  codeBlockClass,
  stateChipClass,
  toolCallCardClass
} from "./theme";

type ToolCall = AgentState["toolCalls"][string];

interface ToolCallCardProps {
  toolCall: ToolCall;
  onViewDetails?: (toolCall: ToolCall) => void;
}

function formatPayload(value: unknown) {
  if (value === undefined) {
    return "No data";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function ToolCallCard({ toolCall, onViewDetails }: ToolCallCardProps) {
  const input = formatPayload(toolCall.input);
  const output = formatPayload(toolCall.output);

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

      <section className="grid gap-1.5">
        <p className={cardLabelClass}>Input</p>
        <pre className={codeBlockClass}>{input}</pre>
      </section>

      {toolCall.status === "completed" ? (
        <section className="grid gap-1.5">
          <p className={cardLabelClass}>Output</p>
          <pre className={codeBlockClass}>{output}</pre>
        </section>
      ) : null}

      {toolCall.status === "failed" ? (
        <section className="grid gap-1.5">
          <p className={cardLabelClass}>Error</p>
          <pre className={`${codeBlockClass} text-rose-600`}>{toolCall.error ?? "Unknown tool error."}</pre>
        </section>
      ) : null}

      {onViewDetails ? (
        <div className="flex justify-end">
          <button className={buttonGhostClass} type="button" onClick={() => onViewDetails(toolCall)}>
            View details
          </button>
        </div>
      ) : null}
    </article>
  );
}
