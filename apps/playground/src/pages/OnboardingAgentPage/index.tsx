import { createGroqTransport } from "@wafer/adapters/groq";
import { createOllamaTransport } from "@wafer/adapters/ollama";
import { AgentProvider, createAgentClient } from "@wafer/react";
import { type ChangeEvent, useRef, useState } from "react";
import { OnboardingChatPopup } from "./OnboardingChatPopup";
import { OnboardingChecklist } from "./OnboardingChecklist";
import { OnboardingFormFields } from "./OnboardingFormFields";
import {
  initialOnboardingFormState,
  type OnboardingFormState,
  onboardingCopilotSystemPrompt,
  onboardingTextFieldNames,
  onboardingToggleFieldNames,
  requiredOnboardingFields
} from "./onboardingTypes";
import {
  buildOnboardingChecklist,
  isOnboardingTextField,
  isOnboardingToggleField,
  mergeTextFieldValue,
  normalizeOnboardingFieldName,
  normalizeOnboardingTextFieldValue,
  nowShortTime,
  toBooleanLikeValue,
  toTextValueForField
} from "./onboardingUtils";

const ollamaBaseUrl = import.meta.env.VITE_OLLAMA_BASE_URL ?? "http://localhost:11434";
const ollamaModel = import.meta.env.VITE_OLLAMA_MODEL ?? "gpt-oss:20b";

