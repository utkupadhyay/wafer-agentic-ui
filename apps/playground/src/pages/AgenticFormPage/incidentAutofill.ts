import {
  type IncidentFormState,
  type IncidentType,
  incidentAutofillSchema,
  incidentAutofillSystemPrompt,
  type Severity,
  type Shift,
  validIncidentType,
  validSeverity,
  validShift
} from "./incidentTypes";

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
    /\breporter\s*name\s*[:-]?\s*([a-z][a-z\s.'-]{1,80})(?=$|[.!?,;])/i
  );
  if (explicitMatch?.[1]) {
    return toTitleCase(explicitMatch[1]);
  }

  const reportedByMatch = prompt.match(/\breported\s+by\s+([a-z][a-z\s.'-]{1,80})(?=$|[.!?,;])/i);
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
      actionLines.push(
        "Immediately cordon off the affected area and restrict all personnel access."
      );
      if (/\boil (spill|spillage|leak)|spill|spillage|leak\b/.test(lower)) {
        actionLines.push(
          "Deploy maintenance staff to contain and clean the oil spillage as per safety protocol."
        );
      }
      if (/\bconveyor|conveyer|belt|broken|jam\b/.test(lower)) {
        actionLines.push(
          "Escalate to the maintenance team to inspect and repair the conveyor belt and resolve the door jam."
        );
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
    incidentTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(incidentTime) ? incidentTime : "",
    description,
    immediateAction,
    medicalAttentionRequired
  };
}

export function toIncidentAutofillPatch(parsed: Partial<IncidentFormState>) {
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

export async function extractIncidentAutofillWithLlm(
  prompt: string,
  ollamaBaseUrl: string,
  ollamaModel: string
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
        { role: "system", content: incidentAutofillSystemPrompt },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Autofill extraction failed (${response.status}): ${details}`);
  }

  const json = (await response.json()) as { message?: { content?: string } };
  const content = json.message?.content;
  if (!content) {
    throw new Error("No content returned from LLM extraction.");
  }

  const rawObject = JSON.parse(extractJsonObjectFromText(content)) as unknown;
  return normalizeIncidentAutofillPayload(rawObject);
}

export function extractIncidentAutofill(prompt: string): Partial<IncidentFormState> {
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
