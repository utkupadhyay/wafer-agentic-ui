import { Link, Outlet } from "@tanstack/react-router";

const githubRepoUrl = "https://github.com/utkupadhyay/wafer-agentic-ui";

const tabBase = "rounded-md px-3 py-1.5 text-sm font-medium transition";
const tabInactive = `${tabBase} text-slate-400 hover:bg-white/10 hover:text-white`;
const tabActive = `${tabBase} bg-white/10 text-white`;

export function ExamplesShell() {
  return (
    <div>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900">
        <div className="mx-auto flex h-12 max-w-6xl items-center gap-1 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="mr-2 text-sm font-semibold text-white transition hover:text-slate-300"
          >
            Wafer
          </Link>
          <span className="mr-2 select-none text-slate-600">/</span>

          <Link
            to="/examples/incident-form"
            className={tabInactive}
            activeProps={{ className: tabActive }}
          >
            Incident Form
          </Link>
          <Link
            to="/examples/onboarding"
            className={tabInactive}
            activeProps={{ className: tabActive }}
          >
            Onboarding
          </Link>
          <Link
            to="/examples/data-visualizer"
            className={tabInactive}
            activeProps={{ className: tabActive }}
          >
            Data Visualizer
          </Link>
          <Link
            to="/examples/product-filter"
            className={tabInactive}
            activeProps={{ className: tabActive }}
          >
            Product Filter
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <Link to="/docs" className={tabInactive}>
              Docs
            </Link>
            <a href={githubRepoUrl} target="_blank" rel="noreferrer" className={tabInactive}>
              GitHub
            </a>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
