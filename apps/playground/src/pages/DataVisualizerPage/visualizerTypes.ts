export type OrderStatus = "completed" | "refunded" | "pending";
export type OrderCategory = "Electronics" | "Apparel" | "Home" | "Books" | "Sports";
export type OrderRegion = "North" | "South" | "East" | "West";

export interface Order {
  id: string;
  date: string;
  category: OrderCategory;
  product: string;
  revenue: number;
  quantity: number;
  region: OrderRegion;
  status: OrderStatus;
}

export type ChartType = "bar" | "area" | "pie" | "table";
export type MetricKey = "revenue" | "quantity" | "orders";
export type GroupByKey = "category" | "region" | "status" | "month" | "product";

export interface ChartSpec {
  type: ChartType;
  title: string;
  metric: MetricKey;
  groupBy: GroupByKey;
}

export interface ChartEntry {
  id: string;
  spec: ChartSpec;
  data: AggregatedRow[];
  createdAt: string;
}

export interface AggregatedRow {
  label: string;
  revenue: number;
  quantity: number;
  orders: number;
}

export interface DataSummary {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  dateRange: { from: string; to: string };
  categories: OrderCategory[];
  regions: OrderRegion[];
  statuses: OrderStatus[];
  topProduct: string;
}
