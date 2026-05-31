import { Link } from "@tanstack/react-router";
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

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-none">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white dark:bg-cyan-400 dark:text-slate-950">
          {n}
        </span>
      </div>
      <div className="min-w-0 flex-1 pb-6">
        <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        {children}
      </div>
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

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900 dark:border-violet-400/20 dark:bg-violet-400/5 dark:text-violet-100">
      <span className="mr-2 font-bold text-blue-600 dark:text-violet-400">Tip</span>
      {children}
    </div>
  );
}

function Badge({
  label,
  color
}: {
  label: string;
  color: "violet" | "blue" | "emerald" | "amber" | "rose";
}) {
  const cls = {
    violet:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-300",
    blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300",
    amber:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300",
    rose: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300"
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls[color]}`}
    >
      {label}
    </span>
  );
}

// ─── table of contents ────────────────────────────────────────────────────────

const tocSections = [
  { id: "what-is-wafer", label: "What is Wafer?" },
  { id: "installation", label: "Installation" },
  { id: "quick-start", label: "Quick Start" },
  { id: "ollama", label: "Local LLM — Ollama" },
  { id: "groq", label: "Groq (Free Cloud)" },
  { id: "claude", label: "Claude — Anthropic" },
  { id: "openai", label: "OpenAI" },
  { id: "langgraph", label: "LangGraph" },
  { id: "mastra", label: "Mastra" },
  { id: "custom-transport", label: "Custom Transport" }
];

// ─── code snippets ────────────────────────────────────────────────────────────

const snippets = {
  install: `npm install wafer
# or
pnpm add wafer
# or
yarn add wafer`,

  tailwindSource: `/* In your global CSS file (e.g. src/styles.css) */
@source "../../node_modules/wafer/dist/**/*.js";`,

  quickStartHooks: `import { createAgentClient, AgentProvider, useThread, useComposer } from "wafer";
import { createOllamaTransport } from "wafer/adapters/ollama";

// Create the client once — outside the component
const client = createAgentClient({
  transport: createOllamaTransport({ model: "llama3.2" })
});

function Chat() {
  const { messages } = useThread();
  const { input, setInput, submit, isRunning } = useComposer();

  return (
    <div>
      {messages.map(msg => (
        <p key={msg.id}>
          <strong>{msg.role}:</strong> {msg.content}
        </p>
      ))}

      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Ask anything…"
      />
      <button onClick={() => submit()} disabled={isRunning}>
        {isRunning ? "Thinking…" : "Send"}
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AgentProvider client={client}>
      <Chat />
    </AgentProvider>
  );
}`,

  quickStartUI: `import { createAgentClient, AgentProvider, AgentThread, Composer } from "wafer";
import { createOllamaTransport } from "wafer/adapters/ollama";

const client = createAgentClient({
  transport: createOllamaTransport({ model: "llama3.2" })
});

export default function App() {
  return (
    <AgentProvider client={client}>
      <AgentThread title="My Agent" />
      <Composer placeholder="Ask anything…" />
    </AgentProvider>
  );
}`,

  ollamaPull: `# General purpose — good starting point
ollama pull llama3.2

# Smarter, still runs on most laptops
ollama pull llama3.1:8b

# Great tool-calling model
ollama pull qwen2.5:7b

# Fast and capable
ollama pull mistral`,

  ollamaBasic: `import { createOllamaTransport } from "wafer/adapters/ollama";

const transport = createOllamaTransport({
  model: "llama3.2",                        // required
  baseUrl: "http://localhost:11434",         // default — Ollama's port
  systemPrompt: "You are a helpful assistant.",
  maxToolRounds: 6,                          // max agent loop iterations
  think: "low",                             // thinking mode: true | "low" | "medium" | "high"
  requestOptions: {                          // passed directly to Ollama
    temperature: 0.7,
    num_predict: 1024
  }
});`,

  ollamaTools: `import { createOllamaTransport } from "wafer/adapters/ollama";

const transport = createOllamaTransport({
  model: "qwen2.5:7b",
  systemPrompt: "You are a helpful assistant. Always call a tool when relevant.",

  tools: [
    {
      function: {
        name: "get_weather",
        description: "Get the current weather for a city.",
        parameters: {
          type: "object",
          required: ["city"],
          properties: {
            city: { type: "string", description: "The city name, e.g. 'London'" }
          }
        }
      },
      // execute() receives the parsed arguments and must return a value
      execute: async (args) => {
        const response = await fetch(\`/api/weather?city=\${args.city}\`);
        const data = await response.json();
        return { temperature: data.temp, condition: data.sky };
      }
    }
  ]
});`,

  groqProxy: `// api/chat.ts  (Vercel Edge Function)
export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  const body = await req.text();

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // GROQ_API_KEY lives in Vercel env vars — never in the browser
      Authorization: \`Bearer \${process.env.GROQ_API_KEY}\`
    },
    body
  });

  return new Response(res.body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" }
  });
}`,

  groqTransport: `import { createGroqTransport } from "wafer/adapters/groq";

const transport = createGroqTransport({
  model: "llama-3.3-70b-versatile", // default — very capable, great tool calling
  endpoint: "/api/chat",             // your proxy URL
  systemPrompt: "You are a helpful assistant.",
  maxToolRounds: 6
});`,

  claudeInstall: `npm install @anthropic-ai/sdk`,

  claudeTransport: `import Anthropic from "@anthropic-ai/sdk";
import type { AgentTransport } from "wafer";

export function createClaudeTransport({
  apiKey,
  model = "claude-sonnet-4-6"
}: {
  apiKey: string;
  model?: string;
}): AgentTransport {
  const client = new Anthropic({ apiKey });
  const now = () => new Date().toISOString();
  const uid = (p: string) => \`\${p}_\${crypto.randomUUID()}\`;

  return {
    async sendUserMessage(input, emit) {
      const msgId = uid("msg");

      // 1. Tell Wafer a new assistant message is starting
      emit({
        type: "message.created",
        threadId: input.threadId, messageId: msgId,
        role: "assistant", runId: input.runId,
        content: "", createdAt: now()
      });

      // 2. Stream from Claude
      const stream = await client.messages.stream({
        model,
        max_tokens: 2048,
        messages: input.history
          .filter(m => m.role === "user" || m.role === "assistant")
          .map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
      });

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          emit({
            type: "message.delta",
            threadId: input.threadId, messageId: msgId,
            runId: input.runId, delta: event.delta.text, createdAt: now()
          });
        }
      }

      // 3. Signal the run is done
      emit({ type: "run.completed", threadId: input.threadId, runId: input.runId, createdAt: now() });
    }
  };
}`,

  claudeUse: `import { createAgentClient, AgentProvider, AgentThread, Composer } from "wafer";
import { createClaudeTransport } from "./claudeTransport";

const client = createAgentClient({
  transport: createClaudeTransport({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    model: "claude-haiku-4-5-20251001" // cheapest + fastest Claude
  })
});

export default function App() {
  return (
    <AgentProvider client={client}>
      <AgentThread />
      <Composer />
    </AgentProvider>
  );
}`,

  openaiInstall: `npm install openai`,

  openaiTransport: `import OpenAI from "openai";
import type { AgentTransport } from "wafer";

export function createOpenAITransport({
  apiKey,
  model = "gpt-4o"
}: {
  apiKey: string;
  model?: string;
}): AgentTransport {
  const client = new OpenAI({ apiKey });
  const now = () => new Date().toISOString();
  const uid = (p: string) => \`\${p}_\${crypto.randomUUID()}\`;

  return {
    async sendUserMessage(input, emit) {
      const msgId = uid("msg");
      let completed = false;

      emit({
        type: "message.created",
        threadId: input.threadId, messageId: msgId,
        role: "assistant", runId: input.runId,
        content: "", createdAt: now()
      });

      const stream = await client.chat.completions.create({
        model,
        messages: input.history.map(m => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content
        })),
        stream: true
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? "";
        if (delta) {
          emit({
            type: "message.delta",
            threadId: input.threadId, messageId: msgId,
            runId: input.runId, delta, createdAt: now()
          });
        }
        if (chunk.choices[0]?.finish_reason) {
          completed = true;
          emit({ type: "run.completed", threadId: input.threadId, runId: input.runId, createdAt: now() });
        }
      }

      if (!completed) {
        emit({ type: "run.completed", threadId: input.threadId, runId: input.runId, createdAt: now() });
      }
    }
  };
}`,

  langGraphTransport: `import type { AgentTransport } from "wafer";

export function createLangGraphTransport({
  apiUrl,
  graphId,
  apiKey
}: {
  apiUrl: string;   // e.g. "https://api.langchain.com"
  graphId: string;
  apiKey: string;
}): AgentTransport {
  const now = () => new Date().toISOString();
  const uid = (p: string) => \`\${p}_\${crypto.randomUUID()}\`;

  return {
    async sendUserMessage(input, emit) {
      const msgId = uid("msg");

      emit({
        type: "message.created",
        threadId: input.threadId, messageId: msgId,
        role: "assistant", runId: input.runId,
        content: "", createdAt: now()
      });

      const response = await fetch(\`\${apiUrl}/runs/stream\`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Api-Key": apiKey },
        body: JSON.stringify({
          graph_id: graphId,
          input: { messages: input.history.map(m => ({ role: m.role, content: m.content })) },
          stream_mode: ["messages"]
        })
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const json = JSON.parse(line.slice(5).trim()) as Record<string, unknown>;
          if (json.type === "messages/partial") {
            const delta = (json.data as { content?: string })?.content ?? "";
            if (delta) {
              emit({
                type: "message.delta",
                threadId: input.threadId, messageId: msgId,
                runId: input.runId, delta, createdAt: now()
              });
            }
          }
        }
      }

      emit({ type: "run.completed", threadId: input.threadId, runId: input.runId, createdAt: now() });
    }
  };
}`,

  mastraTransport: `import type { AgentTransport } from "wafer";

export function createMastraTransport({
  mastraUrl,
  agentId
}: {
  mastraUrl: string; // e.g. "http://localhost:4111"
  agentId: string;
}): AgentTransport {
  const now = () => new Date().toISOString();
  const uid = (p: string) => \`\${p}_\${crypto.randomUUID()}\`;

  return {
    async sendUserMessage(input, emit) {
      const msgId = uid("msg");

      emit({
        type: "message.created",
        threadId: input.threadId, messageId: msgId,
        role: "assistant", runId: input.runId,
        content: "", createdAt: now()
      });

      const response = await fetch(\`\${mastraUrl}/api/agents/\${agentId}/stream\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: input.history.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;
          const json = JSON.parse(data) as Record<string, unknown>;
          // Mastra uses AI SDK streaming format
          if (json.type === "text-delta" && typeof json.textDelta === "string") {
            emit({
              type: "message.delta",
              threadId: input.threadId, messageId: msgId,
              runId: input.runId, delta: json.textDelta, createdAt: now()
            });
          }
        }
      }

      emit({ type: "run.completed", threadId: input.threadId, runId: input.runId, createdAt: now() });
    }
  };
}`,

  transportInterface: `import type { AgentTransport } from "wafer";

const myTransport: AgentTransport = {
  async sendUserMessage(input, emit) {
    // input.threadId   — stable ID for this conversation
    // input.runId      — unique ID for this specific user message + response
    // input.text       — the user's raw message text
    // input.history    — full message history: Array<{ role, content }>

    // Call emit() to push events into Wafer's state machine.
    // Everything you emit becomes visible via hooks and components.

    // ... your LLM call here ...
  },

  // Optional — only needed if your agent asks for human approval
  async submitApproval(input, emit) {
    emit({
      type: "approval.resolved",
      threadId: input.threadId, runId: input.runId,
      approvalId: input.approvalId, decision: input.decision,
      createdAt: new Date().toISOString()
    });
  }
};`,

  eventsCheatsheet: `// ── Message events ──────────────────────────────────────────────────────────
emit({ type: "message.created", threadId, messageId, role: "assistant", runId, content: "", createdAt });
emit({ type: "message.delta",   threadId, messageId, runId, delta: "Hello", createdAt });

// ── Tool events ──────────────────────────────────────────────────────────────
emit({ type: "tool.called",     threadId, runId, toolCallId, toolName: "search", input: { query: "…" }, createdAt });
emit({ type: "tool.completed",  threadId, runId, toolCallId, output: { results: [] }, createdAt });
emit({ type: "tool.failed",     threadId, runId, toolCallId, error: "Timeout", createdAt });

// ── Approval events ──────────────────────────────────────────────────────────
emit({ type: "approval.requested", threadId, runId, approvalId, actionLabel: "Send email", createdAt });

// ── Run lifecycle ────────────────────────────────────────────────────────────
emit({ type: "run.completed", threadId, runId, createdAt });
emit({ type: "run.failed",    threadId, runId, error: "Something broke", createdAt });`
};

// ─── page ─────────────────────────────────────────────────────────────────────

export function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <NavBar breadcrumbs={[{ label: "Docs", to: "/docs" }, { label: "Getting Started" }]} />

      <div className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        {/* hero */}
        <header className="py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500 dark:text-cyan-200/70">
            Wafer Docs
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Getting Started
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
            Add a fully wired AI agent to your React app in minutes — with any LLM backend. Local
            Ollama today, Claude tomorrow, LangGraph next week. The same four lines of React code
            work with all of them.
          </p>

          {/* quick nav pills */}
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
          {/* ── What is Wafer ─────────────────────────────────────────── */}
          <Section
            id="what-is-wafer"
            label="Overview"
            title="What is Wafer?"
            subtitle="Wafer is a modular React toolkit for embedding AI agents directly into product UIs. It handles state, streaming, tool calls, and approvals — so you only have to write the parts specific to your product."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  pkg: "@wafer/core",
                  desc: "Agent client and state machine. Tracks messages, tool calls, runs, and approvals."
                },
                {
                  pkg: "@wafer/react",
                  desc: "React provider and hooks. useThread, useComposer, useRunState, useApprovals."
                },
                {
                  pkg: "@wafer/ui",
                  desc: "Pre-built components — AgentThread, Composer, RunTimeline, ApprovalPanel, ToolCallCard."
                },
                {
                  pkg: "@wafer/adapters",
                  desc: "Ready-made adapters for Ollama and Groq. Add any other backend in ~50 lines."
                }
              ].map((p) => (
                <div
                  key={p.pkg}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <p className="font-mono text-sm font-semibold text-violet-600 dark:text-cyan-300">
                    {p.pkg}
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-7 text-slate-600 dark:text-slate-400">
              The core idea is the <Code>AgentTransport</Code> interface — a two-method contract
              that separates your UI from your LLM backend. Swap the transport and the rest of the
              app is untouched.
            </p>
          </Section>

          {/* ── Installation ──────────────────────────────────────────── */}
          <Section id="installation" label="Step 1" title="Install the packages">
            <CodeBlock lang="bash" code={snippets.install} />
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
              <p className="font-semibold text-slate-900 dark:text-white">Prerequisites</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">React 18 or 19</strong> —
                  hooks and <Code>useSyncExternalStore</Code> are required
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Tailwind CSS v4</strong> —
                  required peer dependency
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                Tell Tailwind to scan Wafer's bundle
              </p>
              <p className="mb-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Wafer ships pre-built JS — Tailwind won't see the component class names unless you
                point it at the <Code>dist</Code> files. Add one line to your global CSS:
              </p>
              <CodeBlock lang="css" code={snippets.tailwindSource} />
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                Without this, Tailwind's production build will purge the component styles and the UI
                will appear unstyled.
              </p>
            </div>
          </Section>

          {/* ── Quick start ───────────────────────────────────────────── */}
          <Section
            id="quick-start"
            label="Step 2"
            title="Your first agent"
            subtitle="Two ways to build a working chat UI. Pick whichever fits your project."
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Option A</span>
              <span className="text-sm text-slate-500">— use hooks, wire your own UI</span>
            </div>
            <CodeBlock lang="tsx" code={snippets.quickStartHooks} />

            <div className="mb-2 mt-8 flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Option B</span>
              <span className="text-sm text-slate-500">— drop in the pre-built components</span>
            </div>
            <CodeBlock lang="tsx" code={snippets.quickStartUI} />

            <Note>
              Both examples use <Code>createOllamaTransport</Code> to talk to a local Ollama
              instance. Replace it with any other transport and nothing else changes.
            </Note>
          </Section>

          {/* ── Ollama ────────────────────────────────────────────────── */}
          <Section
            id="ollama"
            label="Integration"
            title={
              <span className="flex items-center gap-3">
                Local LLM via Ollama <Badge label="Free · No API key" color="emerald" />
              </span>
            }
            subtitle="Ollama runs open-source models (LLaMA, Mistral, Qwen, Gemma…) on your machine with zero cost and no data leaving your network."
          >
            <Step n={1} title="Install Ollama">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                Download and install from{" "}
                <a
                  href="https://ollama.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-600 underline underline-offset-2 hover:text-violet-500 dark:text-cyan-400 dark:hover:text-cyan-300"
                >
                  ollama.com
                </a>
                . Once installed, Ollama runs a local server at <Code>http://localhost:11434</Code>.
              </p>
            </Step>
            <Step n={2} title="Pull a model">
              <CodeBlock lang="bash" code={snippets.ollamaPull} />
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                For tool calling, <Code>qwen2.5:7b</Code> or <Code>llama3.1:8b</Code> are the most
                reliable choices.
              </p>
            </Step>
            <Step n={3} title="Create the transport">
              <CodeBlock lang="ts" code={snippets.ollamaBasic} />
            </Step>
            <Step n={4} title="Add tools (optional)">
              <p className="mb-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Tools let the model call functions in your app — reading data, updating state,
                fetching APIs. Define each tool with a JSON Schema and an <Code>execute</Code>{" "}
                function that runs when the model calls it.
              </p>
              <CodeBlock lang="ts" code={snippets.ollamaTools} />
            </Step>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
              <p className="mb-3 font-semibold text-slate-900 dark:text-white">All options</p>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 dark:border-white/10">
                    <th className="pb-2 pr-4 font-semibold">Option</th>
                    <th className="pb-2 pr-4 font-semibold">Default</th>
                    <th className="pb-2 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {[
                    ["model", "required", "Ollama model name, e.g. llama3.2"],
                    ["baseUrl", "http://localhost:11434", "Ollama server URL"],
                    ["systemPrompt", "—", "System message prepended to every request"],
                    ["tools", "[]", "Tool definitions with execute() callbacks"],
                    ["maxToolRounds", "6", "Max agent-loop iterations before stopping"],
                    ["think", "—", "Enable thinking: true | 'low' | 'medium' | 'high'"],
                    ["requestOptions", "—", "Raw Ollama options (temperature, num_predict…)"],
                    ["forceToolCallRetryCount", "0", "Retries if model skips a required tool call"]
                  ].map(([opt, def, desc]) => (
                    <tr key={opt}>
                      <td className="py-2 pr-4 font-mono text-violet-600 dark:text-cyan-300">
                        {opt}
                      </td>
                      <td className="py-2 pr-4 text-slate-500">{def}</td>
                      <td className="py-2 text-slate-600 dark:text-slate-400">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* ── Groq ──────────────────────────────────────────────────── */}
          <Section
            id="groq"
            label="Integration"
            title={
              <span className="flex items-center gap-3">
                Groq <Badge label="Free tier · Cloud" color="blue" />
              </span>
            }
            subtitle="Groq offers a generous free tier with extremely fast inference — no GPU needed. Perfect for deployed demos and production apps with low-to-moderate traffic."
          >
            <Step n={1} title="Get a free API key">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                Sign up at{" "}
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-600 underline underline-offset-2 hover:text-violet-500 dark:text-cyan-400 dark:hover:text-cyan-300"
                >
                  console.groq.com
                </a>{" "}
                — no credit card required.
              </p>
            </Step>
            <Step n={2} title="Create a server-side proxy">
              <p className="mb-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Never put an API key in the browser. Create a backend route that forwards requests
                to Groq and adds the key server-side.
              </p>
              <CodeBlock lang="ts" code={snippets.groqProxy} />
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Set <Code>GROQ_API_KEY</Code> in your hosting platform's env vars — never in{" "}
                <Code>.env</Code> files that ship to the client.
              </p>
            </Step>
            <Step n={3} title="Create the transport">
              <CodeBlock lang="ts" code={snippets.groqTransport} />
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-white">
                  Free models on Groq
                </p>
                <ul className="space-y-1 text-xs">
                  {[
                    ["llama-3.3-70b-versatile", "Very capable, best for tool calling"],
                    ["llama-3.1-8b-instant", "Ultra-fast for simple tasks"],
                    ["gemma2-9b-it", "Google's Gemma — fast and capable"],
                    ["moonshotai/kimi-k2-instruct", "Strong reasoning, complex tasks"]
                  ].map(([m, d]) => (
                    <li key={m} className="flex gap-3">
                      <code className="w-56 flex-none text-violet-600 dark:text-cyan-300">{m}</code>
                      <span className="text-slate-500">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Step>
          </Section>

          {/* ── Claude ────────────────────────────────────────────────── */}
          <Section
            id="claude"
            label="Integration"
            title={
              <span className="flex items-center gap-3">
                Claude — Anthropic <Badge label="Custom transport" color="violet" />
              </span>
            }
            subtitle="Since AgentTransport is a plain interface, you can connect Claude by writing a small adapter. Here's the full implementation."
          >
            <Step n={1} title="Install the Anthropic SDK">
              <CodeBlock lang="bash" code={snippets.claudeInstall} />
            </Step>
            <Step n={2} title="Write the transport">
              <CodeBlock lang="ts" code={snippets.claudeTransport} />
            </Step>
            <Step n={3} title="Use it like any other transport">
              <CodeBlock lang="tsx" code={snippets.claudeUse} />
            </Step>
            <Tip>
              For tool calling with Claude, use the <Code>tools</Code> parameter in the Anthropic
              messages API. Claude returns <Code>tool_use</Code> blocks — emit{" "}
              <Code>tool.called</Code> when you see one, execute it, then emit{" "}
              <Code>tool.completed</Code> with the result before continuing.
            </Tip>
          </Section>

          {/* ── OpenAI ────────────────────────────────────────────────── */}
          <Section
            id="openai"
            label="Integration"
            title={
              <span className="flex items-center gap-3">
                OpenAI <Badge label="Custom transport" color="emerald" />
              </span>
            }
            subtitle="OpenAI's Chat Completions API is the most widely used LLM interface. The pattern is nearly identical to the Groq adapter."
          >
            <Step n={1} title="Install the OpenAI SDK">
              <CodeBlock lang="bash" code={snippets.openaiInstall} />
            </Step>
            <Step n={2} title="Write the transport">
              <CodeBlock lang="ts" code={snippets.openaiTransport} />
            </Step>
            <Note>
              Don't expose <Code>OPENAI_API_KEY</Code> in the browser. Use the same proxy pattern
              shown in the Groq section, or run this transport in a server component / API route.
            </Note>
          </Section>

          {/* ── LangGraph ─────────────────────────────────────────────── */}
          <Section
            id="langgraph"
            label="Integration"
            title={
              <span className="flex items-center gap-3">
                LangGraph <Badge label="Custom transport" color="amber" />
              </span>
            }
            subtitle="LangGraph builds stateful, multi-step agent graphs with branching, memory, and checkpointing. Connect a deployed graph to Wafer by streaming its output."
          >
            <Step n={1} title="Deploy your graph">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                Use{" "}
                <a
                  href="https://langchain-ai.github.io/langgraph/cloud/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-600 underline underline-offset-2 hover:text-violet-500 dark:text-cyan-400 dark:hover:text-cyan-300"
                >
                  LangGraph Cloud
                </a>{" "}
                or self-host. You'll need the deployment URL, graph ID, and API key.
              </p>
            </Step>
            <Step n={2} title="Write the transport">
              <CodeBlock lang="ts" code={snippets.langGraphTransport} />
            </Step>
            <Note>
              LangGraph's streaming format varies by <Code>stream_mode</Code>. The example uses{" "}
              <Code>"messages"</Code> mode. Adjust event parsing if your graph uses a different
              mode.
            </Note>
          </Section>

          {/* ── Mastra ────────────────────────────────────────────────── */}
          <Section
            id="mastra"
            label="Integration"
            title={
              <span className="flex items-center gap-3">
                Mastra <Badge label="Custom transport" color="rose" />
              </span>
            }
            subtitle="Mastra is a TypeScript-first agent framework with built-in memory, tool use, and workflow support."
          >
            <Step n={1} title="Run your Mastra agent">
              <CodeBlock
                lang="bash"
                code={`npx create-mastra@latest\ncd my-mastra-app\nnpm run dev   # starts on http://localhost:4111`}
              />
            </Step>
            <Step n={2} title="Write the transport">
              <CodeBlock lang="ts" code={snippets.mastraTransport} />
            </Step>
            <Tip>
              Mastra's streaming API follows the{" "}
              <a
                href="https://sdk.vercel.ai"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline underline-offset-2 hover:text-blue-500 dark:text-violet-400 dark:hover:text-violet-300"
              >
                AI SDK
              </a>{" "}
              data stream format. If Mastra updates its streaming spec, adjust the{" "}
              <Code>json.type === "text-delta"</Code> check accordingly.
            </Tip>
          </Section>

          {/* ── Custom transport ──────────────────────────────────────── */}
          <Section
            id="custom-transport"
            label="Reference"
            title="Building your own transport"
            subtitle="Any backend — REST API, WebSocket, gRPC, local function — can plug into Wafer. Implement two methods and you're done."
          >
            <CodeBlock lang="ts" code={snippets.transportInterface} />

            <p className="mb-4 mt-8 text-sm leading-7 text-slate-600 dark:text-slate-400">
              The <Code>emit()</Code> function accepts these events. Call them as your backend
              progresses:
            </p>
            <CodeBlock lang="ts" code={snippets.eventsCheatsheet} />

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
              <p className="mb-3 font-semibold text-slate-900 dark:text-white">
                Minimum viable transport
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                To get a working chat UI, you only need to emit three events per response:
              </p>
              <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <Code>message.created</Code> — before you start streaming
                </li>
                <li>
                  <Code>message.delta</Code> — once per chunk of text
                </li>
                <li>
                  <Code>run.completed</Code> — when the response is done
                </li>
              </ol>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Tool events, approval events, and run failure events are optional — add them as your
                agent grows more sophisticated.
              </p>
            </div>
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
