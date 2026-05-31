import type { ChangeEvent } from "react";
import type { OnboardingFormState } from "./onboardingTypes";

interface OnboardingFormFieldsProps {
  form: OnboardingFormState;
  onFieldChange: (
    field: keyof Omit<
      OnboardingFormState,
      "laptopRequired" | "vpnAccessRequired" | "payrollRequired"
    >
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBooleanFieldChange: (
    field: "laptopRequired" | "vpnAccessRequired" | "payrollRequired"
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
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

export function OnboardingFormFields({
  form,
  onFieldChange,
  onBooleanFieldChange,
  onSubmit,
  savedAt,
  autofillAt
}: OnboardingFormFieldsProps) {
  return (
    <form
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900"
      onSubmit={onSubmit}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5" htmlFor="employee-name">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Employee Name
          </span>
          <input
            id="employee-name"
            name="employeeName"
            value={form.employeeName}
            onChange={onFieldChange("employeeName")}
            className={inputCls}
            placeholder="e.g. John Doe"
            required
          />
        </label>

        <label className="space-y-1.5" htmlFor="work-email">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Work Email</span>
          <input
            id="work-email"
            name="workEmail"
            type="email"
            value={form.workEmail}
            onChange={onFieldChange("workEmail")}
            className={inputCls}
            placeholder="e.g. john.doe@company.com"
            required
          />
        </label>

        <label className="space-y-1.5" htmlFor="role-title">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Role Title</span>
          <input
            id="role-title"
            name="roleTitle"
            value={form.roleTitle}
            onChange={onFieldChange("roleTitle")}
            className={inputCls}
            placeholder="e.g. Senior Operations Analyst"
            required
          />
        </label>

        <label className="space-y-1.5" htmlFor="department">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Department</span>
          <input
            id="department"
            name="department"
            value={form.department}
            onChange={onFieldChange("department")}
            className={inputCls}
            placeholder="e.g. Supply Chain Ops"
            required
          />
        </label>

        <label className="space-y-1.5" htmlFor="manager-name">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Manager Name
          </span>
          <input
            id="manager-name"
            name="managerName"
            value={form.managerName}
            onChange={onFieldChange("managerName")}
            className={inputCls}
            placeholder="e.g. Pankaj Arora"
          />
        </label>

        <label className="space-y-1.5" htmlFor="start-date">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Start Date</span>
          <input
            id="start-date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={onFieldChange("startDate")}
            className={inputCls}
            required
          />
        </label>

        <label className="space-y-1.5" htmlFor="work-location">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Work Location
          </span>
          <input
            id="work-location"
            name="workLocation"
            value={form.workLocation}
            onChange={onFieldChange("workLocation")}
            className={inputCls}
            placeholder="e.g. Bengaluru HQ / Remote"
          />
        </label>

        <label className="space-y-1.5" htmlFor="employment-type">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Employment Type
          </span>
          <select
            id="employment-type"
            name="employmentType"
            value={form.employmentType}
            onChange={onFieldChange("employmentType")}
            className={selectCls}
          >
            <option value="" disabled>
              Select type
            </option>
            <option value="full-time">Full-time</option>
            <option value="contractor">Contractor</option>
            <option value="intern">Intern</option>
          </select>
        </label>
      </div>

      <label className="space-y-1.5" htmlFor="access-groups">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Required Access Groups
        </span>
        <textarea
          id="access-groups"
          name="accessGroups"
          value={form.accessGroups}
          onChange={onFieldChange("accessGroups")}
          className={`min-h-22.5 ${textareaCls}`}
          rows={4}
          placeholder="e.g. ERP read-write, Support dashboard, Slack #ops-private"
        />
      </label>

      <label className="space-y-1.5" htmlFor="equipment-notes">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Equipment Notes
        </span>
        <textarea
          id="equipment-notes"
          name="equipmentNotes"
          value={form.equipmentNotes}
          onChange={onFieldChange("equipmentNotes")}
          className={`min-h-22.5 ${textareaCls}`}
          rows={4}
          placeholder="e.g. 16-inch laptop, docking station, extra monitor."
        />
      </label>

      <label className="space-y-1.5" htmlFor="welcome-message">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Welcome Message Draft
        </span>
        <textarea
          id="welcome-message"
          name="welcomeMessage"
          value={form.welcomeMessage}
          onChange={onFieldChange("welcomeMessage")}
          className={`min-h-24 ${textareaCls}`}
          rows={4}
          placeholder="Agent can draft this from your prompt."
        />
      </label>

      <div className="grid gap-2 md:grid-cols-3">
        <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={form.laptopRequired}
            onChange={onBooleanFieldChange("laptopRequired")}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-slate-600"
          />
          <span>Laptop required</span>
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={form.vpnAccessRequired}
            onChange={onBooleanFieldChange("vpnAccessRequired")}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-slate-600"
          />
          <span>VPN access required</span>
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={form.payrollRequired}
            onChange={onBooleanFieldChange("payrollRequired")}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-slate-600"
          />
          <span>Payroll setup required</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
          type="submit"
        >
          Save Onboarding Draft
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
            Autofilled from chat at {autofillAt}.
          </p>
        ) : null}
      </div>
    </form>
  );
}
