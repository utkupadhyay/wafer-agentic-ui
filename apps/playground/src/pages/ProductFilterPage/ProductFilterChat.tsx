import { AgentThread, Composer } from "@wafer/ui";

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
          className="grid max-h-[80vh] w-[min(28rem,calc(100vw-2rem))] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
          aria-label="Product Filter Assistant"
        >
          <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3 dark:border-white/10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-400">
                Filter Assistant
              </p>
              <h2 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Product Copilot
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Local backend: Ollama ({ollamaModel})
              </p>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
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

          <div className="border-t border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900">
            <Composer
              label="What are you looking for?"
              placeholder="e.g. Blue tops in size S or M, under $50…"
            />
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="wafer-product-filter-chat"
        className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
      >
        {isOpen ? "Hide Assistant" : "Filter Assistant"}
      </button>
    </div>
  );
}
