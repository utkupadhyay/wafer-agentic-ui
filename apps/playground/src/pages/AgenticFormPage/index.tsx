import { createGroqTransport } from "@wafer/adapters/groq";
import { createOllamaTransport } from "@wafer/adapters/ollama";
import { AgentProvider, createAgentClient } from "@wafer/react";
import { type ChangeEvent, useRef, useState } from "react";
import { IncidentChatPopup } from "./IncidentChatPopup";
import { IncidentFormFields } from "./IncidentFormFields";
import {
  type IncidentFormState,
  incidentCopilotSystemPrompt,
  initialIncidentFormState,
  validIncidentType,
  validSeverity,
  validShift
} from "./incidentTypes";

const ollamaBaseUrl = import.meta.env.VITE_OLLAMA_BASE_URL ?? "http://localhost:11434";
const ollamaModel = import.meta.env.VITE_OLLAMA_MODEL ?? "gpt-oss:20b";

const requiredIncidentFields: Array<keyof IncidentFormState> = [
  "reporterName",
  "location",
  "description"
];

function nowShortTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function AgenticFormPage() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [autofillAt, setAutofillAt] = useState<string | null>(null);
  const [incidentForm, setIncidentForm] = useState<IncidentFormState>(initialIncidentFormState);
  const formRef = useRef<IncidentFormState>(initialIncidentFormState);

  const applyAgentPatch = (patch: Partial<IncidentFormState>) => {
    const current = formRef.current;
    const nextPatch: Partial<IncidentFormState> = {};
    let didChange = false;

    for (const [key, value] of Object.entries(patch) as Array<
      [keyof IncidentFormState, IncidentFormState[keyof IncidentFormState]]
    >) {
      if (value === undefined || current[key] === value) {
        continue;
      }
      Object.assign(nextPatch, { [key]: value });
      didChange = true;
    }

    if (!didChange) {
      return;
    }

    const next = { ...current, ...nextPatch };
    formRef.current = next;
    setIncidentForm(next);
    setAutofillAt(nowShortTime());
  };

  const onFieldChange =
    (field: keyof Omit<IncidentFormState, "medicalAttentionRequired">) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setIncidentForm((current) => ({ ...current, [field]: value }));
      formRef.current = { ...formRef.current, [field]: value };
    };

  const onMedicalAttentionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIncidentForm((current) => ({ ...current, medicalAttentionRequired: checked }));
    formRef.current = { ...formRef.current, medicalAttentionRequired: checked };
  };

  const clientRef = useRef<ReturnType<typeof createAgentClient> | null>(null);
  if (clientRef.current === null) {
    const toolSystemPrompt = [
      import.meta.env.VITE_OLLAMA_SYSTEM_PROMPT ?? incidentCopilotSystemPrompt,
      "You are in an agent loop with function tools.",
      "When the user describes an incident, ALWAYS call set_incident_fields FIRST before writing any reply.",
      "Pass every inferred field directly as a top-level key: reporterName, shift (morning/afternoon/night), incidentType (injury/equipment/spill/near-miss/security), severity (low/medium/high/critical), location, incidentTime (YYYY-MM-DDTHH:mm), description (2-4 professional sentences), immediateAction (bullet lines starting with '- '), medicalAttentionRequired (boolean).",
      "Do NOT wrap fields under an 'updates' key — pass them directly.",
      "Use get_incident_form_state to read what is already filled before asking follow-up questions.",
      "Only ask follow-up questions for missing required fields after calling the tool.",
      "Keep replies concise."
    ].join(" ");

    const agentTools = [
      {
        function: {
          name: "get_incident_form_state",
          description:
            "Read the current incident form state and which required fields are still missing.",
          parameters: { type: "object", properties: {} }
        },
        execute: () => {
          const snapshot = formRef.current;
          const missingRequiredFields = requiredIncidentFields.filter((f) => {
            const v = snapshot[f];
            return typeof v !== "string" || v.trim() === "";
          });
          return { form: snapshot, missingRequiredFields };
        }
      },
      {
        function: {
          name: "set_incident_fields",
          description:
            "Set one or more incident form fields in a single call. Pass each known field as a top-level key.",
          parameters: {
            type: "object",
            properties: {
              reporterName: { type: "string" },
              shift: { type: "string", enum: ["morning", "afternoon", "night"] },
              incidentType: {
                type: "string",
                enum: ["injury", "equipment", "spill", "near-miss", "security"]
              },
              severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
              location: { type: "string" },
              incidentTime: {
                type: "string",
                description: "datetime-local format YYYY-MM-DDTHH:mm"
              },
              description: { type: "string" },
              immediateAction: { type: "string" },
              medicalAttentionRequired: { type: "boolean" }
            }
          }
        },
        execute: (args: Record<string, unknown>) => {
          const patch: Partial<IncidentFormState> = {};

          if (typeof args.reporterName === "string" && args.reporterName.trim()) {
            patch.reporterName = args.reporterName.trim();
          }
          const shift = typeof args.shift === "string" ? args.shift.trim().toLowerCase() : "";
          if (validShift.has(shift as IncidentFormState["shift"])) {
            patch.shift = shift as IncidentFormState["shift"];
          }
          const incidentType =
            typeof args.incidentType === "string" ? args.incidentType.trim().toLowerCase() : "";
          if (validIncidentType.has(incidentType as IncidentFormState["incidentType"])) {
            patch.incidentType = incidentType as IncidentFormState["incidentType"];
          }
          const severity =
            typeof args.severity === "string" ? args.severity.trim().toLowerCase() : "";
          if (validSeverity.has(severity as IncidentFormState["severity"])) {
            patch.severity = severity as IncidentFormState["severity"];
          }
          if (typeof args.location === "string" && args.location.trim()) {
            patch.location = args.location.trim();
          }
          if (
            typeof args.incidentTime === "string" &&
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(args.incidentTime.trim())
          ) {
            patch.incidentTime = args.incidentTime.trim();
          }
          if (typeof args.description === "string" && args.description.trim()) {
            patch.description = args.description.trim();
          }
          if (typeof args.immediateAction === "string" && args.immediateAction.trim()) {
            patch.immediateAction = args.immediateAction.trim();
          }
          if (typeof args.medicalAttentionRequired === "boolean") {
            patch.medicalAttentionRequired = args.medicalAttentionRequired;
          }

          applyAgentPatch(patch);
          return { ok: true, appliedFields: Object.keys(patch) };
        }
      }
    ];

    clientRef.current = createAgentClient({
      transport: import.meta.env.PROD
        ? createGroqTransport({
            systemPrompt: toolSystemPrompt,
            maxToolRounds: 6,
            forceToolCallRetryCount: 2,
            tools: agentTools
          })
        : createOllamaTransport({
            baseUrl: ollamaBaseUrl,
            model: ollamaModel,
            systemPrompt: toolSystemPrompt,
            maxToolRounds: 6,
            forceToolCallRetryCount: 2,
            requestOptions: { temperature: 0 },
            tools: agentTools
          })
    });
  }

  const onSubmitIncident = (event: { preventDefault(): void }) => {
    event.preventDefault();
    setSavedAt(nowShortTime());
  };

  return (
    <AgentProvider client={clientRef.current}>
      <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <section className="mx-auto w-full max-w-5xl space-y-5 px-4 py-10 sm:px-6 lg:px-8">
          <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-700 dark:text-violet-400">
              Wafer Warehouse Safety Desk
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Incident Report Form
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Use this form to log any safety issue, near miss, or operational incident from the
              floor.
            </p>
          </header>

          <IncidentFormFields
            form={incidentForm}
            onFieldChange={onFieldChange}
            onMedicalAttentionChange={onMedicalAttentionChange}
            onSubmit={onSubmitIncident}
            savedAt={savedAt}
            autofillAt={autofillAt}
          />
        </section>

        <IncidentChatPopup
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen((v) => !v)}
          ollamaModel={ollamaModel}
        />
      </main>
    </AgentProvider>
  );
}
