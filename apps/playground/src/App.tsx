import { useState, type ChangeEvent, type FormEvent } from "react";
import { createAgentClient, AgentProvider } from "@wafer/react";
import { createOllamaTransport } from "@wafer/adapters/ollama";
import { AgentThread, ApprovalPanel, Composer, RunTimeline } from "@wafer/ui";

const incidentCopilotSystemPrompt = [
  "You are Warehouse Copilot, an assistant embedded in a warehouse incident reporting form.",
  "Your primary job is to help users draft clear, complete incident reports.",
  "Keep responses concise, practical, and safety-first.",
  "Prioritize collecting or improving these fields: incident type, severity, location, time, detailed description, and immediate actions taken.",
  "If details are missing, ask focused follow-up questions before giving final recommendations.",
  "When useful, suggest clearer wording for report text in bullet points.",
  "Do not switch to unrelated domains unless the user explicitly asks."
].join(" ");

const ollamaBaseUrl = import.meta.env.VITE_OLLAMA_BASE_URL ?? "http://localhost:11434";
const ollamaModel = import.meta.env.VITE_OLLAMA_MODEL ?? "gpt-oss:20b";

const client = createAgentClient({
  transport: createOllamaTransport({
    baseUrl: ollamaBaseUrl,
    model: ollamaModel,
    systemPrompt:
      import.meta.env.VITE_OLLAMA_SYSTEM_PROMPT ??
      incidentCopilotSystemPrompt
  })
});

type Shift = "" | "morning" | "afternoon" | "night";
type IncidentType = "" | "injury" | "equipment" | "spill" | "near-miss" | "security";
type Severity = "" | "low" | "medium" | "high" | "critical";

