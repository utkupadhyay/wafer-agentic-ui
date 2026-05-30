import {
  type EmploymentType,
  type OnboardingField,
  type OnboardingFormState,
  type OnboardingTask,
  type OnboardingTextField,
  type OnboardingToggleField,
  onboardingTextFieldNames,
  onboardingToggleFieldNames,
  validEmploymentType
} from "./onboardingTypes";

function normalizeAliasToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const onboardingFieldAliasMap: Record<string, OnboardingField> = {
  employeename: "employeeName",
  employee: "employeeName",
  name: "employeeName",
  fullname: "employeeName",
  newhirename: "employeeName",
  workemail: "workEmail",
  email: "workEmail",
  emailaddress: "workEmail",
  roletitle: "roleTitle",
  role: "roleTitle",
  title: "roleTitle",
  position: "roleTitle",
  jobtitle: "roleTitle",
  department: "department",
  team: "department",
  managername: "managerName",
  manager: "managerName",
  reportsto: "managerName",
  reportingmanager: "managerName",
  startdate: "startDate",
  start: "startDate",
  joiningdate: "startDate",
  dateofjoining: "startDate",
  worklocation: "workLocation",
  location: "workLocation",
  office: "workLocation",
  site: "workLocation",
  employmenttype: "employmentType",
  employment: "employmentType",
  hiretype: "employmentType",
  type: "employmentType",
  laptoprequired: "laptopRequired",
  laptopneeded: "laptopRequired",
  laptop: "laptopRequired",
  vpnaccessrequired: "vpnAccessRequired",
  vpnrequired: "vpnAccessRequired",
  vpnneeded: "vpnAccessRequired",
  vpn: "vpnAccessRequired",
  payrollrequired: "payrollRequired",
  payrollsetupneeded: "payrollRequired",
  payrollneeded: "payrollRequired",
  payrollsetup: "payrollRequired",
  payroll: "payrollRequired",
  benefits: "payrollRequired",
  accessgroups: "accessGroups",
  requiredaccessgroups: "accessGroups",
  access: "accessGroups",
  permissions: "accessGroups",
  systems: "accessGroups",
  erpaccess: "accessGroups",
  slackchannels: "accessGroups",
  supportdashboardaccess: "accessGroups",
  equipmentnotes: "equipmentNotes",
  equipment: "equipmentNotes",
  equipmentrequirements: "equipmentNotes",
  equipmentneeded: "equipmentNotes",
  hardware: "equipmentNotes",
  devices: "equipmentNotes",
  welcomemessage: "welcomeMessage",
  welcomenote: "welcomeMessage",
  dayonenote: "welcomeMessage"
};

export function isOnboardingTextField(value: unknown): value is OnboardingTextField {
  return typeof value === "string" && onboardingTextFieldNames.has(value as OnboardingTextField);
}

export function isOnboardingToggleField(value: unknown): value is OnboardingToggleField {
  return (
    typeof value === "string" && onboardingToggleFieldNames.has(value as OnboardingToggleField)
  );
}

export function normalizeOnboardingFieldName(value: unknown): OnboardingField | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (isOnboardingTextField(trimmed)) {
    return trimmed;
  }
  if (isOnboardingToggleField(trimmed)) {
    return trimmed;
  }

  return onboardingFieldAliasMap[normalizeAliasToken(trimmed)] ?? null;
}

export function toTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function toTitleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function toTextLikeValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const parts = value.map((item) => toTrimmedString(item)).filter(Boolean);
    return parts.join(", ");
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }

  return "";
}

export function toBooleanLikeValue(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return false;
    }
    if (["true", "yes", "y", "required", "needed", "enable", "enabled", "1"].includes(normalized)) {
      return true;
    }
    if (
      ["false", "no", "n", "optional", "not required", "disable", "disabled", "0"].includes(
        normalized
      )
    ) {
      return false;
    }
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return false;
}

