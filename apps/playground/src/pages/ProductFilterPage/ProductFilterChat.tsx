import { AgentThread, Composer, RunTimeline } from "@wafer/ui";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  ollamaModel: string;
}

export function ProductFilterChat({ isOpen, onToggle, ollamaModel }: Props) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen ? (
        <section
          id="wafer-product-filter-chat"
          className="grid max-h-[80vh] w-[min(28rem,calc(100vw-2rem))] grid-rows-[auto_minmax(0,1fr)_auto_auto] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          aria-label="Product Filter Assistant"
        >
          <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                Filter Assistant
              </p>
              <h2 className="mt-1 text-sm font-semibold text-slate-900">Product Copilot</h2>
              <p className="text-xs text-slate-500">Local backend: Ollama ({ollamaModel})</p>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              aria-label="Close chat"
            >
              Close
            </button>
          </header>

          <div className="overflow-auto p-3">
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
            <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-slate-600">
              Tool activity
            </summary>
            <div className="border-t border-slate-200 p-3">
              <RunTimeline />
            </div>
          </details>
        </section>
      ) : null}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="wafer-product-filter-chat"
        className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-slate-700"
      >
        {isOpen ? "Hide Assistant" : "Filter Assistant"}
      </button>
    </div>
  );
}
