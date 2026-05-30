import { AgentThread, Composer, RunTimeline } from "@wafer/ui";

interface Props {
  ollamaModel: string;
}

export function ProductFilterSidebar({ ollamaModel }: Props) {
  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
          Filter Assistant
        </p>
        <p className="mt-0.5 text-xs text-slate-500">Local · Ollama · {ollamaModel}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <AgentThread
          title="Product Filter Thread"
          contextHint="Describe what you're looking for and I'll filter the grid via tool calls."
          emptyStateMessage="Try: 'Show red dresses under $80' or 'only in-stock items sorted by rating'"
        />
      </div>

      <div className="border-t border-slate-200 bg-white p-3">
        <Composer
          label="What are you looking for?"
          placeholder="e.g. Blue tops in size S or M, under $50…"
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
