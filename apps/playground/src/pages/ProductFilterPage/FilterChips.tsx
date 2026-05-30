import type { FilterState } from "./filterTypes";

interface Props {
  filters: FilterState;
  resultCount: number;
  onRemove: (key: keyof FilterState, value?: unknown) => void;
  onClear: () => void;
}

export function FilterChips({ filters, resultCount, onRemove, onClear }: Props) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  for (const cat of filters.category) {
    chips.push({ key: `cat-${cat}`, label: cat, onRemove: () => onRemove("category", cat) });
  }
  for (const col of filters.color) {
    chips.push({ key: `col-${col}`, label: col, onRemove: () => onRemove("color", col) });
  }
  for (const sz of filters.size) {
    chips.push({
      key: `sz-${sz}`,
      label: `Size ${sz}`,
      onRemove: () => onRemove("size", sz)
    });
  }
  if (filters.minPrice !== null) {
    chips.push({
      key: "minPrice",
      label: `From $${filters.minPrice}`,
      onRemove: () => onRemove("minPrice")
    });
  }
  if (filters.maxPrice !== null) {
    chips.push({
      key: "maxPrice",
      label: `Under $${filters.maxPrice}`,
      onRemove: () => onRemove("maxPrice")
    });
  }
  if (filters.minRating !== null) {
    chips.push({
      key: "minRating",
      label: `★ ${filters.minRating}+`,
      onRemove: () => onRemove("minRating")
    });
  }
  if (filters.inStockOnly) {
    chips.push({
      key: "inStock",
      label: "In Stock",
      onRemove: () => onRemove("inStockOnly")
    });
  }
  if (filters.sortBy !== "relevance") {
    const sortLabels: Record<string, string> = {
      price_asc: "Price ↑",
      price_desc: "Price ↓",
      rating: "Top Rated",
      newest: "Newest"
    };
    chips.push({
      key: "sort",
      label: sortLabels[filters.sortBy] ?? filters.sortBy,
      onRemove: () => onRemove("sortBy")
    });
  }

  if (chips.length === 0) {
    return <p className="text-sm text-slate-500">{resultCount} products · No filters active</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-500">{resultCount} results</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="ml-0.5 text-violet-400 transition hover:text-violet-700"
            aria-label={`Remove ${chip.label} filter`}
          >
            ×
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="text-xs text-slate-400 underline transition hover:text-slate-700"
      >
        Clear all
      </button>
    </div>
  );
}
