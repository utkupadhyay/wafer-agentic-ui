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

export const validShift = new Set<Shift>(["", "morning", "afternoon", "night"]);
export const validIncidentType = new Set<IncidentType>([
  "",
  "injury",
  "equipment",
  "spill",
  "near-miss",
  "security"
]);
export const validSeverity = new Set<Severity>(["", "low", "medium", "high", "critical"]);

export const incidentAutofillSchema = {
  type: "object",
  required: [
    "reporterName",
    "shift",
    "incidentType",
    "severity",
    "location",
    "incidentTime",
    "description",
    "immediateAction",
    "medicalAttentionRequired"
  ],
  properties: {
    reporterName: { type: "string" },
    shift: { type: "string", enum: ["", "morning", "afternoon", "night"] },
    incidentType: {
      type: "string",
      enum: ["", "injury", "equipment", "spill", "near-miss", "security"]
    },
    severity: { type: "string", enum: ["", "low", "medium", "high", "critical"] },
    location: { type: "string" },
    incidentTime: {
      type: "string",
      description: "Datetime-local format, e.g. 2026-05-22T12:32"
    },
    description: { type: "string" },
    immediateAction: { type: "string" },
    medicalAttentionRequired: { type: "boolean" }
  }
} as const;

export const incidentAutofillSystemPrompt = [
  "You are an incident-form extraction assistant.",
  "Extract structured fields from the user report and return only valid JSON.",
  "Do not include markdown, explanations, or extra keys.",
  "Reporter name should be title case when available.",
  "description must be professional incident report English (2-4 sentences).",
  "immediateAction must be professional and actionable; prefer short bullet lines separated by newline and starting with '- '.",
  "incidentTime must use datetime-local format YYYY-MM-DDTHH:mm when date/time are present; otherwise empty string.",
  "If any field is unknown, return empty string (or false for booleans)."
].join(" ");

export const incidentCopilotSystemPrompt = [
  "You are Warehouse Copilot, an assistant embedded in a warehouse incident reporting form.",
  "Your primary job is to help users draft clear, complete incident reports.",
  "Keep responses concise, practical, and safety-first.",
  "Prioritize collecting or improving these fields: incident type, severity, location, time, detailed description, and immediate actions taken.",
  "If details are missing, ask focused follow-up questions before giving final recommendations.",
  "When useful, suggest clearer wording for report text in bullet points.",
  "Do not switch to unrelated domains unless the user explicitly asks."
].join(" ");
