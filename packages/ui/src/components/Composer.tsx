import type { FormEvent } from "react";
import { useComposer } from "@wafer/react";
import { sectionTitleClass } from "./theme";

interface ComposerProps {
  label?: string;
  placeholder?: string;
  onPromptSubmitted?: (prompt: string) => void | Promise<void>;
  isPrefilling?: boolean;
}

export function Composer({
  label = "Prompt",
  placeholder = "Ask your local Ollama model anything...",
  onPromptSubmitted,
  isPrefilling = false
}: ComposerProps) {
  const { input, setInput, submit, isRunning } = useComposer();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt) {
      return;
    }

    if (onPromptSubmitted) {
      try {
        await onPromptSubmitted(prompt);
      } catch (error) {
        console.error("Failed to prefill incident form from prompt", error);
      }
    }
    await submit(prompt);
  };

  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      <label className={sectionTitleClass} htmlFor="wafer-composer-input">
        {label}
      </label>
      <textarea
        id="wafer-composer-input"
        className="min-h-[88px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder={placeholder}
        rows={3}
      />
      <button
        className="inline-flex w-fit items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isRunning || isPrefilling}
      >
        {isRunning ? "Thinking..." : isPrefilling ? "Prefilling..." : "Send"}
      </button>
    </form>
  );
}
