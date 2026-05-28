import { useMemo, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useParams
} from "@tanstack/react-router";
import { AgenticFormPage } from "./pages/AgenticFormPage";

interface ExampleDefinition {
  slug: string;
  title: string;
  description: string;
  isAvailable: boolean;
}

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

const examples: ExampleDefinition[] = [
  {
    slug: "agentic-form",
    title: "Agentic Form",
    description:
      "Warehouse incident reporting form with LLM-assisted field extraction and chat copilot.",
    isAvailable: true
  },
  {
    slug: "tool-streaming",
    title: "Tool Streaming",
    description: "Live tool-call timeline with status transitions and structured tool output cards.",
    isAvailable: false
  },
  {
    slug: "approval-flow",
    title: "Approval Flow",
    description: "Human-in-the-loop action gating with approve, reject, and reason capture.",
    isAvailable: false
  }
];

function LandingPage() {
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
        className="fixed left-0 right-0 top-0 z-50 h-[2px] origin-left bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400"
        style={{ scaleX: pageProgress }}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 left-[-14rem] h-[28rem] w-[28rem] rounded-full bg-cyan-500/20 blur-3xl"
          animate={{ x: [0, 28, 0], y: [0, 14, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 13, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-10rem] right-[-12rem] h-[25rem] w-[25rem] rounded-full bg-violet-500/20 blur-3xl"
          animate={{ x: [0, -24, 0], y: [0, -16, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 14, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(45,212,191,0.16),transparent_34%),radial-gradient(circle_at_80%_100%,rgba(139,92,246,0.18),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:34px_34px]" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-white/10 bg-slate-950/55 px-5 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur">
          <nav className="flex flex-wrap items-center justify-end gap-2">
            <Link
              to="/examples"
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
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
              Examples
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Ready-to-run agentic UI demos
            </h3>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {examples.map((example) => (
              <article
                key={example.slug}
                className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
              >
                <p className="text-sm font-semibold text-white">{example.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{example.description}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.14em] text-slate-400">
                  /examples/{example.slug}
                </p>
              </article>
            ))}
          </div>
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
              className="pointer-events-none absolute bottom-2 left-3 top-2 hidden origin-top bg-gradient-to-b from-cyan-300 via-violet-300 to-cyan-300 md:block"
              style={{ scaleY: architectureLineProgress, width: "1px" }}
            />
            <div className="space-y-4 md:pl-10">{layerCards}</div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/55 px-5 py-4 backdrop-blur">
          <p className="text-sm text-slate-300">
            Build once, plug into any serious backend runtime.
          </p>
          <p className="text-sm text-slate-400">Use top navigation to browse examples.</p>
        </div>
      </section>
    </main>
  );
}

function DocsPage() {
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
            <h2 className="text-base font-semibold text-white">Examples</h2>
            <p className="mt-2 text-sm text-slate-300">
              Explore all available demos under the <code>/examples</code> route space.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-base font-semibold text-white">GitHub</h2>
            <p className="mt-2 text-sm text-slate-300">
              Source code, issues, releases, and contribution workflow.
            </p>
          </article>
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

function ExamplesPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                Wafer Examples
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Example Routes
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Add new demos under <code>/examples</code> as this library grows.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center rounded-md border border-white/15 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Back to Landing
            </Link>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {examples.map((example) => (
            <article key={example.slug} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-base font-semibold text-white">{example.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{example.description}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">
                Route: <code>/examples/{example.slug}</code>
              </p>

              {example.isAvailable ? (
                <Link
                  to="/examples/agentic-form"
                  className="mt-4 inline-flex items-center rounded-md bg-cyan-400 px-3 py-1.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
                >
                  Open
                </Link>
              ) : (
                <Link
                  to="/examples/$exampleSlug"
                  params={{ exampleSlug: example.slug }}
                  className="mt-4 inline-flex items-center rounded-md border border-white/15 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10"
                >
                  View Placeholder
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function ExampleComingSoonPage() {
  const params = useParams({ strict: false });
  const exampleSlug =
    typeof params.exampleSlug === "string" ? params.exampleSlug : "unknown-example";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-3xl space-y-5">
        <header className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
            Example Route
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            /examples/{exampleSlug}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            This route is reserved but the example is not implemented yet.
          </p>
        </header>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/examples"
            className="inline-flex items-center rounded-md border border-white/15 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Back to Examples
          </Link>
          <Link
            to="/examples/agentic-form"
            className="inline-flex items-center rounded-md bg-cyan-400 px-3 py-1.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
          >
            Open Agentic Form
          </Link>
        </div>
      </section>
    </main>
  );
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-sm text-slate-300">Route not found.</p>
        <Link
          to="/"
          className="mt-3 inline-flex rounded-md bg-cyan-400 px-3 py-1.5 text-sm font-medium text-slate-950"
        >
          Go to landing page
        </Link>
      </div>
    </main>
  )
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage
});

const examplesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/examples",
  component: ExamplesPage
});

const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs",
  component: DocsPage
});

const agenticFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/examples/agentic-form",
  component: AgenticFormPage
});

const examplePlaceholderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/examples/$exampleSlug",
  component: ExampleComingSoonPage
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  docsRoute,
  examplesRoute,
  agenticFormRoute,
  examplePlaceholderRoute
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent"
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return <RouterProvider router={router} />;
}
