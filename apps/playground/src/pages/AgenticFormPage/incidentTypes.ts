export type Shift = "" | "morning" | "afternoon" | "night";
export type IncidentType = "" | "injury" | "equipment" | "spill" | "near-miss" | "security";
export type Severity = "" | "low" | "medium" | "high" | "critical";

export interface IncidentFormState {
  reporterName: string;
  shift: Shift;
  incidentType: IncidentType;
  severity: Severity;
  location: string;
  incidentTime: string;
  description: string;
  immediateAction: string;
  medicalAttentionRequired: boolean;
}

export const initialIncidentFormState: IncidentFormState = {
  reporterName: "",
  shift: "",
  incidentType: "",
  severity: "",
  location: "",
  incidentTime: "",
  description: "",
  immediateAction: "",
  medicalAttentionRequired: false
};

export const validShift = new Set<Shift>(["morning", "afternoon", "night"]);
export const validIncidentType = new Set<IncidentType>([
  "injury",
  "equipment",
  "spill",
  "near-miss",
  "security"
]);
export const validSeverity = new Set<Severity>(["low", "medium", "high", "critical"]);

export const incidentCopilotSystemPrompt = [
  "You are Warehouse Copilot, an assistant embedded in a warehouse incident reporting form.",
  "Your primary job is to extract structured incident data from what the user describes and fill the form via tool calls.",
  "Prioritize filling: reporterName, shift, incidentType, severity, location, incidentTime, description, immediateAction.",
  "description must be professional incident report English (2-4 sentences).",
  "immediateAction must be actionable bullet lines, each starting with '- '.",
  "incidentTime must use datetime-local format YYYY-MM-DDTHH:mm when date/time are present.",
  "Keep responses concise and safety-first."
].join(" ");
