import type { ChangeEvent } from "react";
import type { IncidentFormState } from "./incidentTypes";

interface IncidentFormFieldsProps {
  form: IncidentFormState;
  onFieldChange: (
    field: keyof Omit<IncidentFormState, "medicalAttentionRequired">
  ) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onMedicalAttentionChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: { preventDefault(): void }) => void;
  savedAt: string | null;
  autofillAt: string | null;
}

const inputCls =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus-visible:ring-slate-500";

const selectCls =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus-visible:ring-slate-500";

const textareaCls =
  "w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus-visible:ring-slate-500";

export function IncidentFormFields({
  form,
  onFieldChange,
  onMedicalAttentionChange,
  onSubmit,
  savedAt,
  autofillAt
}: IncidentFormFieldsProps) {
  return (
    <form
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900"
      onSubmit={onSubmit}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5" htmlFor="incident-reporter">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Reporter Name
          </span>
          <input
            id="incident-reporter"
            name="reporterName"
            value={form.reporterName}
            onChange={onFieldChange("reporterName")}
            className={inputCls}
            placeholder="e.g. Priya Sharma"
            required
          />
        </label>

        <label className="space-y-1.5" htmlFor="incident-shift">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Shift</span>
          <select
            id="incident-shift"
            name="shift"
            value={form.shift}
            onChange={onFieldChange("shift")}
            className={selectCls}
          >
            <option value="" disabled>
              Select shift
            </option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="night">Night</option>
          </select>
        </label>

        <label className="space-y-1.5" htmlFor="incident-type">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Incident Type
          </span>
          <select
            id="incident-type"
            name="incidentType"
            value={form.incidentType}
            onChange={onFieldChange("incidentType")}
            className={selectCls}
          >
            <option value="" disabled>
              Select incident type
            </option>
            <option value="injury">Injury</option>
            <option value="equipment">Equipment Failure</option>
            <option value="spill">Material Spill</option>
            <option value="near-miss">Near Miss</option>
            <option value="security">Security Concern</option>
          </select>
        </label>

        <label className="space-y-1.5" htmlFor="incident-severity">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Severity</span>
          <select
            id="incident-severity"
            name="severity"
            value={form.severity}
            onChange={onFieldChange("severity")}
            className={selectCls}
          >
            <option value="" disabled>
              Select severity
            </option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </label>

        <label className="space-y-1.5" htmlFor="incident-location">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Location in Warehouse
          </span>
          <input
            id="incident-location"
            name="location"
            value={form.location}
            onChange={onFieldChange("location")}
            className={inputCls}
            placeholder="e.g. Aisle B3, Loading Dock 2"
            required
          />
        </label>

        <label className="space-y-1.5" htmlFor="incident-time">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Incident Time
          </span>
          <input
            id="incident-time"
            name="incidentTime"
            type="datetime-local"
            value={form.incidentTime}
            onChange={onFieldChange("incidentTime")}
            className={inputCls}
          />
        </label>
      </div>

      <label className="space-y-1.5" htmlFor="incident-description">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Detailed Description
        </span>
        <textarea
          id="incident-description"
          name="description"
          value={form.description}
          onChange={onFieldChange("description")}
          className={`min-h-30 ${textareaCls}`}
          rows={5}
          placeholder="What happened? Who was involved? What was impacted?"
          required
        />
      </label>

      <label className="space-y-1.5" htmlFor="incident-action">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Immediate Actions Taken
        </span>
        <textarea
          id="incident-action"
          name="immediateAction"
          value={form.immediateAction}
          onChange={onFieldChange("immediateAction")}
          className={`min-h-25 ${textareaCls}`}
          rows={4}
          placeholder="e.g. Isolated zone, informed supervisor, stopped conveyor."
        />
      </label>

      <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <input
          type="checkbox"
          name="medicalAttentionRequired"
          checked={form.medicalAttentionRequired}
          onChange={onMedicalAttentionChange}
          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-slate-600"
        />
        <span>Medical attention required</span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
          type="submit"
        >
          Save Incident Draft
        </button>
        {savedAt ? (
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Draft captured at {savedAt}.
          </p>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Drafts are local in this playground demo.
          </p>
        )}
        {autofillAt ? (
          <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
            Form updated via agent at {autofillAt}.
          </p>
        ) : null}
      </div>
    </form>
  );
}
