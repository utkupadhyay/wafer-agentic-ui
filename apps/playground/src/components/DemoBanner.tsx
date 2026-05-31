import { Link } from "@tanstack/react-router";

export function DemoBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-400/30 dark:bg-amber-950/60">
      <p className="text-xs leading-5 text-amber-900 dark:text-amber-100">
        <span className="mr-2 inline-flex items-center gap-1.5 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
          Note
        </span>
        This deployment uses a shared Groq API token pool, which may result in rate limit errors
        during peak times. For an uninterrupted, faster experience, we recommend cloning the
        repository and running it locally with your own API key.{" "}
        <Link
          to="/docs/getting-started"
          className="font-semibold underline underline-offset-2 transition hover:text-amber-700 dark:hover:text-white"
        >
          Getting started guide →
        </Link>
      </p>
    </div>
  );
}
