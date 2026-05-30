import type { ChartEntry } from "./visualizerTypes";

interface Props {
  history: ChartEntry[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

const typeIcon: Record<string, string> = {
  bar: "▊",
  area: "◌",
  pie: "◐",
  table: "≡"
};

export function ChartHistory({ history, activeId, onSelect }: Props) {
  if (history.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {history.map((entry) => (
        <button
          key={entry.id}
          type="button"
          onClick={() => onSelect(entry.id)}
          className={`flex shrink-0 cursor-pointer flex-col gap-1 rounded-xl border px-3 py-2 text-left transition ${
            entry.id === activeId
              ? "border-cyan-400 bg-cyan-50"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <span className="text-base leading-none text-slate-400">
            {typeIcon[entry.spec.type] ?? "◻"}
          </span>
          <span className="max-w-30 truncate text-xs font-medium text-slate-700">
            {entry.spec.title}
          </span>
          <span className="text-[10px] text-slate-400">{entry.createdAt}</span>
        </button>
      ))}
    </div>
  );
}
