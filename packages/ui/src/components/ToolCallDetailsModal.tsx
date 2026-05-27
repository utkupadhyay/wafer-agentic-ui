import { useEffect } from "react";
import type { AgentState } from "@wafer/react";
import { buttonGhostClass, cardLabelClass, codeBlockClass, stateChipClass } from "./theme";

type ToolCall = AgentState["toolCalls"][string];

interface ToolCallDetailsModalProps {
  toolCall: ToolCall | null;
  onClose: () => void;
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

export function ToolCallDetailsModal({ toolCall, onClose }: ToolCallDetailsModalProps) {
  useEffect(() => {
    if (!toolCall) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [toolCall, onClose]);

  if (!toolCall) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1200] grid place-items-center bg-slate-900/45 p-4"
      role="presentation"
      onClick={onClose}
    >
      <article
        className="grid max-h-[84vh] w-full max-w-3xl gap-3 overflow-auto rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wafer-toolcall-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className={cardLabelClass}>Tool Details</p>
            <h3 id="wafer-toolcall-modal-title" className="mt-1 text-lg font-semibold text-slate-900">
              {toolCall.name}
            </h3>
            <p className="text-xs text-slate-500">run: {toolCall.runId}</p>
          </div>
          <span className={stateChipClass(toolCall.status)}>{toolCall.status}</span>
        </header>

        <section className="grid gap-1.5">
          <p className={cardLabelClass}>Input</p>
          <pre className={codeBlockClass}>{formatPayload(toolCall.input)}</pre>
        </section>

        {toolCall.status === "completed" ? (
          <section className="grid gap-1.5">
            <p className={cardLabelClass}>Output</p>
            <pre className={codeBlockClass}>{formatPayload(toolCall.output)}</pre>
          </section>
        ) : null}

        {toolCall.status === "failed" ? (
          <section className="grid gap-1.5">
            <p className={cardLabelClass}>Error</p>
            <pre className={`${codeBlockClass} text-rose-600`}>{toolCall.error ?? "Unknown tool error."}</pre>
          </section>
        ) : null}

        <footer className="flex justify-end">
          <button className={buttonGhostClass} type="button" onClick={onClose}>
            Close
          </button>
        </footer>
      </article>
    </div>
  );
}
