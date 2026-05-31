import { Link } from "@tanstack/react-router";
import type React from "react";
import { NavBar } from "../components/NavBar";

// ─── helpers ─────────────────────────────────────────────────────────────────

function Code({ children }: { children: string }) {
  return (
    <code className="rounded bg-violet-100 px-1.5 py-0.5 font-mono text-[13px] text-violet-700 dark:bg-white/10 dark:text-cyan-300">
      {children}
    </code>
  );
}

function CodeBlock({ code, lang = "" }: { code: string; lang?: string }) {
  return (
    <div className="relative my-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 dark:border-white/10">
      {lang && (
        <div className="border-b border-slate-700 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {lang}
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-slate-300">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

function Diagram({ children }: { children: string }) {
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]">
      <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-[1.65] text-slate-600 dark:text-slate-400">
        {children.trim()}
      </pre>
    </div>
  );
}

function Section({
  id,
  label,
  title,
  subtitle,
  children
}: {
  id: string;
  label: string;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 pt-10">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-violet-500 dark:text-cyan-200/70">
        {label}
      </p>
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h2>
      {subtitle && (
        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">{subtitle}</p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-900 dark:border-cyan-400/20 dark:bg-cyan-400/5 dark:text-cyan-100">
      <span className="mr-2 font-bold text-violet-600 dark:text-cyan-400">Note</span>
      {children}
    </div>
  );
}

function Callout({
  icon,
  title,
  children
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/5 dark:text-amber-100">
      <p className="mb-1.5 font-semibold text-amber-800 dark:text-amber-300">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}

// ─── layer-stack visual ───────────────────────────────────────────────────────

function LayerStack() {
  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
      {[
        {
          label: "Your App",
          sub: "product UI, custom components, business logic",
          bg: "bg-slate-100 dark:bg-white/5",
          text: "text-slate-700 dark:text-slate-200",
          sub2: "text-slate-500 dark:text-slate-400"
        },
        {
          label: "@wafer/ui",
          sub: "AgentThread · Composer · ApprovalPanel · RunTimeline · ToolCallCard",
          bg: "bg-violet-50 dark:bg-violet-500/10",
          text: "text-violet-800 dark:text-violet-200",
          sub2: "text-violet-500 dark:text-violet-400/80"
        },
        {
          label: "@wafer/react",
          sub: "AgentProvider · useThread · useComposer · useApprovals · useRunState",
          bg: "bg-blue-50 dark:bg-blue-500/10",
          text: "text-blue-800 dark:text-blue-200",
          sub2: "text-blue-500 dark:text-blue-400/80"
        },
        {
          label: "@wafer/core",
          sub: "AgentClient · reduceEvent · AgentState · event bus",
          bg: "bg-cyan-50 dark:bg-cyan-500/10",
          text: "text-cyan-800 dark:text-cyan-200",
          sub2: "text-cyan-600 dark:text-cyan-400/80"
        }
      ].map((layer) => (
        <div
          key={layer.label}
          className={`${layer.bg} border-b border-slate-200 px-5 py-3.5 dark:border-white/10`}
        >
          <span className={`font-mono text-sm font-semibold ${layer.text}`}>{layer.label}</span>
          <span className={`ml-3 text-xs ${layer.sub2}`}>{layer.sub}</span>
        </div>
      ))}

      {/* transport boundary */}
      <div className="border-b-2 border-dashed border-amber-400/60 bg-amber-50 px-5 py-2.5 dark:border-amber-400/30 dark:bg-amber-400/5">
        <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-300">
          AgentTransport interface
        </span>
        <span className="ml-3 text-xs text-amber-600/70 dark:text-amber-400/60">
          (the only boundary between your UI and the LLM)
        </span>
      </div>

      {[
        {
          label: "@wafer/adapters",
          sub: "createOllamaTransport · createGroqTransport",
          bg: "bg-emerald-50 dark:bg-emerald-500/10",
          text: "text-emerald-800 dark:text-emerald-200",
          sub2: "text-emerald-600 dark:text-emerald-400/80"
        },
        {
          label: "LLM backend",
          sub: "Ollama · Groq · Claude · OpenAI · LangGraph · Mastra · your own",
          bg: "bg-slate-100 dark:bg-white/5",
          text: "text-slate-700 dark:text-slate-300",
          sub2: "text-slate-400"
        }
      ].map((layer) => (
        <div
          key={layer.label}
          className={`${layer.bg} border-b border-slate-200 px-5 py-3.5 last:border-none dark:border-white/10`}
        >
          <span className={`font-mono text-sm font-semibold ${layer.text}`}>{layer.label}</span>
          <span className={`ml-3 text-xs ${layer.sub2}`}>{layer.sub}</span>
        </div>
      ))}
    </div>
  );
}

// ─── event table ──────────────────────────────────────────────────────────────

const events = [
  {
    type: "run.started",
    when: "AgentClient.sendUserMessage() is called",
    effect: "status → running, new RunState created"
  },
  {
    type: "message.created",
    when: "A new message appears (user or assistant)",
    effect: "Appends to messages[]"
  },
  {
    type: "message.delta",
    when: "Each streamed text chunk arrives",
    effect: "Appends delta to the last message's content"
  },
  {
    type: "tool.called",
    when: "LLM invokes a function",
    effect: "Creates ToolCallState with status: running"
  },
  {
    type: "tool.completed",
    when: "Tool execute() returns a result",
    effect: "Updates ToolCallState, stores output"
  },
  {
    type: "tool.failed",
    when: "Tool execute() throws",
    effect: "Updates ToolCallState with error"
  },
  {
    type: "approval.requested",
    when: "Agent needs human sign-off before acting",
    effect: "Creates ApprovalState with status: pending"
  },
  {
    type: "approval.resolved",
    when: "User approves or rejects in ApprovalPanel",
    effect: "Updates ApprovalState to approved or rejected"
  },
  {
    type: "run.completed",
    when: "Transport finishes the full response",
    effect: "status → idle, run marked completed"
  },
  {
    type: "run.failed",
    when: "Transport throws an unrecoverable error",
    effect: "status → error, stores error message"
  },
  {
    type: "error",
    when: "Generic error from the transport",
    effect: "status → error"
  }
];

// ─── table of contents ────────────────────────────────────────────────────────

const tocSections = [
  { id: "big-picture", label: "Big Picture" },
  { id: "packages", label: "The Five Packages" },
  { id: "transport", label: "Transport Contract" },
  { id: "events", label: "Event System" },
  { id: "state-machine", label: "State Machine" },
  { id: "react-layer", label: "React Layer" },
  { id: "adapters", label: "Adapters" },
  { id: "end-to-end", label: "End-to-End Walk-through" }
];

// ─── code snippets ────────────────────────────────────────────────────────────

const transportInterface = `interface AgentTransport {
  // Called once per user message. Call emit() to push
  // events into Wafer's state machine as they happen.
  sendUserMessage(
    input: SendUserMessageInput,
    emit: (event: AgentEvent) => void
  ): Promise<void>;

  // Optional. Only needed for human-approval flows.
  submitApproval?(
    input: SubmitApprovalInput,
    emit: (event: AgentEvent) => void
  ): Promise<void>;
}`;

const sendUserMessageInput = `interface SendUserMessageInput {
  threadId: string;   // stable ID for this conversation
  runId:    string;   // unique ID for this message + response pair
  messageId: string;  // ID of the user message just created
  text:     string;   // the user's raw message text
  history:  Array<{   // full conversation history so far
    role:    "system" | "user" | "assistant" | "tool";
    content: string;
  }>;
}`;

const agentStateShape = `interface AgentState {
  threadId:  string;          // which conversation this is
  status:    "idle" | "running" | "error";

  messages:  ThreadMessage[]; // full chronological message list
  runs:      Record<string, RunState>;       // one per user message
  toolCalls: Record<string, ToolCallState>;  // all function calls
  approvals: Record<string, ApprovalState>; // pending human approvals

  events:    AgentEvent[];    // raw event log (full audit trail)
  lastError?: string;
}`;

const reduceEventExample = `// reduceEvent is a pure function: no side-effects, no mutations.
// It takes the current state + one new event and returns new state.
function reduceEvent(state: AgentState, event: AgentEvent): AgentState {
  switch (event.type) {
    case "run.started":
      return { ...state, status: "running",
               runs: { ...state.runs, [event.runId]: { id: event.runId, status: "running" } } };

    case "message.delta":
      return { ...state, messages: state.messages.map(m =>
        m.id === event.messageId
          ? { ...m, content: m.content + event.delta }
          : m
      )};

    case "run.completed":
      return { ...state, status: "idle",
               runs: { ...state.runs, [event.runId]: { ...state.runs[event.runId], status: "completed" } } };

    // ... handles all 11 event types
  }
}`;

const useSyncExternalStoreExample = `// Inside useAgentState(): bridges the non-React event bus to React
function useAgentState(): AgentState {
  const client = useAgentClient();
  return useSyncExternalStore(
    client.subscribe,   // called by React to subscribe/unsubscribe
    client.getState     // called by React to read current state
  );
}
// React calls getState() on every render and subscribes to future
// changes. When the client emits a new event and calls its listeners,
// React knows to re-render exactly the components that read this hook.`;

const hooksOverview = `// All hooks are built on useAgentState() but each returns
// only the slice of state that the component actually needs.

const { threadId, messages, status } = useThread();
// → Full message list + current run status. Used by AgentThread.

const { input, setInput, submit, isRunning } = useComposer();
// → Controlled input state + submit handler. Used by Composer.

const { status, runs, toolCalls } = useRunState();
// → Run-level status and all tool call records. Used by RunTimeline.

const { approvals, resolveApproval } = useApprovals();
// → Pending approvals + the function to approve/reject them.

const state = useAgentState();
// → Full state object. Use this to build fully custom UIs.`;

const ollamaToolLoop = `// Pseudocode of the Ollama adapter's agentic loop
async sendUserMessage(input, emit) {
  let history = input.history;
  let rounds  = 0;

  while (rounds < maxToolRounds) {
    // 1. Call the LLM (non-streaming when tools are defined)
    const response = await callOllama({ model, messages: history, tools });

    if (response.hasTool) {
      for (const call of response.toolCalls) {
        // 2. Tell Wafer a tool was invoked
        emit({ type: "tool.called", toolName: call.name, input: call.args, ... });

        // 3. Run the local execute() function you defined
        const output = await tool.execute(call.args);

        // 4. Tell Wafer the result
        emit({ type: "tool.completed", output, ... });

        // 5. Append function result to history for next LLM turn
        history = [...history, { role: "tool", content: JSON.stringify(output) }];
      }
      rounds++;
    } else {
      // 6. No more tool calls, stream the final text response
      emit({ type: "message.created", role: "assistant", ... });
      for (const chunk of response.textStream) {
        emit({ type: "message.delta", delta: chunk, ... });
      }
      break;
    }
  }

  emit({ type: "run.completed", ... });
}`;

// ─── page ─────────────────────────────────────────────────────────────────────

export function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <NavBar breadcrumbs={[{ label: "Docs", to: "/docs" }, { label: "Architecture" }]} />

      <div className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        {/* hero */}
        <header className="py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500 dark:text-cyan-200/70">
            Wafer Docs
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Architecture
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
            A complete guide to how Wafer is structured, covering everything from the event bus at
            its core to the React hooks and pre-built components at the surface. Read this once and
            the whole system will click.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {tocSections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {s.label}
              </a>
            ))}
          </div>
        </header>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {/* ── Big Picture ────────────────────────────────────────── */}
          <Section
            id="big-picture"
            label="Overview"
            title="The big picture"
            subtitle="Wafer sits between your React product UI and your LLM backend. It handles everything in the middle: streaming state, tool calls, approvals, and re-renders."
          >
            <Callout icon="💡" title="Real-life analogy: a universal TV remote">
              <p>
                Think of Wafer as a universal TV remote. The remote has buttons (your UI
                components), a state machine that tracks what the TV is doing, and an IR blaster
                that sends signals to the TV. The remote doesn't care whether the TV is a Sony or a
                Samsung. You just swap the blaster module. That blaster module is the{" "}
                <strong>AgentTransport</strong>. Everything above it (buttons, display, logic) stays
                exactly the same when you switch backends.
              </p>
            </Callout>

            <p className="mb-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
              The system is split into layers. The dashed line below is the only interface you need
              to understand to swap LLM backends or build your own adapter.
            </p>

            <LayerStack />

            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
              You can enter the stack at any level. Use only <Code>@wafer/core</Code> if you prefer
              your own React bindings. Add <Code>@wafer/react</Code> for hooks. Drop in{" "}
              <Code>@wafer/ui</Code> for zero-config components. Or grab it all with a single{" "}
              <Code>npm install wafer</Code>.
            </p>
          </Section>

          {/* ── The Five Packages ──────────────────────────────────── */}
          <Section
            id="packages"
            label="Packages"
            title="The five packages"
            subtitle="Each package has one job. They compose cleanly so you can use just the pieces you need."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  pkg: "@wafer/protocol",
                  color: "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5",
                  nameColor: "text-slate-700 dark:text-slate-300",
                  desc: "TypeScript types and event definitions shared by all packages. No runtime code, just pure types. If you write a custom transport, you import AgentEvent from here."
                },
                {
                  pkg: "@wafer/core",
                  color: "border-cyan-200 dark:border-cyan-500/20 bg-cyan-50 dark:bg-cyan-500/5",
                  nameColor: "text-cyan-700 dark:text-cyan-300",
                  desc: "The engine. AgentClient holds agent state, drives the event bus, and calls your transport. reduceEvent is the pure state machine that processes every event."
                },
                {
                  pkg: "@wafer/react",
                  color: "border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5",
                  nameColor: "text-blue-700 dark:text-blue-300",
                  desc: "Bridges the event bus to React via useSyncExternalStore. Exports AgentProvider and all hooks: useThread, useComposer, useRunState, useApprovals."
                },
                {
                  pkg: "@wafer/ui",
                  color:
                    "border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/5",
                  nameColor: "text-violet-700 dark:text-violet-300",
                  desc: "Seven pre-built Tailwind components: AgentThread, Composer, RunTimeline, StatusBadge, ToolCallCard, ToolCallDetailsModal, and ApprovalPanel."
                },
                {
                  pkg: "@wafer/adapters",
                  color:
                    "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5",
                  nameColor: "text-emerald-700 dark:text-emerald-300",
                  desc: "Ready-made transport implementations. createOllamaTransport for local models. createGroqTransport for Groq's cloud API. Both support tool calling and streaming."
                }
              ].map((p) => (
                <div key={p.pkg} className={`rounded-xl border p-4 ${p.color}`}>
                  <p className={`font-mono text-sm font-semibold ${p.nameColor}`}>{p.pkg}</p>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Dependency graph
              </p>
              <Diagram>{`
 @wafer/protocol  ─────────────────────────────────────────┐
       │                                                    │
       ▼                                                    ▼
 @wafer/core  ◄──── @wafer/adapters                @wafer/react
       │                                                    │
       └──────────────────────────────────────────► @wafer/ui
                                                            │
                                                            ▼
                                                     wafer  (umbrella)
              `}</Diagram>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Arrows mean "depends on". <Code>wafer</Code> is a thin re-export umbrella that adds
                no runtime code.
              </p>
            </div>
          </Section>

          {/* ── Transport Contract ─────────────────────────────────── */}
          <Section
            id="transport"
            label="Core abstraction"
            title="The Transport Contract"
            subtitle="This is the most important idea in Wafer. Everything else follows from it."
          >
            <Callout icon="🔌" title="Real-life analogy: a USB-C port">
              <p>
                Your laptop has a USB-C port. The shape is fixed; that's the contract. You can plug
                in a charger, a monitor, a keyboard, or an external SSD. The laptop doesn't change
                when you swap accessories. <strong>AgentTransport is that port.</strong> Your React
                app is the laptop. Ollama, Groq, Claude, and OpenAI are the accessories.
              </p>
            </Callout>

            <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400">
              The interface has one required method and one optional method:
            </p>
            <CodeBlock lang="ts" code={transportInterface} />

            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
              The first argument to <Code>sendUserMessage</Code> is a snapshot of the conversation:
            </p>
            <CodeBlock lang="ts" code={sendUserMessageInput} />

            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
              The second argument, <Code>emit</Code>, is how a transport reports progress back to
              Wafer. Every event you call <Code>emit</Code> with is immediately fed into the state
              machine and causes React to re-render. Think of <Code>emit</Code> as the transport's
              only way to speak to the rest of the system.
            </p>

            <Note>
              You never call <Code>emit</Code> from your UI components or hooks. Only the transport
              does. This is what keeps the UI side of Wafer completely backend-agnostic.
            </Note>

            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
              The minimum viable transport emits just three events and you get a working streaming
              chat UI:
            </p>
            <Diagram>{`
  Transport lifecycle (minimum)

  ┌─ Your transport function ─────────────────────────────────────┐
  │                                                               │
  │   emit({ type: "message.created", role: "assistant", ... })  │
  │          │                                                    │
  │          │   ← LLM starts streaming chunks                   │
  │          │                                                    │
  │   emit({ type: "message.delta", delta: "Hello", ... })  × N  │
  │          │                                                    │
  │          │   ← LLM finishes                                   │
  │          │                                                    │
  │   emit({ type: "run.completed", ... })                        │
  │                                                               │
  └───────────────────────────────────────────────────────────────┘
            `}</Diagram>
          </Section>

          {/* ── Event System ───────────────────────────────────────── */}
          <Section
            id="events"
            label="How state changes"
            title="The Event System"
            subtitle="Every change to agent state comes from an event. There is no other way to mutate state. This is event sourcing: the events field in AgentState is a complete audit trail."
          >
            <Callout icon="📮" title="Real-life analogy: a bank ledger">
              <p>
                A bank doesn't store your balance directly. It stores every transaction (deposit,
                withdrawal, fee) as an immutable record. Your balance is always derived by replaying
                those records. Wafer's state machine works the same way. The <Code>events</Code>{" "}
                array is the ledger; <Code>AgentState</Code> is the balance sheet.
              </p>
            </Callout>

            <p className="mt-5 mb-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
              There are 11 event types. Here is what each one does:
            </p>

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5">
                    <th className="w-48 px-4 py-2.5 font-semibold">Event type</th>
                    <th className="px-4 py-2.5 font-semibold">Emitted when…</th>
                    <th className="px-4 py-2.5 font-semibold">Effect on state</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {events.map((e) => (
                    <tr key={e.type}>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-violet-600 dark:text-cyan-300">
                        {e.type}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{e.when}</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{e.effect}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-6 mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Example: events emitted for one tool-calling message
            </p>
            <Diagram>{`
User: "What's the weather in Tokyo?"
                         │
                         ▼
  1.  run.started           ← AgentClient generates a runId and kicks off
  2.  message.created       ← user message recorded (role: "user")
  3.  message.created       ← assistant placeholder created (role: "assistant")
  4.  tool.called           ← LLM says: call get_weather({ city: "Tokyo" })
  5.  tool.completed        ← execute() returned { temp: 22, condition: "Sunny" }
  6.  message.delta × 8     ← "The weather in Tokyo is 22°C and sunny." (streamed)
  7.  run.completed         ← transport is done, status back to idle
            `}</Diagram>

            <Note>
              Events are processed synchronously in order. If you inspect <Code>state.events</Code>{" "}
              after a run, you'll see the exact sequence above. Useful for debugging or building a
              timeline UI.
            </Note>
          </Section>

          {/* ── State Machine ──────────────────────────────────────── */}
          <Section
            id="state-machine"
            label="@wafer/core"
            title="The State Machine"
            subtitle="reduceEvent is a pure function. It takes the current state and one event and returns the next state. No side-effects, no mutations, fully deterministic."
          >
            <p className="mb-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
              The full shape of <Code>AgentState</Code>:
            </p>
            <CodeBlock lang="ts" code={agentStateShape} />

            <p className="mt-6 mb-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
              A simplified view of how <Code>reduceEvent</Code> works (the real implementation
              handles all 11 types):
            </p>
            <CodeBlock lang="ts" code={reduceEventExample} />

            <p className="mt-5 mb-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
              How the top-level <Code>status</Code> field transitions:
            </p>
            <Diagram>{`
                    sendUserMessage()
                          │
          ┌───────────────▼───────────────┐
          │                               │
        "idle"  ──run.started──►  "running"
          ▲                               │
          │                               ├──run.completed──► "idle"
          │                               │
          └──────run.failed / error ──────┴──run.failed──► "error"
            `}</Diagram>

            <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400">
              <Code>AgentClient</Code> wires everything together: it holds the current{" "}
              <Code>AgentState</Code>, exposes <Code>subscribe(listener)</Code> for React to attach
              to, and processes events through <Code>reduceEvent</Code> whenever the transport calls{" "}
              <Code>emit()</Code>.
            </p>
          </Section>

          {/* ── React Layer ────────────────────────────────────────── */}
          <Section
            id="react-layer"
            label="@wafer/react"
            title="The React Layer"
            subtitle="React and the event bus live in different worlds. useSyncExternalStore is the bridge."
          >
            <Callout icon="🌉" title="Real-life analogy: a translation booth at the UN">
              <p>
                Delegates speak different languages (React vs the event bus). The translation booth
                converts every statement the moment it's spoken so everyone always hears the same
                thing. <Code>useSyncExternalStore</Code> is that booth. It listens to the event bus
                and instantly re-renders the React components that need the updated data.
              </p>
            </Callout>

            <p className="mt-5 mb-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
              Here's how the bridge is implemented inside <Code>useAgentState</Code>:
            </p>
            <CodeBlock lang="ts" code={useSyncExternalStoreExample} />

            <p className="mt-5 mb-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
              All other hooks are slices of this same state. Each one selects only the fields its
              component needs, keeping re-renders surgical:
            </p>
            <CodeBlock lang="ts" code={hooksOverview} />

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                Which hook for which component?
              </div>
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {[
                    [
                      "useThread()",
                      "Message list, typing indicators",
                      "AgentThread, custom chat bubbles"
                    ],
                    ["useComposer()", "Send button, input box", "Composer, custom input forms"],
                    ["useRunState()", "Tool call progress, timeline", "RunTimeline, debug panels"],
                    [
                      "useApprovals()",
                      "Human-in-the-loop prompts",
                      "ApprovalPanel, confirmation dialogs"
                    ],
                    ["useAgentState()", "Full state access", "Fully custom UIs, debugging tools"]
                  ].map(([hook, use, component]) => (
                    <tr key={hook}>
                      <td className="w-40 px-4 py-2.5 font-mono text-[11px] text-violet-600 dark:text-cyan-300">
                        {hook}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{use}</td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-500">
                        {component}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* ── Adapters ───────────────────────────────────────────── */}
          <Section
            id="adapters"
            label="@wafer/adapters"
            title="Adapters: Ollama and Groq"
            subtitle="Adapters implement AgentTransport. They contain all the backend-specific logic so the rest of your app stays clean."
          >
            <p className="mb-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
              The most interesting part of any adapter is the{" "}
              <strong>agentic tool-calling loop</strong>. LLMs don't actually execute tools. They
              say "please call this function with these arguments," and the adapter runs it, feeds
              the result back, and asks the LLM to continue. This loop repeats until the model
              produces a final text response.
            </p>

            <p className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Tool-calling loop (used by both Ollama and Groq adapters)
            </p>
            <CodeBlock lang="ts" code={ollamaToolLoop} />

            <Diagram>{`
  Agentic loop: what happens when the LLM calls multiple tools

  ┌─ transport.sendUserMessage() ────────────────────────────────────────────┐
  │                                                                          │
  │   history = [...conversation so far...]                                  │
  │                                                                          │
  │   round 1 ──► call LLM  ──► model returns tool call: get_weather(Tokyo) │
  │                │              emit tool.called                           │
  │                │              run tool locally → { temp: 22 }           │
  │                │              emit tool.completed                        │
  │                └──► append tool result to history                        │
  │                                                                          │
  │   round 2 ──► call LLM  ──► model returns tool call: get_time(Tokyo)    │
  │                │              emit tool.called                           │
  │                │              run tool locally → "14:32 JST"            │
  │                │              emit tool.completed                        │
  │                └──► append tool result to history                        │
  │                                                                          │
  │   round 3 ──► call LLM  ──► no tool call, returns text response         │
  │                │              emit message.created (role: assistant)     │
  │                │              emit message.delta × N  (streaming)        │
  │                └──► done                                                 │
  │                                                                          │
  │   emit run.completed                                                     │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘
            `}</Diagram>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="mb-2 font-mono text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Ollama adapter
                </p>
                <ul className="space-y-1.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
                  <li>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      No tools:{" "}
                    </span>
                    uses streaming API (<Code>stream: true</Code>), emits one{" "}
                    <Code>message.delta</Code> per chunk
                  </li>
                  <li>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      With tools:{" "}
                    </span>
                    uses non-streaming API, runs agentic loop, up to <Code>maxToolRounds</Code>{" "}
                    iterations
                  </li>
                  <li>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Thinking:{" "}
                    </span>
                    optional <Code>think</Code> param enables model-side reasoning (
                    <Code>true | "low" | "medium" | "high"</Code>)
                  </li>
                  <li>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Base URL:{" "}
                    </span>
                    defaults to <Code>http://localhost:11434</Code>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="mb-2 font-mono text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Groq adapter
                </p>
                <ul className="space-y-1.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
                  <li>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      API format:{" "}
                    </span>
                    OpenAI-compatible (<Code>chat/completions</Code>) not Ollama format
                  </li>
                  <li>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Streaming:{" "}
                    </span>
                    uses SSE (Server-Sent Events) for text, non-streaming for tool calls
                  </li>
                  <li>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Endpoint:{" "}
                    </span>
                    calls your proxy route (default <Code>/api/chat</Code>), never the Groq API
                    directly from the browser
                  </li>
                  <li>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Default model:{" "}
                    </span>
                    <Code>llama-3.3-70b-versatile</Code>
                  </li>
                </ul>
              </div>
            </div>
          </Section>

          {/* ── End-to-End ─────────────────────────────────────────── */}
          <Section
            id="end-to-end"
            label="Putting it all together"
            title="End-to-End Walk-through"
            subtitle='Trace one user message, "Book me a flight to Tokyo", from keypress all the way to rendered response, touching every layer.'
          >
            <div className="space-y-5">
              {[
                {
                  n: "1",
                  color: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
                  title: "User types and hits Send",
                  body: (
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                      The <Code>Composer</Code> component renders an input and a button. Both are
                      wired to <Code>useComposer()</Code>. The user types, <Code>setInput</Code>{" "}
                      keeps the input in sync, and <Code>submit()</Code> is called on click.
                    </p>
                  )
                },
                {
                  n: "2",
                  color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-200",
                  title: "AgentClient.sendUserMessage(text) runs",
                  body: (
                    <>
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                        <Code>useComposer.submit()</Code> calls{" "}
                        <Code>client.sendUserMessage(text)</Code>. The client immediately generates
                        a <Code>runId</Code> and a <Code>messageId</Code>, emits{" "}
                        <Code>run.started</Code> and <Code>message.created</Code> (user), and then
                        calls <Code>transport.sendUserMessage()</Code>.
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        After emitting <Code>run.started</Code>, <Code>state.status</Code> becomes{" "}
                        <Code>"running"</Code>. The <Code>Composer</Code> input is immediately
                        disabled because <Code>useComposer</Code> reads <Code>isRunning</Code> from
                        state.
                      </p>
                    </>
                  )
                },
                {
                  n: "3",
                  color:
                    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
                  title: "Transport talks to the LLM",
                  body: (
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                      The Ollama adapter receives <Code>input</Code> (including the full history)
                      and the <Code>emit</Code> function. It calls Ollama's API. Since tools are
                      defined, it uses non-streaming mode and starts the agentic loop.
                    </p>
                  )
                },
                {
                  n: "4",
                  color: "bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200",
                  title: "Tool calls flow through the event bus",
                  body: (
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                      The LLM replies with a function call: <Code>search_flights</Code>. The adapter
                      emits <Code>tool.called</Code>, which flows through <Code>reduceEvent</Code>{" "}
                      into <Code>state.toolCalls</Code>. The <Code>RunTimeline</Code> component
                      renders the in-progress tool card immediately. The adapter runs{" "}
                      <Code>execute()</Code>, gets results, and emits <Code>tool.completed</Code>.
                      The card updates to show output.
                    </p>
                  )
                },
                {
                  n: "5",
                  color: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200",
                  title: "Streaming text appears word by word",
                  body: (
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                      The LLM no longer needs tools and returns a text response. The adapter emits{" "}
                      <Code>message.created</Code> (assistant) then one <Code>message.delta</Code>{" "}
                      per chunk. Each delta event calls all <Code>subscribe</Code> listeners.{" "}
                      <Code>useSyncExternalStore</Code> fires, React re-renders{" "}
                      <Code>AgentThread</Code>, and the text appears word by word in the UI.
                    </p>
                  )
                },
                {
                  n: "6",
                  color: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
                  title: "Run completes, UI unlocks",
                  body: (
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                      The adapter emits <Code>run.completed</Code>. <Code>state.status</Code> goes
                      back to <Code>"idle"</Code>. The <Code>Composer</Code> input re-enables. The{" "}
                      <Code>StatusBadge</Code> updates. The user can send the next message.
                    </p>
                  )
                }
              ].map((step) => (
                <div key={step.n} className="flex gap-4">
                  <div className="flex-none">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step.color}`}
                    >
                      {step.n}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pb-1">
                    <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                    {step.body}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Full data-flow summary
            </p>
            <Diagram>{`
  ┌─ React UI ─────────────────────────────────────────────────────────────┐
  │  Composer        AgentThread        RunTimeline        ApprovalPanel   │
  │     │                 ▲                  ▲                   ▲         │
  │     │            useThread()        useRunState()      useApprovals()  │
  │     │                 └────────────────────────────────────┘           │
  │     │                       useSyncExternalStore                       │
  └─────┼──────────────────────────────────────────────────────────────────┘
        │                               ▲
  submit()                       state changes
        │                               │
  ┌─────▼───────────────────────────────┴──────────────────────────────────┐
  │  AgentClient                                                            │
  │     sendUserMessage(text)  ──►  reduceEvent(state, event)  ──► notify  │
  │     resolveApproval(...)   ◄──  emit(event)                            │
  └─────┬────────────────────────────────────────────────────────────────-─┘
        │ transport.sendUserMessage(input, emit)
        │
  ┌─────▼──────────────────────────────────────────────────────────────────┐
  │  AgentTransport (e.g. createOllamaTransport)                           │
  │                                                                        │
  │   call LLM API  →  parse response  →  emit events  →  loop for tools  │
  └─────┬──────────────────────────────────────────────────────────────────┘
        │ HTTP
        ▼
   Ollama / Groq / Claude / OpenAI / LangGraph / …
            `}</Diagram>
          </Section>
        </div>

        {/* footer nav */}
        <div className="mt-16 flex flex-wrap gap-3 border-t border-slate-200 pt-8 dark:border-white/10">
          <Link
            to="/docs"
            className="inline-flex items-center rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10"
          >
            ← Docs Home
          </Link>
          <Link
            to="/docs/getting-started"
            className="inline-flex items-center rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10"
          >
            Getting Started →
          </Link>
          <Link
            to="/examples"
            className="inline-flex items-center rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-violet-500 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
          >
            Browse live examples →
          </Link>
        </div>
      </div>
    </div>
  );
}
