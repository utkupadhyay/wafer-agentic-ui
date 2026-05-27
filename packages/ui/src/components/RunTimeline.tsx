import { useEffect, useMemo, useState } from "react";
import { useRunState } from "@wafer/react";
import { ToolCallCard } from "./ToolCallCard";
import { ToolCallDetailsModal } from "./ToolCallDetailsModal";
import { panelClass, sectionTitleClass, stateChipClass } from "./theme";

export function RunTimeline() {
  const { runs, toolCalls } = useRunState();
  const [selectedToolCallId, setSelectedToolCallId] = useState<string | null>(null);

  const selectedToolCall = useMemo(() => {
    if (!selectedToolCallId) {
      return null;
    }

    return toolCalls.find((toolCall) => toolCall.id === selectedToolCallId) ?? null;
  }, [selectedToolCallId, toolCalls]);

  useEffect(() => {
    if (!selectedToolCallId) {
      return;
    }

    const stillExists = toolCalls.some((toolCall) => toolCall.id === selectedToolCallId);
    if (!stillExists) {
      setSelectedToolCallId(null);
    }
  }, [selectedToolCallId, toolCalls]);

  return (
    <section className={panelClass}>
      <header className="mb-3 flex items-center justify-between gap-3">
        <h2 className={sectionTitleClass}>Run Timeline</h2>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className={sectionTitleClass}>Runs</h3>
          <ul className="mt-2 space-y-2">
            {runs.length === 0 ? (
              <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                No runs yet.
              </li>
            ) : null}
            {runs.map((run) => (
              <li
                key={run.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
              >
                <code className="text-slate-600">{run.id}</code>
                <span className={stateChipClass(run.status)}>{run.status}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={sectionTitleClass}>Tool Calls</h3>
          {toolCalls.length === 0 ? <p className="mt-2 text-sm text-slate-500">No tool activity yet.</p> : null}
          <div className="mt-2 space-y-2">
            {toolCalls.map((toolCall) => (
              <ToolCallCard
                key={toolCall.id}
                toolCall={toolCall}
                onViewDetails={(item) => setSelectedToolCallId(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
      <ToolCallDetailsModal toolCall={selectedToolCall} onClose={() => setSelectedToolCallId(null)} />
    </section>
  );
}
