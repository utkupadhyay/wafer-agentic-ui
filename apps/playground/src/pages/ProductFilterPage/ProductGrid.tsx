import type { Product, ProductColor } from "./filterTypes";

interface Props {
  products: Product[];
}

const colorSwatch: Record<ProductColor, string> = {
  Red: "bg-red-400",
  Blue: "bg-blue-400",
  Black: "bg-slate-800",
  White: "bg-white border border-slate-300",
  Green: "bg-emerald-500",
  Navy: "bg-blue-900",
  Pink: "bg-pink-400",
  Yellow: "bg-yellow-400",
  Beige: "bg-amber-100 border border-amber-300"
};

const colorBg: Record<ProductColor, string> = {
  Red: "bg-red-50 dark:bg-red-950/30",
  Blue: "bg-blue-50 dark:bg-blue-950/30",
  Black: "bg-slate-100 dark:bg-slate-800",
  White: "bg-slate-50 dark:bg-slate-700",
  Green: "bg-emerald-50 dark:bg-emerald-950/30",
  Navy: "bg-blue-100 dark:bg-blue-950/40",
  Pink: "bg-pink-50 dark:bg-pink-950/30",
  Yellow: "bg-yellow-50 dark:bg-yellow-950/30",
  Beige: "bg-amber-50 dark:bg-amber-950/30"
};

export function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          No products match your filters
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Try removing some filters or ask the assistant
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <article
          key={product.id}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900"
        >
          <div className={`flex h-36 items-center justify-center ${colorBg[product.color]}`}>
            <div className={`h-14 w-14 rounded-full shadow-md ${colorSwatch[product.color]}`} />
          </div>

          <div className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold leading-snug text-slate-800 dark:text-slate-200">
                {product.name}
              </p>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  product.inStock
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                }`}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-500 dark:border-white/10 dark:text-slate-400">
                {product.category}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${colorSwatch[product.color]}`}
                />
                {product.color}
              </span>
            </div>

            {product.sizes.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.sizes.map((s) => (
                  <span
                    key={s}
                    className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500 dark:border-white/10 dark:text-slate-400"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-0.5">
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                ${product.price}
              </p>
              <span className="text-xs text-amber-500">★ {product.rating.toFixed(1)}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
