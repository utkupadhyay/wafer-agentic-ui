import { Link } from "@tanstack/react-router";

const githubRepoUrl = "https://github.com/utkupadhyay/wafer-agentic-ui";

export function DocsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
            Wafer Docs
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Documentation Hub
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            This route is reserved for product docs, architecture guides, integration references,
            and starter examples.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-base font-semibold text-white">Getting Started</h2>
            <p className="mt-2 text-sm text-slate-300">
              Installation, first example integration, and local Ollama setup.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-base font-semibold text-white">Architecture</h2>
            <p className="mt-2 text-sm text-slate-300">
              Protocol, core runtime, React adapter, UI kit, and backend adapters.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-base font-semibold text-white">GitHub</h2>
            <p className="mt-2 text-sm text-slate-300">
              Source code, issues, releases, and contribution workflow.
            </p>
          </article>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
            Examples
          </p>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <Link
              to="/examples/incident-form"
              className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
            >
              <h2 className="text-base font-semibold text-white">Incident Report Form</h2>
              <p className="mt-2 text-sm text-slate-300">
                Warehouse safety desk with AI autofill via Ollama chat.
              </p>
            </Link>
            <Link
              to="/examples/onboarding"
              className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
            >
              <h2 className="text-base font-semibold text-white">Onboarding Agent</h2>
              <p className="mt-2 text-sm text-slate-300">
                Employee onboarding form driven by tool-calling agent.
              </p>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center rounded-md border border-white/15 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Back to Landing
          </Link>
          <a
            className="inline-flex items-center rounded-md bg-cyan-400 px-3 py-1.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
            href={githubRepoUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open GitHub
          </a>
        </div>
      </section>
    </main>
  );
}
