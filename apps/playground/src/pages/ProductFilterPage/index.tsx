import { createGroqTransport } from "@wafer/adapters/groq";
import { createOllamaTransport } from "@wafer/adapters/ollama";
import { AgentProvider, createAgentClient } from "@wafer/react";
import { useRef, useState } from "react";
import { FilterChips } from "./FilterChips";
import {
  allCategories,
  allColors,
  allSizes,
  type Category,
  type FilterState,
  initialFilterState,
  type ProductColor,
  type ProductSize,
  type SortBy
} from "./filterTypes";
import { ProductFilterChat } from "./ProductFilterChat";
import { ProductGrid } from "./ProductGrid";
import { applyFilters, PRODUCTS } from "./productData";

const ollamaBaseUrl = import.meta.env.VITE_OLLAMA_BASE_URL ?? "http://localhost:11434";
const ollamaModel = import.meta.env.VITE_OLLAMA_MODEL ?? "gpt-oss:20b";

const systemPrompt = [
  "You are a product filter assistant for a fashion e-commerce store.",
  `Available categories: ${allCategories.join(", ")}.`,
  `Available colors: ${allColors.join(", ")}.`,
  "Available sizes (apparel only — Dress, Top, Pants): XS, S, M, L, XL.",
  "Price range: $12–$285. Rating scale: 1.0–5.0.",
  "When the user asks to filter or find products, ALWAYS call set_filters first, then reply with one sentence.",
  "For additive requests ('also show blue', 'add size L'), call get_filter_state first to read current filters, then merge and call set_filters.",
  "sortBy values: relevance, price_asc, price_desc, rating, newest.",
  "Use clear_filters to reset everything.",
  "Keep replies to one sentence."
].join(" ");

const validSortBy: SortBy[] = ["relevance", "price_asc", "price_desc", "rating", "newest"];

export function ProductFilterPage() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const filtersRef = useRef<FilterState>(initialFilterState);

  const updateFilters = (patch: Partial<FilterState>) => {
    const next = { ...filtersRef.current, ...patch };
    filtersRef.current = next;
    setFilters(next);
  };

  const clearFilters = () => {
    filtersRef.current = initialFilterState;
    setFilters(initialFilterState);
  };

  const removeChip = (key: keyof FilterState, value?: unknown) => {
    const cur = filtersRef.current;
    switch (key) {
      case "category":
        updateFilters({ category: cur.category.filter((c) => c !== value) });
        break;
      case "color":
        updateFilters({ color: cur.color.filter((c) => c !== value) });
        break;
      case "size":
        updateFilters({ size: cur.size.filter((s) => s !== value) });
        break;
      case "minPrice":
        updateFilters({ minPrice: null });
        break;
      case "maxPrice":
        updateFilters({ maxPrice: null });
        break;
      case "minRating":
        updateFilters({ minRating: null });
        break;
      case "inStockOnly":
        updateFilters({ inStockOnly: false });
        break;
      case "sortBy":
        updateFilters({ sortBy: "relevance" });
        break;
    }
  };

  const filteredProducts = applyFilters(PRODUCTS, filters);

  const clientRef = useRef<ReturnType<typeof createAgentClient> | null>(null);
  if (clientRef.current === null) {
    const toStringArray = <T extends string>(v: unknown, valid: readonly T[]): T[] => {
      const arr = Array.isArray(v) ? v : typeof v === "string" ? [v] : [];
      return arr.filter((x): x is T => valid.includes(x as T));
    };

    const agentTools = [
      {
        function: {
          name: "get_filter_state",
          description:
            "Read the current active filters and how many products match. Call this before additive updates.",
          parameters: { type: "object", properties: {} }
        },
        execute: () => ({
          currentFilters: filtersRef.current,
          matchingProducts: applyFilters(PRODUCTS, filtersRef.current).length
        })
      },
      {
        function: {
          name: "set_filters",
          description:
            "Apply filters to the product grid. Only pass dimensions you want to change — others stay unchanged.",
          parameters: {
            type: "object",
            properties: {
              category: { type: "array", items: { type: "string", enum: allCategories } },
              color: { type: "array", items: { type: "string", enum: allColors } },
              size: { type: "array", items: { type: "string", enum: allSizes } },
              minPrice: { type: "number" },
              maxPrice: { type: "number" },
              minRating: { type: "number" },
              inStockOnly: { type: "boolean" },
              sortBy: { type: "string", enum: validSortBy }
            }
          }
        },
        execute: (args: Record<string, unknown>) => {
          const patch: Partial<FilterState> = {};

          if ("category" in args)
            patch.category = toStringArray<Category>(args.category, allCategories);
          if ("color" in args) patch.color = toStringArray<ProductColor>(args.color, allColors);
          if ("size" in args) patch.size = toStringArray<ProductSize>(args.size, allSizes);
          if ("minPrice" in args && typeof args.minPrice === "number" && args.minPrice > 0)
            patch.minPrice = args.minPrice;
          if ("maxPrice" in args && typeof args.maxPrice === "number" && args.maxPrice > 0)
            patch.maxPrice = args.maxPrice;
          if ("minRating" in args && typeof args.minRating === "number" && args.minRating > 0)
            patch.minRating = args.minRating;
          if ("inStockOnly" in args && typeof args.inStockOnly === "boolean")
            patch.inStockOnly = args.inStockOnly;
          if ("sortBy" in args && validSortBy.includes(args.sortBy as SortBy))
            patch.sortBy = args.sortBy as SortBy;

          updateFilters(patch);
          const count = applyFilters(PRODUCTS, filtersRef.current).length;
          return { ok: true, appliedFilters: Object.keys(patch), matchingProducts: count };
        }
      },
      {
        function: {
          name: "clear_filters",
          description: "Reset all active filters and show the full catalog.",
          parameters: { type: "object", properties: {} }
        },
        execute: () => {
          clearFilters();
          return { ok: true, totalProducts: PRODUCTS.length };
        }
      }
    ];

    clientRef.current = createAgentClient({
      transport: import.meta.env.PROD
        ? createGroqTransport({ systemPrompt, maxToolRounds: 6, tools: agentTools })
        : createOllamaTransport({
            baseUrl: ollamaBaseUrl,
            model: ollamaModel,
            systemPrompt,
            maxToolRounds: 6,
            requestOptions: { temperature: 0 },
            tools: agentTools
          })
    });
  }

  return (
    <AgentProvider client={clientRef.current}>
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-700">
              Wafer Commerce
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
              Product Filter
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
              {PRODUCTS.length} products · Describe what you want and the agent filters the grid via
              tool calls.
            </p>
          </header>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <FilterChips
                filters={filters}
                resultCount={filteredProducts.length}
                onRemove={removeChip}
                onClear={clearFilters}
              />
            </div>
            <ProductGrid products={filteredProducts} />
          </div>
        </section>
      </main>

      <ProductFilterChat
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((v) => !v)}
        ollamaModel={ollamaModel}
      />
    </AgentProvider>
  );
}
