import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider
} from "@tanstack/react-router";
import { ExamplesShell } from "./layouts/ExamplesShell";
import { AgenticFormPage } from "./pages/AgenticFormPage";
import { DataVisualizerPage } from "./pages/DataVisualizerPage";
import { DocsPage } from "./pages/DocsPage";
import { ExamplesPage } from "./pages/ExamplesPage";
import { LandingPage } from "./pages/LandingPage";
import { OnboardingAgentPage } from "./pages/OnboardingAgentPage";
import { ProductFilterPage } from "./pages/ProductFilterPage";

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

const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs",
  component: DocsPage
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

export function App() {
  return <RouterProvider router={router} />;
}