export function OnboardingAgentPage() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [autofillAt, setAutofillAt] = useState<string | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>({});
  const [onboardingForm, setOnboardingForm] = useState<OnboardingFormState>(
    initialOnboardingFormState
  );
  const onboardingFormRef = useRef<OnboardingFormState>(initialOnboardingFormState);

  const onboardingChecklist = buildOnboardingChecklist(onboardingForm);

  const applyAgentPatch = (patch: Partial<OnboardingFormState>) => {
    const current = onboardingFormRef.current;
    const nextPatch: Partial<OnboardingFormState> = {};
    let didChange = false;

    for (const [key, value] of Object.entries(patch) as Array<
      [keyof OnboardingFormState, OnboardingFormState[keyof OnboardingFormState]]
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
    onboardingFormRef.current = next;
    setOnboardingForm(next);
    setAutofillAt(nowShortTime());
  };

  const onFieldChange =
    (
      field: keyof Omit<
        OnboardingFormState,
        "laptopRequired" | "vpnAccessRequired" | "payrollRequired"
      >
    ) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setOnboardingForm((current) => ({ ...current, [field]: value }));
      onboardingFormRef.current = { ...onboardingFormRef.current, [field]: value };
    };

  const onBooleanFieldChange =
    (field: "laptopRequired" | "vpnAccessRequired" | "payrollRequired") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      setOnboardingForm((current) => ({ ...current, [field]: checked }));
      onboardingFormRef.current = { ...onboardingFormRef.current, [field]: checked };
    };

  const clientRef = useRef<ReturnType<typeof createAgentClient> | null>(null);
  if (clientRef.current === null) {
    const onboardingToolPrompt = [
      import.meta.env.VITE_OLLAMA_SYSTEM_PROMPT ?? onboardingCopilotSystemPrompt,
      "You are in an agent loop with function tools.",
      "Users will write normal natural English, not strict templates.",
      "Infer onboarding fields from free-form sentences and map them to form fields using tools.",
      "Use tool calls to fill or update onboarding form fields whenever details are present.",
      "Always call set_onboarding_fields FIRST before writing any reply when the user provides onboarding details.",
      "Pass every inferred field as a top-level key to set_onboarding_fields: employeeName, workEmail, roleTitle, department, managerName, startDate (YYYY-MM-DD), workLocation, employmentType (full-time/contractor/intern), laptopRequired, vpnAccessRequired, payrollRequired, accessGroups, equipmentNotes, welcomeMessage.",
      "Do NOT wrap fields under an 'updates' key — pass them directly.",
      "Prefer set_onboarding_fields for bulk updates and avoid asking obvious follow-up questions.",
      "Only ask follow-up questions for missing required fields after you have called the tool."
    ].join(" ");

    const agentTools = [
      {
        function: {
          name: "get_onboarding_form_state",
          description:
            "Read the current onboarding form state and missing required fields before deciding next steps.",
          parameters: { type: "object", properties: {} }
        },
        execute: () => {
          const snapshot = onboardingFormRef.current;
          const missingRequiredFields = requiredOnboardingFields.filter((field) => {
            const raw = snapshot[field];
            return typeof raw !== "string" || raw.trim() === "";
          });
          return { form: snapshot, missingRequiredFields };
        }
      },
      {
        function: {
          name: "set_onboarding_field",
          description:
            "Set one onboarding text/select field with a normalized value. Use for targeted updates.",
          parameters: {
            type: "object",
            required: ["field", "value"],
            properties: {
              field: { type: "string", enum: [...onboardingTextFieldNames] },
              value: { type: "string" }
            }
          }
        },
        execute: (argumentsPayload: Record<string, unknown>) => {
          const rawField = argumentsPayload.field;
          const field = normalizeOnboardingFieldName(rawField);
          if (!field || !isOnboardingTextField(field)) {
            throw new Error("Invalid field passed to set_onboarding_field.");
          }

          const textValue = toTextValueForField(field, argumentsPayload.value, String(rawField));
          const value = normalizeOnboardingTextFieldValue(field, textValue);
          applyAgentPatch({ [field]: value });
          return { ok: true, field, value };
        }
      },
      {
        function: {
          name: "set_onboarding_flag",
          description:
            "Set one onboarding boolean requirement flag for laptop, VPN, or payroll setup.",
          parameters: {
            type: "object",
            required: ["field", "value"],
            properties: {
              field: { type: "string", enum: [...onboardingToggleFieldNames] },
              value: { type: "boolean" }
            }
          }
        },
        execute: (argumentsPayload: Record<string, unknown>) => {
          const rawField = argumentsPayload.field;
          const field = normalizeOnboardingFieldName(rawField);
          if (!field || !isOnboardingToggleField(field)) {
            throw new Error("Invalid field passed to set_onboarding_flag.");
          }

          const value = toBooleanLikeValue(argumentsPayload.value);
          applyAgentPatch({ [field]: value });
          return { ok: true, field, value };
        }
      },
      {
        function: {
          name: "set_onboarding_fields",
          description:
            "Set multiple onboarding fields in a single call. Pass each field you know as a top-level key.",
          parameters: {
            type: "object",
            properties: {
              employeeName: { type: "string" },
              workEmail: { type: "string" },
              roleTitle: { type: "string" },
              department: { type: "string" },
              managerName: { type: "string" },
              startDate: { type: "string", description: "YYYY-MM-DD format" },
              workLocation: { type: "string" },
              employmentType: { type: "string", enum: ["full-time", "contractor", "intern"] },
              laptopRequired: { type: "boolean" },
              vpnAccessRequired: { type: "boolean" },
              payrollRequired: { type: "boolean" },
              accessGroups: { type: "string" },
              equipmentNotes: { type: "string" },
              welcomeMessage: { type: "string" }
            }
          }
        },
        execute: (argumentsPayload: Record<string, unknown>) => {
          const hasUpdatesWrapper =
            typeof argumentsPayload.updates === "object" &&
            argumentsPayload.updates !== null &&
            !Array.isArray(argumentsPayload.updates);

          const updates = (
            hasUpdatesWrapper ? argumentsPayload.updates : argumentsPayload
          ) as Record<string, unknown>;
          const patch: Partial<OnboardingFormState> = {};

          for (const [key, rawValue] of Object.entries(updates)) {
            const field = normalizeOnboardingFieldName(key);
            if (!field) continue;

            if (isOnboardingTextField(field)) {
              const textValue = toTextValueForField(field, rawValue, key);
              if (!textValue.trim()) continue;
              const mergedText = mergeTextFieldValue(patch[field], textValue, field);
              Object.assign(patch, {
                [field]: normalizeOnboardingTextFieldValue(field, mergedText)
              });
            } else if (isOnboardingToggleField(field)) {
              Object.assign(patch, { [field]: toBooleanLikeValue(rawValue) });
            }
          }

          applyAgentPatch(patch);
          return { ok: true, appliedFields: Object.keys(patch), patch };
        }
      }
    ];

    clientRef.current = createAgentClient({
      transport: import.meta.env.PROD
        ? createGroqTransport({
            systemPrompt: onboardingToolPrompt,
            maxToolRounds: 8,
            forceToolCallRetryCount: 2,
            tools: agentTools
          })
        : createOllamaTransport({
            baseUrl: ollamaBaseUrl,
            model: ollamaModel,
            systemPrompt: onboardingToolPrompt,
            maxToolRounds: 8,
            forceToolCallRetryCount: 2,
            requestOptions: { temperature: 0 },
            tools: agentTools
          })
    });
  }

  const client = clientRef.current;

  const onSubmitOnboarding = (event: { preventDefault(): void }) => {
    event.preventDefault();
    setSavedAt(nowShortTime());
  };

  const toggleTaskDone = (taskId: string) => {
    setCompletedTaskIds((current) => ({ ...current, [taskId]: !current[taskId] }));
  };

  return (
    <AgentProvider client={client}>
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <section className="mx-auto w-full max-w-6xl space-y-5 px-4 py-10 sm:px-6 lg:px-8">
          <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-700">
              Wafer PeopleOps Desk
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Onboarding Agent
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Capture employee onboarding details, assist provisioning teams, and track readiness
              before day one.
            </p>
          </header>

          <OnboardingFormFields
            form={onboardingForm}
            onFieldChange={onFieldChange}
            onBooleanFieldChange={onBooleanFieldChange}
            onSubmit={onSubmitOnboarding}
            savedAt={savedAt}
            autofillAt={autofillAt}
          />

          <OnboardingChecklist
            checklist={onboardingChecklist}
            completedTaskIds={completedTaskIds}
            onToggleTask={toggleTaskDone}
          />
        </section>

        <OnboardingChatPopup
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen((v) => !v)}
          ollamaModel={ollamaModel}
        />
      </main>
    </AgentProvider>
  );
}
