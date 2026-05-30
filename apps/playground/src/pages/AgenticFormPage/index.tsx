import { Link } from "@tanstack/react-router";
import { createOllamaTransport } from "@wafer/adapters/ollama";
import { AgentProvider, createAgentClient } from "@wafer/react";
import { type ChangeEvent, useState } from "react";
import { IncidentChatPopup } from "./IncidentChatPopup";
import { IncidentFormFields } from "./IncidentFormFields";
import {
  extractIncidentAutofill,
  extractIncidentAutofillWithLlm,
  toIncidentAutofillPatch
} from "./incidentAutofill";
import {
  type IncidentFormState,
  incidentCopilotSystemPrompt,
  initialIncidentFormState
} from "./incidentTypes";

const ollamaBaseUrl = import.meta.env.VITE_OLLAMA_BASE_URL ?? "http://localhost:11434";
const ollamaModel = import.meta.env.VITE_OLLAMA_MODEL ?? "gpt-oss:20b";

const client = createAgentClient({
  transport: createOllamaTransport({
    baseUrl: ollamaBaseUrl,
    model: ollamaModel,
    systemPrompt: import.meta.env.VITE_OLLAMA_SYSTEM_PROMPT ?? incidentCopilotSystemPrompt
  })
});

export function AgenticFormPage() {
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
      setIncidentForm((current) => ({ ...current, [field]: value }));
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
      medicalAttentionRequired: patch.medicalAttentionRequired ?? current.medicalAttentionRequired
    }));
  };

  const applyPromptAutofill = async (prompt: string) => {
    setIsPrefilling(true);
    setAutofillError(null);

    const fallbackPatch = toIncidentAutofillPatch(extractIncidentAutofill(prompt));

    try {
      const llmParsed = await extractIncidentAutofillWithLlm(prompt, ollamaBaseUrl, ollamaModel);
      const llmPatch = toIncidentAutofillPatch(llmParsed);
      applyAutofillPatch({ ...fallbackPatch, ...llmPatch });
    } catch (error) {
      applyAutofillPatch(fallbackPatch);
      const message = error instanceof Error ? error.message : "Unknown autofill extraction error";
      setAutofillError(message);
    } finally {
      setIsPrefilling(false);
    }

    setAutofillAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  };

  const onSubmitIncident = (event: { preventDefault(): void }) => {
    event.preventDefault();
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  };

  return (
    <AgentProvider client={client}>
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <section className="mx-auto w-full max-w-5xl space-y-5 px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex justify-start">
            <Link
              to="/"
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Back to Home
            </Link>
          </div>

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

          <IncidentFormFields
            form={incidentForm}
            onFieldChange={onFieldChange}
            onMedicalAttentionChange={onMedicalAttentionChange}
            onSubmit={onSubmitIncident}
            savedAt={savedAt}
            autofillAt={autofillAt}
            autofillError={autofillError}
          />
        </section>

        <IncidentChatPopup
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen((v) => !v)}
          onPromptSubmitted={applyPromptAutofill}
          isPrefilling={isPrefilling}
          ollamaModel={ollamaModel}
        />
      </main>
    </AgentProvider>
  );
}
