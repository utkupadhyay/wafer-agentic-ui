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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Onboarding Checklist</h2>
        <p className="text-sm text-slate-500">
          {Object.values(completedTaskIds).filter(Boolean).length} / {checklist.length} marked done
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        {checklist.map((task) => {
          const done = completedTaskIds[task.id] === true;
          return (
            <article
              key={task.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                  <p className="text-xs text-slate-500">Owner: {task.owner}</p>
                  <p className="text-xs text-slate-500">{task.note}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={
                      task.status === "ready"
                        ? "inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                        : "inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                    }
                  >
                    {task.status === "ready" ? "Ready" : "Pending"}
                  </span>

                  <button
                    type="button"
                    className={
                      done
                        ? "inline-flex items-center rounded-md border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-800 transition hover:bg-emerald-200"
                        : "inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
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
