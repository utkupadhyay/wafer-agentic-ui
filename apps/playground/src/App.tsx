import {
  createRootRoute,
  createRoute,
  createRouter,
  HeadContent,
  Link,
  Outlet,
  RouterProvider
} from "@tanstack/react-router";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { ExamplesShell } from "./layouts/ExamplesShell";
import { AgenticFormPage } from "./pages/AgenticFormPage";
import { ArchitecturePage } from "./pages/ArchitecturePage";
import { DataVisualizerPage } from "./pages/DataVisualizerPage";
import { DocsPage } from "./pages/DocsPage";
import { ExamplesPage } from "./pages/ExamplesPage";
import { GettingStartedPage } from "./pages/GettingStartedPage";
import { LandingPage } from "./pages/LandingPage";
import { OnboardingAgentPage } from "./pages/OnboardingAgentPage";
import { ProductFilterPage } from "./pages/ProductFilterPage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <Outlet />
    </>
  ),
  notFoundComponent: () => (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-slate-900">
        <p className="text-sm text-slate-600 dark:text-slate-300">Route not found.</p>
        <Link
          to="/"
          className="mt-3 inline-flex rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white dark:bg-cyan-400 dark:text-slate-950"
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
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Wafer – Agentic UI Library for React" },
      {
        name: "description",
        content:
          "Wafer is a lightweight, open-source agentic UI library for React. Build AI agent chat interfaces with streaming, tool calls, and approval flows. Works with Ollama, Groq, LangGraph, Mastra, and any custom backend."
      }
    ]
  })
});

const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs",
  component: DocsPage,
  head: () => ({
    meta: [
      { title: "Docs – Wafer Agentic UI" },
      {
        name: "description",
        content:
          "Documentation for Wafer — the agentic UI library for React. Explore the getting started guide, architecture overview, and integration examples."
      }
    ]
  })
});

const gettingStartedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs/getting-started",
  component: GettingStartedPage,
  head: () => ({
    meta: [
      { title: "Getting Started – Wafer Agentic UI" },
      {
        name: "description",
        content:
          "Get started with Wafer in minutes. Install the package, connect Ollama, Groq, Claude, or OpenAI, and add a streaming AI agent chat UI to your React app."
      }
    ]
  })
});

const architectureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs/architecture",
  component: ArchitecturePage,
  head: () => ({
    meta: [
      { title: "Architecture – Wafer Agentic UI" },
      {
        name: "description",
        content:
          "Learn how Wafer works end-to-end: protocol contracts, event sourcing, the AgentTransport interface, React hooks, and pre-built UI components."
      }
    ]
  })
});

const examplesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/examples",
  component: ExamplesShell,
  head: () => ({
    meta: [
      { title: "Live Examples – Wafer Agentic UI" },
      {
        name: "description",
        content:
          "Explore live demos of Wafer's agentic UI components: incident response forms, onboarding agents, data visualizers, and product filter assistants."
      }
    ]
  })
});

const examplesIndexRoute = createRoute({
  getParentRoute: () => examplesRoute,
  path: "/",
  component: ExamplesPage
});

const incidentFormRoute = createRoute({
  getParentRoute: () => examplesRoute,
  path: "incident-form",
  component: AgenticFormPage,
  head: () => ({
    meta: [
      { title: "Incident Form Agent – Wafer Examples" },
      {
        name: "description",
        content:
          "Live demo: an AI agent that fills out an incident response form using Wafer's agentic UI components and Groq."
      }
    ]
  })
});

const onboardingRoute = createRoute({
  getParentRoute: () => examplesRoute,
  path: "onboarding",
  component: OnboardingAgentPage,
  head: () => ({
    meta: [
      { title: "Onboarding Agent – Wafer Examples" },
      {
        name: "description",
        content:
          "Live demo: an AI-powered onboarding flow built with Wafer's React agent components."
      }
    ]
  })
});

const dataVisualizerRoute = createRoute({
  getParentRoute: () => examplesRoute,
  path: "data-visualizer",
  component: DataVisualizerPage,
  head: () => ({
    meta: [
      { title: "Data Visualizer Agent – Wafer Examples" },
      {
        name: "description",
        content:
          "Live demo: an AI agent that generates and explains data visualizations using Wafer's agentic UI library."
      }
    ]
  })
});

const productFilterRoute = createRoute({
  getParentRoute: () => examplesRoute,
  path: "product-filter",
  component: ProductFilterPage,
  head: () => ({
    meta: [
      { title: "Product Filter Agent – Wafer Examples" },
      {
        name: "description",
        content:
          "Live demo: an AI agent that filters and recommends products through a conversational interface built with Wafer."
      }
    ]
  })
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  docsRoute,
  gettingStartedRoute,
  architectureRoute,
  examplesRoute.addChildren([
    examplesIndexRoute,
    incidentFormRoute,
    onboardingRoute,
    dataVisualizerRoute,
    productFilterRoute
  ])
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

function FloatingThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="fixed bottom-5 left-5 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
    >
      {isDark ? (
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <FloatingThemeToggle />
    </ThemeProvider>
  );
}
