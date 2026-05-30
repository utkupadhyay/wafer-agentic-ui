import { Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring } from "framer-motion";
import { useMemo, useRef } from "react";

const architectureLayers = [
  {
    name: "Protocol Contract",
    packageName: "@wafer/protocol",
    description:
      "Normalizes agent events like run lifecycle, tool calls, approvals, and thread updates."
  },
  {
    name: "Core Runtime",
    packageName: "@wafer/core",
    description:
      "Consumes normalized events, maintains state, and projects reliable run and thread snapshots."
  },
  {
    name: "React Adapter",
    packageName: "@wafer/react",
    description:
      "Exposes hooks and provider primitives so product teams can compose agent experiences fast."
  },
  {
    name: "UI Kit",
    packageName: "@wafer/ui",
    description:
      "Prebuilt components for chat threads, composers, timelines, approvals, and tool traces."
  },
  {
    name: "Backend Adapters",
    packageName: "@wafer/adapters",
    description:
      "Bridges any backend to Wafer events, including LangGraph, Mastra, Ollama, or custom runtimes."
  }
];

const productHighlights = [
  "Lightweight, modular architecture",
  "Runs with local or hosted LLM backends",
  "LLM-first interaction with human approval support",
  "Drop-in React primitives and polished components"
];

const githubRepoUrl = "https://github.com/utkupadhyay/wafer-agentic-ui";

export function LandingPage() {
  const architectureRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll();
  const pageProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.25
  });

  const { scrollYProgress: architectureScrollProgress } = useScroll({
    target: architectureRef,
    offset: ["start 0.92", "end 0.2"]
  });
  const architectureLineProgress = useSpring(architectureScrollProgress, {
    stiffness: 150,
    damping: 28,
    mass: 0.2
  });

  const layerCards = useMemo(
    () =>
      architectureLayers.map((layer, index) => (
        <motion.article
          key={layer.packageName}
          className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
            delay: index * 0.08
          }}
        >
          <div className="flex items-start gap-4">
            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-xs font-semibold text-cyan-200">
              {index + 1}
            </span>
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-cyan-100/80">
                {layer.name}
              </p>
              <p className="text-sm font-semibold text-white">{layer.packageName}</p>
              <p className="text-sm leading-6 text-slate-300">{layer.description}</p>
            </div>
          </div>
        </motion.article>
      )),
    []
  );

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050915] text-slate-100">
      <motion.div
        className="fixed left-0 right-0 top-0 z-50 h-0.5 origin-left bg-linear-to-r from-cyan-400 via-violet-400 to-cyan-400"
        style={{ scaleX: pageProgress }}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-56 h-112 w-md rounded-full bg-cyan-500/20 blur-3xl"
          animate={{ x: [0, 28, 0], y: [0, 14, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 13, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-48 h-100 w-100 rounded-full bg-violet-500/20 blur-3xl"
          animate={{ x: [0, -24, 0], y: [0, -16, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 14, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(45,212,191,0.16),transparent_34%),radial-gradient(circle_at_80%_100%,rgba(139,92,246,0.18),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-size-[34px_34px]" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-white/10 bg-slate-950/55 px-5 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur">
          <nav className="flex flex-wrap items-center justify-end gap-2">
            <Link
              to="/examples/incident-form"
              className="inline-flex items-center rounded-md border border-white/15 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Examples
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center rounded-md border border-white/15 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Docs
            </Link>
            <a
              className="inline-flex items-center rounded-md border border-white/15 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              href={githubRepoUrl}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </nav>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
              Wafer Agentic UI
            </p>
          </div>

          <div>
            <h1 className="mt-1 text-lg font-semibold text-white sm:text-xl">
              Lightweight Agent Interfaces for Real Products
            </h1>
          </div>
        </header>

        <motion.section
          className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200/85">
              Why Wafer
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Agentic UI that stays fast, flexible, and backend-neutral.
            </h2>
            <p className="max-w-2xl text-base leading-7 text-slate-300">
              Wafer is named for one reason: it stays lightweight while giving you production-grade
              agent UI primitives. Use it with LangGraph, Mastra, Ollama, or your own orchestration
              runtime and keep your frontend architecture clean.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-md border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">
                React v1
              </span>
              <span className="inline-flex items-center rounded-md border border-violet-300/40 bg-violet-300/10 px-3 py-1 text-sm text-violet-100">
                Backend Neutral
              </span>
              <span className="inline-flex items-center rounded-md border border-white/20 bg-white/5 px-3 py-1 text-sm text-slate-200">
                Local-First Ready
              </span>
            </div>
          </div>

          <motion.aside
            className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/80">
              Product Highlights
            </p>
            <ul className="mt-4 space-y-3">
              {productHighlights.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-6 text-slate-400">
              React-first in v1, with a design-system-neutral core and prebuilt component kit.
            </p>
          </motion.aside>
        </motion.section>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
          Examples
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          See Wafer in a real product context.
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Both examples run against a local Ollama backend. Set{" "}
          <code className="rounded bg-white/10 px-1 py-0.5 text-xs text-cyan-200">
            VITE_OLLAMA_MODEL
          </code>{" "}
          to your preferred model.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link
            to="/examples/incident-form"
            className="group rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-cyan-300/30 hover:bg-slate-900/60"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/80">
              Example 01
            </p>
            <h4 className="mt-2 text-base font-semibold text-white">Incident Report Form</h4>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Warehouse safety desk with AI autofill. Paste a raw incident description and the agent
              fills every form field in one shot.
            </p>
            <p className="mt-4 text-xs font-medium text-cyan-300 transition group-hover:text-cyan-200">
              Open example →
            </p>
          </Link>
          <Link
            to="/examples/onboarding"
            className="group rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-violet-300/30 hover:bg-slate-900/60"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-100/80">
              Example 02
            </p>
            <h4 className="mt-2 text-base font-semibold text-white">Onboarding Agent</h4>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Employee onboarding form driven by tool-calling. Write naturally and the agent maps
              your words to the right fields via function calls.
            </p>
            <p className="mt-4 text-xs font-medium text-violet-300 transition group-hover:text-violet-200">
              Open example →
            </p>
          </Link>
        </div>
      </section>

      <section
        id="architecture"
        ref={architectureRef}
        className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8"
      >
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-200/80">
            Architecture
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            A layered system built for composability.
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Framer Motion powers this section so each layer appears progressively as you scroll,
            mirroring how Wafer stacks from protocol to UI.
          </p>

          <div className="relative mt-7">
            <div className="pointer-events-none absolute bottom-2 left-3 top-2 hidden w-px bg-slate-700 md:block" />
            <motion.div
              className="pointer-events-none absolute bottom-2 left-3 top-2 hidden origin-top bg-linear-to-b from-cyan-300 via-violet-300 to-cyan-300 md:block"
              style={{ scaleY: architectureLineProgress, width: "1px" }}
            />
            <div className="space-y-4 md:pl-10">{layerCards}</div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/55 px-5 py-4 backdrop-blur">
          <p className="text-sm text-slate-300">
            Build once, plug into any serious backend runtime.
          </p>
          <a
            className="text-sm text-slate-400 transition hover:text-slate-200"
            href={githubRepoUrl}
            target="_blank"
            rel="noreferrer"
          >
            View source on GitHub →
          </a>
        </div>
      </section>
    </main>
  );
}
