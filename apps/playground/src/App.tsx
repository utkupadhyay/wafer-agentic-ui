import {
  createRootRoute,
  createRoute,
  createRouter,
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
  component: () => <Outlet />,
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
  component: LandingPage
});

const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs",
  component: DocsPage
});

const gettingStartedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs/getting-started",
  component: GettingStartedPage
});

const architectureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs/architecture",
  component: ArchitecturePage
});

const examplesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/examples",
  component: ExamplesShell
});

const examplesIndexRoute = createRoute({
  getParentRoute: () => examplesRoute,
  path: "/",
  component: ExamplesPage
});

const incidentFormRoute = createRoute({
  getParentRoute: () => examplesRoute,
  path: "incident-form",
  component: AgenticFormPage
});

const onboardingRoute = createRoute({
  getParentRoute: () => examplesRoute,
  path: "onboarding",
  component: OnboardingAgentPage
});

const dataVisualizerRoute = createRoute({
  getParentRoute: () => examplesRoute,
  path: "data-visualizer",
  component: DataVisualizerPage
});

const productFilterRoute = createRoute({
  getParentRoute: () => examplesRoute,
  path: "product-filter",
  component: ProductFilterPage
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
