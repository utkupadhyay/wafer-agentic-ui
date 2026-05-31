import type { OnboardingTask } from "./onboardingTypes";

interface OnboardingChecklistProps {
  checklist: OnboardingTask[];
  completedTaskIds: Record<string, boolean>;
  onToggleTask: (taskId: string) => void;
}

export function OnboardingChecklist({
  checklist,
  completedTaskIds,
  onToggleTask
}: OnboardingChecklistProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Onboarding Checklist
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {Object.values(completedTaskIds).filter(Boolean).length} / {checklist.length} marked done
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        {checklist.map((task) => {
          const done = completedTaskIds[task.id] === true;
          return (
            <article
              key={task.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-white/10 dark:bg-slate-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Owner: {task.owner}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{task.note}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={
                      task.status === "ready"
                        ? "inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400"
                    }
                  >
                    {task.status === "ready" ? "Ready" : "Pending"}
                  </span>

                  <button
                    type="button"
                    className={
                      done
                        ? "inline-flex items-center rounded-md border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-800 transition hover:bg-emerald-200 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                        : "inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    }
                    onClick={() => onToggleTask(task.id)}
                  >
                    {done ? "Done" : "Mark done"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
