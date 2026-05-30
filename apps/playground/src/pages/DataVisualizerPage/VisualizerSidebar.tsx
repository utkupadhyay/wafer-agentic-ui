import { AgentThread, Composer, RunTimeline } from "@wafer/ui";

interface Props {
  ollamaModel: string;
}

export function VisualizerSidebar({ ollamaModel }: Props) {
  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Analytics Copilot
        </p>
        <p className="mt-0.5 text-xs text-slate-500">Local · Ollama · {ollamaModel}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <AgentThread
          title="Analytics Assistant Thread"
          contextHint="Ask questions in plain English — the agent renders charts by calling tools."
          emptyStateMessage="Try: 'Show revenue by category' or 'Which region had the most refunds?'"
        />
      </div>

      <div className="border-t border-slate-200 bg-white p-3">
        <Composer
          label="Analytics Query"
          placeholder="e.g. Show revenue by category as a bar chart…"
        />
      </div>

      <details className="border-t border-slate-200 bg-slate-50">
        <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-slate-500 transition hover:text-slate-700">
          Tool activity
        </summary>
        <div className="border-t border-slate-200 p-3">
          <RunTimeline />
        </div>
      </details>
    </aside>
  );
}
