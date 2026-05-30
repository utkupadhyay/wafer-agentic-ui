import type { AgentState } from "@wafer/react";
import { useEffect, useRef } from "react";
import { formatPayload } from "../utils/formatPayload";
import { buttonGhostClass, cardLabelClass, stateChipClass } from "./theme";
import { PayloadSection } from "./ui/PayloadSection";

type ToolCall = AgentState["toolCalls"][string];

interface ToolCallDetailsModalProps {
  toolCall: ToolCall | null;
  onClose: () => void;
}

export function ToolCallDetailsModal({ toolCall, onClose }: ToolCallDetailsModalProps) {
  const onCloseRef = useRef(onClose);
  // Update after commit so concurrent-mode thrown renders don't leave ref stale.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: primitive ID dep is intentional — avoids re-registering the listener on every status update while the modal is open
  useEffect(() => {
    if (!toolCall) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [toolCall?.id]);

  if (!toolCall) {
    return null;
  }

  return (
    <button
      type="button"
      className="fixed inset-0 z-1200 grid place-items-center bg-slate-900/45 p-4"
      aria-label="Close modal"
      onClick={onClose}
    >
      <article
        className="grid max-h-[84vh] w-full max-w-3xl gap-3 overflow-auto rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wafer-toolcall-modal-title"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className={cardLabelClass}>Tool Details</p>
            <h3
              id="wafer-toolcall-modal-title"
              className="mt-1 text-lg font-semibold text-slate-900"
            >
              {toolCall.name}
            </h3>
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

        <footer className="flex justify-end">
          <button className={buttonGhostClass} type="button" onClick={onClose}>
            Close
          </button>
        </footer>
      </article>
    </button>
  );
}
