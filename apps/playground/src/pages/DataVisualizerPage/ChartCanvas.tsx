import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { AggregatedRow, ChartSpec, MetricKey } from "./visualizerTypes";

const PALETTE = [
  "#0891b2",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#db2777",
  "#4f46e5",
  "#16a34a",
  "#b45309"
];

interface Props {
  spec: ChartSpec;
  data: AggregatedRow[];
}

function formatValue(value: number, metric: MetricKey) {
  if (metric === "revenue") return `$${value.toLocaleString()}`;
  return value.toLocaleString();
}

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  color: "#0f172a",
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
};

export function ChartCanvas({ spec, data }: Props) {
  const { type, metric } = spec;

  if (type === "table") {
    return (
      <div className="overflow-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-2.5 text-left font-medium text-slate-600">{spec.groupBy}</th>
              <th className="px-4 py-2.5 text-right font-medium text-slate-600">Revenue</th>
              <th className="px-4 py-2.5 text-right font-medium text-slate-600">Quantity</th>
              <th className="px-4 py-2.5 text-right font-medium text-slate-600">Orders</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.label}
                className={`border-b border-slate-100 ${i % 2 === 0 ? "" : "bg-slate-50"}`}
              >
                <td className="px-4 py-2 text-slate-800">{row.label}</td>
                <td className="px-4 py-2 text-right text-slate-700">
                  ${row.revenue.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right text-slate-700">
                  {row.quantity.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right text-slate-700">{row.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            dataKey={metric}
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((row, i) => (
              <Cell key={row.label} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatValue(v, metric)} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#475569" }}
            formatter={(value) => <span style={{ color: "#475569" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === "area") {
    return (
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0891b2" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (metric === "revenue" ? `$${(v / 1000).toFixed(0)}k` : String(v))}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatValue(v, metric)} />
          <Area
            type="monotone"
            dataKey={metric}
            stroke="#0891b2"
            strokeWidth={2}
            fill="url(#areaGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => (metric === "revenue" ? `$${(v / 1000).toFixed(0)}k` : String(v))}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatValue(v, metric)} />
        <Bar dataKey={metric} radius={[4, 4, 0, 0]}>
          {data.map((row, i) => (
            <Cell key={row.label} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
