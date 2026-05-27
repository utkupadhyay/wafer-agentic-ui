import { useThread } from "@wafer/react";
import { StatusBadge } from "./StatusBadge";
import { messageCardClass, panelClass, sectionTitleClass } from "./theme";

interface AgentThreadProps {
  title?: string;
  emptyStateMessage?: string;
  contextHint?: string;
}

export function AgentThread({
  title = "Agent Thread",
  emptyStateMessage = "Say hi to your local Ollama agent.",
  contextHint
}: AgentThreadProps) {
  const { messages, status, lastError } = useThread();

  return (
    <section className={panelClass}>
      <header className="mb-3 flex items-center justify-between gap-3">
        <h2 className={sectionTitleClass}>{title}</h2>
        <StatusBadge status={status} />
      </header>

      {contextHint ? (
        <p className="mb-3 rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-xs leading-5 text-violet-900">
          {contextHint}
        </p>
      ) : null}

      <div className="max-h-72 space-y-2 overflow-auto pr-1" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">{emptyStateMessage}</p>
        ) : null}

        {messages.map((message) => (
          <article key={message.id} className={messageCardClass(message.role)}>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {message.role}
            </p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {message.content || "..."}
            </p>
          </article>
        ))}
      </div>

      {lastError ? <p className="mt-3 text-sm text-rose-600">Error: {lastError}</p> : null}
    </section>
  );
}
