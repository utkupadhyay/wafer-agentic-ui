import type {
  AggregatedRow,
  DataSummary,
  GroupByKey,
  MetricKey,
  Order,
  OrderCategory,
  OrderRegion,
  OrderStatus
} from "./visualizerTypes";

const categories: OrderCategory[] = ["Electronics", "Apparel", "Home", "Books", "Sports"];
const regions: OrderRegion[] = ["North", "South", "East", "West"];
const statuses: OrderStatus[] = ["completed", "refunded", "pending"];

const products: Record<OrderCategory, string[]> = {
  Electronics: ["Wireless Headphones", "Smart Watch", "Laptop Stand", "USB Hub", "Webcam"],
  Apparel: ["Running Shoes", "Denim Jacket", "Yoga Pants", "Wool Sweater", "Polo Shirt"],
  Home: ["Coffee Maker", "Air Purifier", "Desk Lamp", "Throw Pillow", "Storage Basket"],
  Books: ["System Design", "Atomic Habits", "Deep Work", "The Lean Startup", "Clean Code"],
  Sports: ["Foam Roller", "Resistance Bands", "Water Bottle", "Jump Rope", "Pull-up Bar"]
};

const revenueBands: Record<OrderCategory, [number, number]> = {
  Electronics: [49, 349],
  Apparel: [19, 129],
  Home: [14, 89],
  Books: [9, 29],
  Sports: [8, 59]
};

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

function generateOrders(): Order[] {
  const rng = seededRandom(42);
  const orders: Order[] = [];
  const startMs = new Date("2025-11-01").getTime();
  const endMs = new Date("2026-04-30").getTime();
  const range = endMs - startMs;

  for (let i = 0; i < 200; i++) {
    const category = categories[Math.floor(rng() * categories.length)] as OrderCategory;
    const productList = products[category];
    const product = productList[Math.floor(rng() * productList.length)] as string;
    const [lo, hi] = revenueBands[category];
    const revenue = Math.round((lo + rng() * (hi - lo)) * 100) / 100;
    const quantity = Math.floor(rng() * 4) + 1;
    const region = regions[Math.floor(rng() * regions.length)] as OrderRegion;

    const statusRoll = rng();
    const status: OrderStatus =
      statusRoll < 0.72 ? "completed" : statusRoll < 0.88 ? "pending" : "refunded";

    const dateMs = startMs + Math.floor(rng() * range);
    const date = new Date(dateMs).toISOString().substring(0, 10);

    orders.push({
      id: `ORD-${String(i + 1).padStart(4, "0")}`,
      date,
      category,
      product,
      revenue: revenue * quantity,
      quantity,
      region,
      status
    });
  }

  return orders.sort((a, b) => a.date.localeCompare(b.date));
}

export const ORDERS: Order[] = generateOrders();

export function aggregateOrders(groupBy: GroupByKey, metric: MetricKey): AggregatedRow[] {
  const map = new Map<string, { revenue: number; quantity: number; orders: number }>();

  for (const order of ORDERS) {
    let label: string;
    switch (groupBy) {
      case "category":
        label = order.category;
        break;
      case "region":
        label = order.region;
        break;
      case "status":
        label = order.status;
        break;
      case "month":
        label = order.date.slice(0, 7);
        break;
      case "product":
        label = order.product;
        break;
    }

    const existing = map.get(label) ?? { revenue: 0, quantity: 0, orders: 0 };
    map.set(label, {
      revenue: Math.round((existing.revenue + order.revenue) * 100) / 100,
      quantity: existing.quantity + order.quantity,
      orders: existing.orders + 1
    });
  }

  const rows: AggregatedRow[] = Array.from(map.entries()).map(([label, v]) => ({
    label,
    ...v
  }));

  rows.sort((a, b) => b[metric] - a[metric]);

  if (groupBy === "month") {
    rows.sort((a, b) => a.label.localeCompare(b.label));
  }

  return rows;
}

export function getDataSummary(): DataSummary {
  const totalRevenue = Math.round(ORDERS.reduce((s, o) => s + o.revenue, 0) * 100) / 100;
  const productCounts = new Map<string, number>();
  for (const o of ORDERS) {
    productCounts.set(o.product, (productCounts.get(o.product) ?? 0) + 1);
  }
  let topProduct = "";
  let topCount = 0;
  for (const [p, c] of productCounts) {
    if (c > topCount) {
      topCount = c;
      topProduct = p;
    }
  }

  return {
    totalOrders: ORDERS.length,
    totalRevenue,
    avgOrderValue: Math.round((totalRevenue / ORDERS.length) * 100) / 100,
    dateRange: { from: (ORDERS[0] as Order).date, to: (ORDERS[ORDERS.length - 1] as Order).date },
    categories: [...categories],
    regions: [...regions],
    statuses: [...statuses],
    topProduct
  };
}
