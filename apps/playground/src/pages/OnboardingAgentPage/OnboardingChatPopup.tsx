import { AgentThread, Composer } from "@wafer/ui";

interface OnboardingChatPopupProps {
  isOpen: boolean;
  onToggle: () => void;
  ollamaModel: string;
}

export function OnboardingChatPopup({ isOpen, onToggle, ollamaModel }: OnboardingChatPopupProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen ? (
        <section
          id="wafer-onboarding-chat-popup"
          className="grid max-h-[80vh] w-[min(30rem,calc(100vw-1rem))] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
          aria-label="Onboarding Assistant Chat"
        >
          <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3 dark:border-white/10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-400">
                Agent Assistant
              </p>
              <h2 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Onboarding Copilot
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Local backend: Ollama ({ollamaModel})
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Context: This chat is for the onboarding workflow on this page.
              </p>
            </div>
            <button
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
              type="button"
              onClick={onToggle}
              aria-label="Close chat"
            >
              Close
            </button>
          </header>

          <div className="overflow-auto p-3">
            <AgentThread
              title="Onboarding Assistant Thread"
              contextHint="Tool-driven mode is active: write naturally and I will infer fields, update the form, and ask only for missing essentials."
              emptyStateMessage="Describe the new hire in plain English and I will fill this onboarding form through tool calls."
            />
          </div>

          <div className="border-t border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900">
            <Composer
              label="Onboarding Prompt"
              placeholder="e.g. Onboard Arjun Mehta as Logistics Analyst in Supply Ops..."
            />
          </div>
        </section>
      ) : null}

      <button
        className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
        type="button"
        aria-expanded={isOpen}
        aria-controls="wafer-onboarding-chat-popup"
        onClick={onToggle}
      >
        {isOpen ? "Hide Assistant" : "Open Assistant"}
      </button>
    </div>
  );
}
