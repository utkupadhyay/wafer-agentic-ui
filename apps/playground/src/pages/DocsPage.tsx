import { Link } from "@tanstack/react-router";
import { NavBar } from "../components/NavBar";

export function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <NavBar breadcrumbs={[{ label: "Docs" }]} />

      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-200/80">
            Wafer Docs
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Documentation Hub
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Everything you need to build AI agent interfaces with Wafer.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            to="/docs/getting-started"
            className="rounded-xl border border-cyan-300 bg-cyan-50 p-5 transition hover:bg-cyan-100 dark:border-cyan-400/30 dark:bg-cyan-400/5 dark:hover:bg-cyan-400/10"
          >
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Getting Started
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Install Wafer, run your first agent, and connect any LLM — Ollama, Groq, Claude,
              OpenAI, LangGraph, Mastra, or your own backend.
            </p>
            <p className="mt-3 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
              Read the guide →
            </p>
          </Link>
          <Link
            to="/docs/architecture"
            className="rounded-xl border border-violet-200 bg-violet-50 p-5 transition hover:bg-violet-100 dark:border-violet-400/30 dark:bg-violet-400/5 dark:hover:bg-violet-400/10"
          >
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Architecture</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              How Wafer works end-to-end — event system, state machine, React layer, adapters, and
              the Transport contract.
            </p>
            <p className="mt-3 text-xs font-semibold text-violet-600 dark:text-violet-400">
              Read the guide →
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