function humanizeFieldKey(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

export function toTextValueForField(
  field: OnboardingTextField,
  rawValue: unknown,
  sourceKey: string
) {
  if (typeof rawValue === "boolean") {
    if (!rawValue) {
      return "";
    }
    if (field === "accessGroups" || field === "equipmentNotes") {
      return humanizeFieldKey(sourceKey);
    }
    return "";
  }

  return toTextLikeValue(rawValue);
}

export function mergeTextFieldValue(
  existingValue: string | undefined,
  incomingValue: string,
  field: OnboardingTextField
) {
  if (!incomingValue.trim()) {
    return existingValue ?? "";
  }

  if (field !== "accessGroups" && field !== "equipmentNotes") {
    return incomingValue;
  }

  const nextItems = new Set<string>();
  const current = existingValue ?? "";
  for (const part of current
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)) {
    nextItems.add(part);
  }
  for (const part of incomingValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)) {
    nextItems.add(part);
  }

  return Array.from(nextItems).join(", ");
}

function formatDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function sanitizeDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "";
  }

  const [yearText, monthText, dayText] = value.split("-");
  if (!yearText || !monthText || !dayText) {
    return "";
  }

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return "";
  }

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return "";
  }

  return formatDateOnly(parsed);
}

export function normalizeOnboardingTextFieldValue(
  field: OnboardingTextField,
  value: unknown
): OnboardingFormState[OnboardingTextField] {
  const normalized = toTrimmedString(value);

  if (field === "employeeName" || field === "managerName") {
    return toTitleCase(normalized);
  }

  if (field === "workEmail") {
    return normalized.toLowerCase();
  }

  if (field === "startDate") {
    return sanitizeDateOnly(normalized);
  }

  if (field === "employmentType") {
    const employmentType = normalized.toLowerCase() as EmploymentType;
    return validEmploymentType.has(employmentType) ? employmentType : "";
  }

  return normalized;
}

export function nowShortTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function buildOnboardingChecklist(form: OnboardingFormState): OnboardingTask[] {
  const hasIdentityCore =
    !!form.employeeName.trim() && !!form.workEmail.trim() && !!form.startDate.trim();
  const hasRoleContext =
    !!form.roleTitle.trim() && !!form.department.trim() && !!form.managerName.trim();
  const hasAccessPlan = !!form.accessGroups.trim();
  const hasEquipmentPlan = !form.laptopRequired || !!form.equipmentNotes.trim();

  return [
    {
      id: "hr-profile",
      title: "Create HR profile and employment record",
      owner: "People Ops",
      status: hasIdentityCore && form.employmentType ? "ready" : "pending",
      note: hasIdentityCore
        ? "Identity details captured."
        : "Need employee name, work email, and start date."
    },
    {
      id: "it-identity",
      title: "Provision SSO, email, and baseline accounts",
      owner: "IT",
      status: hasIdentityCore ? "ready" : "pending",
      note: hasIdentityCore ? "Ready for provisioning." : "Missing identity basics."
    },
    {
      id: "access-groups",
      title: "Configure role-specific access groups",
      owner: "IT Security",
      status: hasIdentityCore && hasRoleContext && hasAccessPlan ? "ready" : "pending",
      note: hasAccessPlan
        ? "Access groups documented."
        : "Add required apps/systems in access groups."
    },
    {
      id: "equipment",
      title: "Assign laptop and equipment package",
      owner: "IT Support",
      status: hasEquipmentPlan ? "ready" : "pending",
      note: form.laptopRequired
        ? hasEquipmentPlan
          ? "Equipment requirements captured."
          : "Add laptop or hardware requirements."
        : "Laptop not required."
    },
    {
      id: "vpn-security",
      title: "Enable VPN and remote security controls",
      owner: "Security Ops",
      status: !form.vpnAccessRequired || hasAccessPlan ? "ready" : "pending",
      note: form.vpnAccessRequired
        ? hasAccessPlan
          ? "VPN path can be configured."
          : "Document remote access groups."
        : "VPN not required."
    },
    {
      id: "manager-plan",
      title: "Finalize manager onboarding plan",
      owner: "Hiring Manager",
      status: hasRoleContext && form.welcomeMessage.trim() ? "ready" : "pending",
      note: hasRoleContext
        ? "Role and manager context captured."
        : "Need role, department, and manager details."
    }
  ];
}