interface IncidentFormState {
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

const initialIncidentFormState: IncidentFormState = {
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

const incidentAutofillSchema = {
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

const incidentAutofillSystemPrompt = [
  "You are an incident-form extraction assistant.",
  "Extract structured fields from the user report and return only valid JSON.",
  "Do not include markdown, explanations, or extra keys.",
  "Reporter name should be title case when available.",
  "description must be professional incident report English (2-4 sentences).",
  "immediateAction must be professional and actionable; prefer short bullet lines separated by newline and starting with '- '.",
  "incidentTime must use datetime-local format YYYY-MM-DDTHH:mm when date/time are present; otherwise empty string.",
  "If any field is unknown, return empty string (or false for booleans)."
].join(" ");

const validShift = new Set<Shift>(["", "morning", "afternoon", "night"]);
const validIncidentType = new Set<IncidentType>([
  "",
  "injury",
  "equipment",
  "spill",
  "near-miss",
  "security"
]);
const validSeverity = new Set<Severity>(["", "low", "medium", "high", "critical"]);

const monthIndexByName: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11
};

function formatDateTimeLocal(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function parseIncidentDateTimeToDateTimeLocal(prompt: string) {
  const timeMatch = prompt.match(/\b(\d{1,2})[:.](\d{2})\s*(am|pm)\b/i);
  if (!timeMatch) {
    return "";
  }

  const dateMatch = prompt.match(
    /\b(?:on\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s*,?\s*(\d{4})\b/i
  );

  const now = new Date();
  const date = new Date(now);

  if (dateMatch) {
    const day = Number(dateMatch[1]);
    const monthKey = (dateMatch[2] ?? "").toLowerCase();
    const year = Number(dateMatch[3]);
    const monthIndex = monthIndexByName[monthKey];

    if (!Number.isNaN(day) && !Number.isNaN(year) && monthIndex !== undefined) {
      date.setFullYear(year, monthIndex, day);
    }
  }

  const hoursMatch = timeMatch[1];
  const minutesMatch = timeMatch[2];
  const meridiemMatch = timeMatch[3];

  if (!hoursMatch || !minutesMatch || !meridiemMatch) {
    return "";
  }

  let hours = Number(hoursMatch);
  const minutes = Number(minutesMatch);
  const meridiem = meridiemMatch.toLowerCase();

  if (meridiem === "pm" && hours < 12) {
    hours += 12;
  }
  if (meridiem === "am" && hours === 12) {
    hours = 0;
  }

  date.setHours(hours, minutes, 0, 0);
  return formatDateTimeLocal(date);
}

function toTitleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function extractReporterName(prompt: string) {
  const explicitMatch = prompt.match(
    /\breporter\s*name\s*[:\-]?\s*([a-z][a-z\s.'-]{1,80})(?=$|[.!?,;])/i
  );
  if (explicitMatch?.[1]) {
    return toTitleCase(explicitMatch[1]);
  }

  const reportedByMatch = prompt.match(
    /\breported\s+by\s+([a-z][a-z\s.'-]{1,80})(?=$|[.!?,;])/i
  );
  if (reportedByMatch?.[1]) {
    return toTitleCase(reportedByMatch[1]);
  }

  return "";
}

function parseTimeToDateTimeLocal(raw: string) {
  const match = raw.match(/(\d{1,2})[:.](\d{2})\s*(am|pm)/i);
  if (!match) {
    return "";
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = (match[3] ?? "").toLowerCase();

  if (!meridiem) {
    return "";
  }

  if (meridiem === "pm" && hours < 12) {
    hours += 12;
  }
  if (meridiem === "am" && hours === 12) {
    hours = 0;
  }

  const now = new Date();
  now.setHours(hours, minutes, 0, 0);

  return formatDateTimeLocal(now);
}

function toSentence(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  const punctuated = /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
  return punctuated.charAt(0).toUpperCase() + punctuated.slice(1);
}

function formatIncidentTimeForNarrative(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatIncidentDateForNarrative(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function inferIncidentNoun(prompt: string, incidentType: IncidentType) {
  const lower = prompt.toLowerCase();
  if (/\boil (spill|spillage|leak)\b/.test(lower)) {
    return "an oil spillage";
  }
  if (incidentType === "spill") {
    return "a material spillage";
  }
  if (incidentType === "equipment") {
    return "an equipment malfunction";
  }
  if (incidentType === "injury") {
    return "a workplace injury incident";
  }
  return "an operational incident";
}

function extractImpactClause(prompt: string) {
  const match = prompt.match(/\b(caused|resulted in|leading to)\s+([^.!?\n]+)/i);
  if (!match) {
    return "";
  }

  const verb = (match[1] ?? "").toLowerCase();
  let tail = (match[2] ?? "").trim();
  if (!verb || !tail) {
    return "";
  }
  tail = tail.replace(/\bdoor jam\b/i, "a door jam");
  tail = tail.replace(/\bbelt was broken\b/i, "conveyor belt damage");

  if (verb === "leading to") {
    return `led to ${tail}`;
  }
  return `${verb} ${tail}`;
}

function extractSafetySentence(prompt: string) {
  return (
    prompt
      .split(/(?<=[.!?])\s+/)
      .find((sentence) => /\bavoid|restrict|block|cordon|stop\b/i.test(sentence))
      ?.trim() ?? ""
  );
}

function buildProfessionalDescription(prompt: string, parsed: Partial<IncidentFormState>) {
  const incidentNoun = inferIncidentNoun(prompt, parsed.incidentType ?? "");
  const parts: string[] = [];

  let opening = parsed.shift
    ? `During the ${parsed.shift} shift, ${incidentNoun} was reported`
    : `${incidentNoun} was reported`;

  if (parsed.location) {
    opening += ` at ${parsed.location}`;
  }

  const dateText = formatIncidentDateForNarrative(parsed.incidentTime ?? "");
  if (dateText) {
    opening += ` on ${dateText}`;
  }

  const timeText = formatIncidentTimeForNarrative(parsed.incidentTime ?? "");
  if (timeText) {
    opening += ` at approximately ${timeText}`;
  }

  parts.push(toSentence(opening));

  const impactClause = extractImpactClause(prompt);
  if (impactClause) {
    parts.push(toSentence(`The incident ${impactClause}`));
  }

  if (parsed.severity) {
    parts.push(toSentence(`Severity has been classified as ${parsed.severity}`));
  }

  return parts.join(" ");
}

function buildProfessionalImmediateAction(prompt: string, parsed: Partial<IncidentFormState>) {
  const safetySentence = extractSafetySentence(prompt);
  const lower = prompt.toLowerCase();
  const actionLines: string[] = [];

  if (safetySentence) {
    if (/\bavoid\b/i.test(safetySentence)) {
      actionLines.push("Immediately cordon off the affected area and restrict all personnel access.");
      if (/\boil (spill|spillage|leak)|spill|spillage|leak\b/.test(lower)) {
        actionLines.push("Deploy maintenance staff to contain and clean the oil spillage as per safety protocol.");
      }
      if (/\bconveyor|conveyer|belt|broken|jam\b/.test(lower)) {
        actionLines.push("Escalate to the maintenance team to inspect and repair the conveyor belt and resolve the door jam.");
      }
      actionLines.push("Reopen the area only after safety inspection and supervisor clearance.");
      return actionLines.map((line) => `- ${toSentence(line)}`).join("\n");
    }

    if (/\brestrict|block|cordon|stop\b/i.test(safetySentence)) {
      return "- The affected zone has been isolated and access controls have been applied pending safety clearance.";
    }

    return toSentence(safetySentence);
  }

  if (parsed.severity === "critical") {
    return "Access to the affected area has been restricted, and urgent maintenance and safety inspection have been initiated.";
  }

  return "";
}

function extractJsonObjectFromText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Empty extraction response.");
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in extraction response.");
  }

  return candidate.slice(start, end + 1);
}

function toTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeIncidentAutofillPayload(payload: unknown): Partial<IncidentFormState> {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const raw = payload as Record<string, unknown>;
  const shift = toTrimmedString(raw.shift).toLowerCase() as Shift;
  const incidentType = toTrimmedString(raw.incidentType).toLowerCase() as IncidentType;
  const severity = toTrimmedString(raw.severity).toLowerCase() as Severity;
  const incidentTime = toTrimmedString(raw.incidentTime);
  const reporterName = toTitleCase(toTrimmedString(raw.reporterName));
  const description = toTrimmedString(raw.description);
  const immediateAction = toTrimmedString(raw.immediateAction);
  const location = toTrimmedString(raw.location);
  const medicalAttentionRequired = raw.medicalAttentionRequired === true;

  return {
    reporterName,
    shift: validShift.has(shift) ? shift : "",
    incidentType: validIncidentType.has(incidentType) ? incidentType : "",
    severity: validSeverity.has(severity) ? severity : "",
    location,
    incidentTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(incidentTime)
      ? incidentTime
      : "",
    description,
    immediateAction,
    medicalAttentionRequired
  };
}

function toIncidentAutofillPatch(parsed: Partial<IncidentFormState>) {
  const patch: Partial<IncidentFormState> = {};

  if (parsed.reporterName?.trim()) {
    patch.reporterName = toTitleCase(parsed.reporterName);
  }
  if (parsed.shift) {
    patch.shift = parsed.shift;
  }
  if (parsed.incidentType) {
    patch.incidentType = parsed.incidentType;
  }
  if (parsed.severity) {
    patch.severity = parsed.severity;
  }
  if (parsed.location?.trim()) {
    patch.location = parsed.location.trim();
  }
  if (parsed.incidentTime?.trim()) {
    patch.incidentTime = parsed.incidentTime.trim();
  }
  if (parsed.description?.trim()) {
    patch.description = parsed.description.trim();
  }
  if (parsed.immediateAction?.trim()) {
    patch.immediateAction = parsed.immediateAction.trim();
  }
  if (parsed.medicalAttentionRequired === true) {
    patch.medicalAttentionRequired = true;
  }

  return patch;
}

async function extractIncidentAutofillWithLlm(
  prompt: string
): Promise<Partial<IncidentFormState>> {
  const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: ollamaModel,
      stream: false,
      format: incidentAutofillSchema,
      messages: [
        {
          role: "system",
          content: incidentAutofillSystemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Autofill extraction failed (${response.status}): ${details}`);
  }

  const json = (await response.json()) as {
    message?: {
      content?: string;
    };
  };
  const content = json.message?.content;
  if (!content) {
    throw new Error("No content returned from LLM extraction.");
  }

  const rawObject = JSON.parse(extractJsonObjectFromText(content)) as unknown;
  return normalizeIncidentAutofillPayload(rawObject);
}

function extractIncidentAutofill(prompt: string): Partial<IncidentFormState> {
  const lower = prompt.toLowerCase();
  const parsed: Partial<IncidentFormState> = {};
  parsed.reporterName = extractReporterName(prompt);

  if (/\bmorning(\s+shift)?\b/.test(lower)) {
    parsed.shift = "morning";
  } else if (/\bafternoon(\s+shift)?\b/.test(lower)) {
    parsed.shift = "afternoon";
  } else if (/\bnight(\s+shift)?\b/.test(lower)) {
    parsed.shift = "night";
  }

  if (/\bcritical\b/.test(lower)) {
    parsed.severity = "critical";
  } else if (/\bhigh\b/.test(lower)) {
    parsed.severity = "high";
  } else if (/\bmedium\b/.test(lower)) {
    parsed.severity = "medium";
  } else if (/\blow\b/.test(lower)) {
    parsed.severity = "low";
  }

  if (/\bspill|spillage|leak\b/.test(lower)) {
    parsed.incidentType = "spill";
  } else if (/\bbroken|failure|jam|malfunction|conveyor|conveyer|belt\b/.test(lower)) {
    parsed.incidentType = "equipment";
  } else if (/\binjury|hurt|bleeding\b/.test(lower)) {
    parsed.incidentType = "injury";
  }

  const locationParts: string[] = [];
  const siteMatch = prompt.match(/\b(DC\d+)\b/i);
  if (siteMatch?.[1]) {
    locationParts.push(siteMatch[1].toUpperCase());
  }
  const floorMatch = prompt.match(/\b(sales floor)\b/i);
  if (floorMatch?.[1]) {
    locationParts.push("Sales Floor");
  }
  const nearMatch = prompt.match(/\bnear\s+([^.,;\n]+)/i);
  if (nearMatch?.[1]) {
    locationParts.push(`near ${nearMatch[1].trim()}`);
  }
  if (locationParts.length > 0) {
    parsed.location = locationParts.join(", ");
  }

  parsed.incidentTime = parseIncidentDateTimeToDateTimeLocal(prompt);
  if (!parsed.incidentTime) {
    const timeMatch = prompt.match(/\b\d{1,2}[:.]\d{2}\s*(?:am|pm)\b/i);
    if (timeMatch?.[0]) {
      parsed.incidentTime = parseTimeToDateTimeLocal(timeMatch[0]);
    }
  }

  if (/\binjury|medical\b/.test(lower)) {
    parsed.medicalAttentionRequired = true;
  }

  parsed.description = buildProfessionalDescription(prompt, parsed);
  parsed.immediateAction = buildProfessionalImmediateAction(prompt, parsed);

  return parsed;
}

export function App() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [autofillAt, setAutofillAt] = useState<string | null>(null);
  const [autofillError, setAutofillError] = useState<string | null>(null);
  const [isPrefilling, setIsPrefilling] = useState(false);
  const [incidentForm, setIncidentForm] = useState<IncidentFormState>(initialIncidentFormState);

  const onFieldChange =
    (field: keyof Omit<IncidentFormState, "medicalAttentionRequired">) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setIncidentForm((current) => ({
        ...current,
        [field]: value
      }));
    };

  const onMedicalAttentionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIncidentForm((current) => ({
      ...current,
      medicalAttentionRequired: event.target.checked
    }));
  };

  const applyAutofillPatch = (patch: Partial<IncidentFormState>) => {
    setIncidentForm((current) => ({
      reporterName: patch.reporterName ?? current.reporterName,
      shift: patch.shift ?? current.shift,
      incidentType: patch.incidentType ?? current.incidentType,
      severity: patch.severity ?? current.severity,
      location: patch.location ?? current.location,
      incidentTime: patch.incidentTime ?? current.incidentTime,
      description: patch.description ?? current.description,
      immediateAction: patch.immediateAction ?? current.immediateAction,
      medicalAttentionRequired:
        patch.medicalAttentionRequired ?? current.medicalAttentionRequired
    }));
  };

  const applyPromptAutofill = async (prompt: string) => {
    setIsPrefilling(true);
    setAutofillError(null);

    const fallbackPatch = toIncidentAutofillPatch(extractIncidentAutofill(prompt));

    try {
      const llmParsed = await extractIncidentAutofillWithLlm(prompt);
      const llmPatch = toIncidentAutofillPatch(llmParsed);
      const mergedPatch = {
        ...fallbackPatch,
        ...llmPatch
      };
      applyAutofillPatch(mergedPatch);
    } catch (error) {
      applyAutofillPatch(fallbackPatch);
      const message = error instanceof Error ? error.message : "Unknown autofill extraction error";
      setAutofillError(message);
    } finally {
      setIsPrefilling(false);
    }

    setAutofillAt(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    );
  };

  const onSubmitIncident = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedAt(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    );
  };

  return (
    <AgentProvider client={client}>
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <section className="mx-auto w-full max-w-5xl space-y-5 px-4 py-10 sm:px-6 lg:px-8">
          <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-700">
              Wafer Warehouse Safety Desk
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Incident Report Form
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Use this form to log any safety issue, near miss, or operational incident from the
              floor.
            </p>
          </header>

          <form
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            onSubmit={onSubmitIncident}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5" htmlFor="incident-reporter">
                <span className="text-xs font-medium text-slate-600">Reporter Name</span>
                <input
                  id="incident-reporter"
                  name="reporterName"
                  value={incidentForm.reporterName}
                  onChange={onFieldChange("reporterName")}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400"
                  placeholder="e.g. Priya Sharma"
                  required
                />
              </label>

              <label className="space-y-1.5" htmlFor="incident-shift">
                <span className="text-xs font-medium text-slate-600">Shift</span>
                <select
                  id="incident-shift"
                  name="shift"
                  value={incidentForm.shift}
                  onChange={onFieldChange("shift")}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-slate-400"
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
                <span className="text-xs font-medium text-slate-600">Incident Type</span>
                <select
                  id="incident-type"
                  name="incidentType"
                  value={incidentForm.incidentType}
                  onChange={onFieldChange("incidentType")}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-slate-400"
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
                <span className="text-xs font-medium text-slate-600">Severity</span>
                <select
                  id="incident-severity"
                  name="severity"
                  value={incidentForm.severity}
                  onChange={onFieldChange("severity")}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-slate-400"
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
                <span className="text-xs font-medium text-slate-600">Location in Warehouse</span>
                <input
                  id="incident-location"
                  name="location"
                  value={incidentForm.location}
                  onChange={onFieldChange("location")}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400"
                  placeholder="e.g. Aisle B3, Loading Dock 2"
                  required
                />
              </label>

              <label className="space-y-1.5" htmlFor="incident-time">
                <span className="text-xs font-medium text-slate-600">Incident Time</span>
                <input
                  id="incident-time"
                  name="incidentTime"
                  type="datetime-local"
                  value={incidentForm.incidentTime}
                  onChange={onFieldChange("incidentTime")}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-slate-400"
                />
              </label>
            </div>

            <label className="space-y-1.5" htmlFor="incident-description">
              <span className="text-xs font-medium text-slate-600">Detailed Description</span>
              <textarea
                id="incident-description"
                name="description"
                value={incidentForm.description}
                onChange={onFieldChange("description")}
                className="min-h-[120px] w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400"
                rows={5}
                placeholder="What happened? Who was involved? What was impacted?"
                required
              />
            </label>

            <label className="space-y-1.5" htmlFor="incident-action">
              <span className="text-xs font-medium text-slate-600">Immediate Actions Taken</span>
              <textarea
                id="incident-action"
                name="immediateAction"
                value={incidentForm.immediateAction}
                onChange={onFieldChange("immediateAction")}
                className="min-h-[100px] w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400"
                rows={4}
                placeholder="e.g. Isolated zone, informed supervisor, stopped conveyor."
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="medicalAttentionRequired"
                checked={incidentForm.medicalAttentionRequired}
                onChange={onMedicalAttentionChange}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              />
              <span>Medical attention required</span>
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                type="submit"
              >
                Save Incident Draft
              </button>
              {savedAt ? (
                <p className="text-sm font-medium text-emerald-700">Draft captured at {savedAt}.</p>
              ) : (
                <p className="text-sm text-slate-500">Drafts are local in this playground demo.</p>
              )}
              {autofillAt ? (
                <p className="text-sm font-medium text-violet-700">
                  Autofilled from chat at {autofillAt}.
                </p>
              ) : null}
              {autofillError ? (
                <p className="text-sm text-amber-700">
                  AI prefill fallback used: {autofillError}
                </p>
              ) : null}
            </div>
          </form>
        </section>

        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
          {isChatOpen ? (
            <section
              id="wafer-chat-popup"
              className="grid max-h-[80vh] w-[min(30rem,calc(100vw-1rem))] grid-rows-[auto_minmax(0,1fr)_auto_auto] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              aria-label="Warehouse Assistant Chat"
            >
              <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                    Agent Assistant
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-900">Warehouse Copilot</h2>
                  <p className="text-xs text-slate-500">
                    Local backend: Ollama ({ollamaModel})
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Context: This chat is for the warehouse incident report form on this page.
                  </p>
                </div>
                <button
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  aria-label="Close chat"
                >
                  Close
                </button>
              </header>

              <div className="overflow-auto p-3">
                <AgentThread
                  title="Incident Assistant Thread"
                  contextHint="I can help you complete this incident report. I focus on incident type, severity, location, time, description, and immediate actions."
                  emptyStateMessage="Start by pasting what happened, and I will help you structure it into a clean incident report."
                />
              </div>

              <div className="border-t border-slate-200 bg-white p-3">
                <Composer
                  label="Incident Prompt"
                  placeholder="e.g. Rewrite this incident summary in a professional report format..."
                  onPromptSubmitted={applyPromptAutofill}
                  isPrefilling={isPrefilling}
                />
              </div>

              <details className="border-t border-slate-200 bg-slate-50">
                <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-slate-600">
                  Run timeline and approvals
                </summary>
                <div className="space-y-3 border-t border-slate-200 p-3">
                  <RunTimeline />
                  <ApprovalPanel />
                </div>
              </details>
            </section>
          ) : null}

          <button
            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-slate-700"
            type="button"
            aria-expanded={isChatOpen}
            aria-controls="wafer-chat-popup"
            onClick={() => setIsChatOpen((value) => !value)}
          >
            {isChatOpen ? "Hide Assistant" : "Open Assistant"}
          </button>
        </div>
      </main>
    </AgentProvider>
  );
}
