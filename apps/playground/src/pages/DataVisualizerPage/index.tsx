import { createOllamaTransport } from "@wafer/adapters/ollama";
import { AgentProvider, createAgentClient } from "@wafer/react";
import { useRef, useState } from "react";
import { ChartCanvas } from "./ChartCanvas";
import { ChartHistory } from "./ChartHistory";
import { aggregateOrders, getDataSummary } from "./ecomData";
import { VisualizerSidebar } from "./VisualizerSidebar";
import type { ChartEntry, ChartSpec, GroupByKey, MetricKey } from "./visualizerTypes";

const ollamaBaseUrl = import.meta.env.VITE_OLLAMA_BASE_URL ?? "http://localhost:11434";
const ollamaModel = import.meta.env.VITE_OLLAMA_MODEL ?? "gpt-oss:20b";

const systemPrompt = [
  "You are an analytics copilot for an e-commerce dashboard.",
  "You have access to 200 orders spanning Nov 2025 – Apr 2026.",
  "Order fields: category (Electronics/Apparel/Home/Books/Sports), region (North/South/East/West), status (completed/refunded/pending), product, revenue, quantity, date.",
  "When the user asks a data question, ALWAYS call render_chart first, then reply with a one-sentence insight.",
  "Choose the best chart type: bar for comparisons, area for trends over time, pie for proportions, table for detailed breakdowns.",
  "For 'top N' questions, call render_chart with groupBy matching the dimension. For time trends, use groupBy: 'month' and type: 'area'.",
  "Never ask clarifying questions if you can make a reasonable inference.",
  "Keep replies short — one sentence max after the tool call."
].join(" ");

function nowShortTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function DataVisualizerPage() {
  const [chartHistory, setChartHistory] = useState<ChartEntry[]>([]);
  const [activeChartId, setActiveChartId] = useState<string | null>(null);

  const addChart = (spec: ChartSpec) => {
    const data = aggregateOrders(spec.groupBy as GroupByKey, spec.metric as MetricKey);
    const entry: ChartEntry = {
      id: crypto.randomUUID(),
      spec,
      data,
      createdAt: nowShortTime()
    };
    setChartHistory((prev) => [...prev, entry]);
    setActiveChartId(entry.id);
    return entry;
  };

  const clientRef = useRef<ReturnType<typeof createAgentClient> | null>(null);
  if (clientRef.current === null) {
    clientRef.current = createAgentClient({
      transport: createOllamaTransport({
        baseUrl: ollamaBaseUrl,
        model: ollamaModel,
        systemPrompt,
        maxToolRounds: 6,
        requestOptions: { temperature: 0 },
        tools: [
          {
            function: {
              name: "get_data_summary",
              description:
                "Return a summary of the dataset: total orders, revenue, date range, available categories, regions, statuses, and top product.",
              parameters: { type: "object", properties: {} }
            },
            execute: () => getDataSummary()
          },
          {
            function: {
              name: "render_chart",
              description:
                "Render a chart on the dashboard based on a spec. Call this whenever the user asks a data question.",
              parameters: {
                type: "object",
                required: ["type", "title", "metric", "groupBy"],
                properties: {
                  type: {
                    type: "string",
                    enum: ["bar", "area", "pie", "table"],
                    description: "Chart type"
                  },
                  title: { type: "string", description: "Short human-readable chart title" },
                  metric: {
                    type: "string",
                    enum: ["revenue", "quantity", "orders"],
                    description: "The numeric value to plot"
                  },
                  groupBy: {
                    type: "string",
                    enum: ["category", "region", "status", "month", "product"],
                    description: "Dimension to group/aggregate by"
                  }
                }
              }
            },
            execute: (args) => {
              const spec = args as unknown as ChartSpec;
              const entry = addChart(spec);
              return { ok: true, chartId: entry.id, rowCount: entry.data.length };
            }
          }
        ]
      })
    });
  }

  const activeChart = chartHistory.find((c) => c.id === activeChartId) ?? null;

  return (
    <AgentProvider client={clientRef.current}>
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Wafer Analytics
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
              E-Commerce Data Visualizer
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
              200 mock orders · Nov 2025 – Apr 2026 · Ask questions in plain English and the agent
              renders charts by calling tools.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="flex flex-col gap-4">
              <div className="min-h-[420px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {activeChart ? (
                  <>
                    <p className="mb-4 text-base font-semibold text-slate-900">
                      {activeChart.spec.title}
                    </p>
                    <ChartCanvas spec={activeChart.spec} data={activeChart.data} />
                  </>
                ) : (
                  <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3 text-center">
                    <p className="text-3xl text-slate-300">◻</p>
                    <p className="text-sm text-slate-500">
                      No chart yet. Ask a question in the sidebar.
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-400">
                      {[
                        "Show revenue by category",
                        "Monthly orders trend",
                        "Which region had the most refunds?"
                      ].map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {chartHistory.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Chart History
                  </p>
                  <ChartHistory
                    history={chartHistory}
                    activeId={activeChartId}
                    onSelect={setActiveChartId}
                  />
                </div>
              )}
            </div>

            <div className="h-[600px] lg:h-auto lg:min-h-[600px]">
              <VisualizerSidebar ollamaModel={ollamaModel} />
            </div>
          </div>
        </section>
      </main>
    </AgentProvider>
  );
}
