import { useApprovals } from "@wafer/react";
import { panelClass, sectionTitleClass, stateChipClass } from "./theme";

export function ApprovalPanel() {
  const { approvals, resolveApproval } = useApprovals();
  const pending = approvals.filter((approval) => approval.status === "pending");

  return (
    <section className={panelClass}>
      <header className="mb-3 flex items-center justify-between gap-3">
        <h2 className={sectionTitleClass}>Approvals</h2>
      </header>

      {pending.length === 0 ? (
        <p className="text-sm text-slate-500">No pending approvals.</p>
      ) : null}

      {pending.map((approval) => (
        <article
          key={approval.id}
          className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-white p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">{approval.actionLabel}</h3>
            <span className={stateChipClass(approval.status)}>{approval.status}</span>
          </div>
          {approval.reason ? <p className="text-sm text-slate-600">{approval.reason}</p> : null}
          <div className="flex gap-2">
            <button
              className="inline-flex items-center rounded-md bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-800 transition hover:bg-emerald-200"
              type="button"
              onClick={() => resolveApproval(approval.id, approval.runId, "approved")}
            >
              Approve
            </button>
            <button
              className="inline-flex items-center rounded-md bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-200"
              type="button"
              onClick={() => resolveApproval(approval.id, approval.runId, "rejected")}
            >
              Reject
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
