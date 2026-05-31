import { Link, type LinkProps } from "@tanstack/react-router";
import { Fragment } from "react";
import { useTheme } from "../contexts/ThemeContext";

const githubRepoUrl = "https://github.com/utkupadhyay/wafer-agentic-ui";

const linkCls =
  "rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white";

interface Crumb {
  label: string;
  to?: LinkProps["to"];
}

interface NavBarProps {
  breadcrumbs?: Crumb[];
}

export function NavBar({ breadcrumbs }: NavBarProps) {
  const { isDark, toggle } = useTheme();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-slate-950/90">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="shrink-0 text-sm font-semibold text-slate-900 transition hover:text-slate-600 dark:text-white dark:hover:text-slate-300"
        >
          Wafer
        </Link>

        {breadcrumbs?.map((crumb) => (
          <Fragment key={crumb.label}>
            <span className="select-none text-slate-300 dark:text-slate-600">/</span>
            {crumb.to ? (
              <Link
                to={crumb.to}
                className="text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-sm text-slate-700 dark:text-slate-300">{crumb.label}</span>
            )}
          </Fragment>
        ))}

        <div className="ml-auto flex items-center gap-1">
          <Link to="/examples" className={linkCls}>
            Examples
          </Link>
          <Link to="/docs" className={linkCls}>
            Docs
          </Link>
          <a href={githubRepoUrl} target="_blank" rel="noreferrer" className={linkCls}>
            GitHub
          </a>
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10"
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
        </div>
      </div>
    </nav>
  );
}
