import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider
} from "@tanstack/react-router";
import { AgenticFormPage } from "./pages/AgenticFormPage";
import { DocsPage } from "./pages/DocsPage";
import { LandingPage } from "./pages/LandingPage";
import { OnboardingAgentPage } from "./pages/OnboardingAgentPage";

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

const incidentFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/examples/incident-form",
  component: AgenticFormPage
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/examples/onboarding",
  component: OnboardingAgentPage
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  docsRoute,
  incidentFormRoute,
  onboardingRoute
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
