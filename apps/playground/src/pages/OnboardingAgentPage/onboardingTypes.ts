export type EmploymentType = "" | "full-time" | "contractor" | "intern";
export type OnboardingTaskStatus = "ready" | "pending";

export interface OnboardingFormState {
  employeeName: string;
  workEmail: string;
  roleTitle: string;
  department: string;
  managerName: string;
  startDate: string;
  workLocation: string;
  employmentType: EmploymentType;
  laptopRequired: boolean;
  vpnAccessRequired: boolean;
  payrollRequired: boolean;
  accessGroups: string;
  equipmentNotes: string;
  welcomeMessage: string;
}

export interface OnboardingTask {
  id: string;
  title: string;
  owner: string;
  status: OnboardingTaskStatus;
  note: string;
}

export type OnboardingTextField =
  | "employeeName"
  | "workEmail"
  | "roleTitle"
  | "department"
  | "managerName"
  | "startDate"
  | "workLocation"
  | "employmentType"
  | "accessGroups"
  | "equipmentNotes"
  | "welcomeMessage";

export type OnboardingToggleField = "laptopRequired" | "vpnAccessRequired" | "payrollRequired";
export type OnboardingField = OnboardingTextField | OnboardingToggleField;

export const onboardingTextFieldNames = new Set<OnboardingTextField>([
  "employeeName",
  "workEmail",
  "roleTitle",
  "department",
  "managerName",
  "startDate",
  "workLocation",
  "employmentType",
  "accessGroups",
  "equipmentNotes",
  "welcomeMessage"
]);

export const onboardingToggleFieldNames = new Set<OnboardingToggleField>([
  "laptopRequired",
  "vpnAccessRequired",
  "payrollRequired"
]);

export const requiredOnboardingFields: OnboardingTextField[] = [
  "employeeName",
  "workEmail",
  "roleTitle",
  "department",
  "managerName",
  "startDate",
  "employmentType"
];

export const validEmploymentType = new Set<EmploymentType>([
  "",
  "full-time",
  "contractor",
  "intern"
]);

export const initialOnboardingFormState: OnboardingFormState = {
  employeeName: "",
  workEmail: "",
  roleTitle: "",
  department: "",
  managerName: "",
  startDate: "",
  workLocation: "",
  employmentType: "",
  laptopRequired: false,
  vpnAccessRequired: false,
  payrollRequired: false,
  accessGroups: "",
  equipmentNotes: "",
  welcomeMessage: ""
};

export const onboardingCopilotSystemPrompt = [
  "You are Onboarding Copilot embedded in an employee onboarding dashboard.",
  "Help operations teams capture accurate onboarding details and improve clarity.",
  "Prioritize key data: employee identity, role, manager, start date, location, access needs, and equipment needs.",
  "Keep responses concise, actionable, and professional.",
  "Ask only focused follow-up questions when required fields are missing.",
  "Do not switch away from onboarding unless explicitly asked."
].join(" ");
