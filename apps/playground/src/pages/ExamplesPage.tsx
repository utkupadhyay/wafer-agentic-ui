import { Link } from "@tanstack/react-router";

const examples = [
  {
    slug: "incident-form" as const,
    label: "Example 01",
    title: "Incident Report Form",
    description:
      "A warehouse safety desk where the agent reads a plain-English description of what happened and fills every form field in one shot — no manual entry required.",
    accent: "cyan",
    features: [
      "Natural language → structured form extraction",
      "LLM-powered autofill via Ollama (local, no API key)",
      "Regex fallback parser when LLM is unavailable",
      "Fields: reporter, shift, type, severity, location, time",
      "Embedded chat copilot for follow-up edits"
    ]
  },
  {
    slug: "onboarding" as const,
    label: "Example 02",
    title: "Onboarding Agent",
    description:
      "An employee onboarding form driven entirely by tool-calling. Write naturally and the agent maps your words to the right fields through function calls — no prompt engineering required on your end.",
    accent: "violet",
    features: [
      "Tool-calling agent with four registered functions",
      "Bulk field update via set_onboarding_fields tool",
      "Smart normalization — title case, date sanitization, email lowercasing",
      "Live readiness checklist that reacts as fields are filled",
      "Handles free-form aliases (e.g. 'joining date' → startDate)"
    ]
  },
  {
    slug: "data-visualizer" as const,
    label: "Example 03",
    title: "Data Visualizer",
    description:
      "A conversational analytics panel for an e-commerce app. Ask questions in plain English and the agent renders charts directly on the page by calling a render_chart tool — no query language required.",
    accent: "emerald",
    features: [
      "Agent drives chart state via render_chart tool calls",
      "Four chart types: bar, area, pie, table",
      "200 mock orders across 6 months and 5 categories",
      "Chart history strip — click any thumbnail to revisit",
      "Inline split-pane layout — chat sidebar, chart main panel"
    ]
  },
  {
    slug: "product-filter" as const,
    label: "Example 04",
    title: "Product Filter",
    description:
      "A fashion catalog where the agent translates plain-English requests into filter state — category, color, size, price, rating, and sort order — by calling set_filters. The grid re-renders instantly.",
    accent: "rose",
    features: [
      "Agent controls filter state via set_filters tool calls",
      "Filters: category, color, size, price range, rating, in-stock",
      "Additive updates — 'also show blue' merges with current state",
      "Active filter chips with × removal and clear-all",
      "70+ mock products across 5 categories and 9 colors"
    ]
  }
] as const;

const accentStyles = {
  cyan: {
    label: "text-cyan-400/80",
    border: "hover:border-cyan-300/25",
    tag: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
    cta: "text-cyan-400 group-hover:text-cyan-300",
    dot: "bg-cyan-400/60"
  },
  violet: {
    label: "text-violet-400/80",
    border: "hover:border-violet-300/25",
    tag: "border-violet-300/30 bg-violet-300/10 text-violet-200",
    cta: "text-violet-400 group-hover:text-violet-300",
    dot: "bg-violet-400/60"
  },
  emerald: {
    label: "text-emerald-400/80",
    border: "hover:border-emerald-300/25",
    tag: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    cta: "text-emerald-400 group-hover:text-emerald-300",
    dot: "bg-emerald-400/60"
  },
  rose: {
    label: "text-rose-400/80",
    border: "hover:border-rose-300/25",
    tag: "border-rose-300/30 bg-rose-300/10 text-rose-200",
    cta: "text-rose-400 group-hover:text-rose-300",
    dot: "bg-rose-400/60"
  }
};

export function ExamplesPage() {
  return (
    <main className="min-h-screen bg-[#050915] px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Playground
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Examples</h1>
          <p className="max-w-xl text-sm leading-7 text-slate-400">
            Each example runs against a local Ollama instance. Set{" "}
            <code className="rounded bg-white/8 px-1 py-0.5 text-xs text-slate-300">
              VITE_OLLAMA_MODEL
            </code>{" "}
            in your{" "}
            <code className="rounded bg-white/8 px-1 py-0.5 text-xs text-slate-300">.env</code> to
            point at your preferred model.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {examples.map((example) => {
            const s = accentStyles[example.accent];
            return (
              <Link
                key={example.slug}
                to={`/examples/${example.slug}`}
                className={`group flex flex-col rounded-2xl border border-white/10 bg-white/4 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur transition ${s.border} hover:bg-white/6`}
              >
                <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${s.label}`}>
                  {example.label}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">{example.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-400">{example.description}</p>

                <ul className="mt-5 space-y-2">
                  {example.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <p className={`mt-6 text-xs font-medium transition ${s.cta}`}>Open example →</p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
