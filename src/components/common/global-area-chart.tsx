"use client";

import React, { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RangeKey = "1d" | "1w" | "1m" | "3m" | "1y";

type ChartsPayload = {
  users?: { labels: string[]; counts: number[] };
  deposits?: { labels: string[]; counts: number[] };
  withdraws?: { labels: string[]; counts: number[] };
  transactions?: { labels: string[]; counts: number[] };
  gameRequests?: { labels: string[]; counts: number[] };
};

type DashboardResponse = {
  filter?: { range?: string };
  charts?: ChartsPayload;
};

type MetricKey =
  | "users"
  | "deposits"
  | "withdraws"
  | "transactions"
  | "gameRequests";

const METRICS: { key: MetricKey; label: string }[] = [
  { key: "users", label: "Users" },
  { key: "deposits", label: "Deposits" },
  { key: "withdraws", label: "Withdraws" },
//   { key: "transactions", label: "Transactions" },
  { key: "gameRequests", label: "Game Requests" },
];

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "1d", label: "1 Day" },
  { key: "1w", label: "1 Week" },
  { key: "1m", label: "1 Month" },
  { key: "3m", label: "3 Months" },
  { key: "1y", label: "1 Year" },
];

function safeLabels(data?: { labels?: string[]; counts?: number[] }) {
  return {
    labels: Array.isArray(data?.labels) ? data!.labels : [],
    counts: Array.isArray(data?.counts) ? data!.counts : [],
  };
}

/**
 * Creates a unified series based on charts labels (your backend already fills missing days).
 * Output: [{ label: '2026-02-01', users: 1, deposits: 0, ... }, ...]
 */
function buildSeries(charts?: ChartsPayload) {
  const u = safeLabels(charts?.users);
  const d = safeLabels(charts?.deposits);
  const w = safeLabels(charts?.withdraws);
//   const t = safeLabels(charts?.transactions);
  const g = safeLabels(charts?.gameRequests);

  // pick the "best" label axis available (all should match due to fullLabels fill)
  const axis =
    u.labels.length
      ? u.labels
      : d.labels.length
      ? d.labels
      : w.labels.length
      ? w.labels
    //   : t.labels.length
    //   ? t.labels
      : g.labels;

  const idxOf = (arr: string[]) => {
    const map = new Map<string, number>();
    for (let i = 0; i < arr.length; i++) map.set(arr[i], i);
    return map;
  };

  const uIdx = idxOf(u.labels);
  const dIdx = idxOf(d.labels);
  const wIdx = idxOf(w.labels);
//   const tIdx = idxOf(t.labels);
  const gIdx = idxOf(g.labels);

  return axis.map((label) => ({
    label,
    users: uIdx.has(label) ? Number(u.counts[uIdx.get(label)!] ?? 0) : 0,
    deposits: dIdx.has(label) ? Number(d.counts[dIdx.get(label)!] ?? 0) : 0,
    withdraws: wIdx.has(label) ? Number(w.counts[wIdx.get(label)!] ?? 0) : 0,
    // transactions: tIdx.has(label) ? Number(t.counts[tIdx.get(label)!] ?? 0) : 0,
    gameRequests: gIdx.has(label) ? Number(g.counts[gIdx.get(label)!] ?? 0) : 0,
  }));
}

type Props = {
  data?: DashboardResponse | null;
  /** controlled range state from parent (recommended) */
  range: string;
  onRangeChange: (next: string) => void;

  className?: string;
  title?: string;
};

export function GlobalAreaChart({
  data,
  range,
  onRangeChange,
  className,
  title = "Overview",
}: Props) {
  const [metricMode, setMetricMode] = useState<"single" | "stacked">("stacked");
  const [activeMetric, setActiveMetric] = useState<MetricKey>("users");

  const series = useMemo(() => buildSeries(data?.charts), [data?.charts]);

  const visibleMetrics = useMemo(() => {
    if (metricMode === "single") return [activeMetric];
    return METRICS.map((m) => m.key);
  }, [metricMode, activeMetric]);

  return (
    <Card className={cn("rounded-2xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="text-xs text-muted-foreground">
            Range: {String(range || data?.filter?.range || "1w")}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Range filter -> drives your useDashboard query */}
          <Select value={range} onValueChange={onRangeChange}>
            <SelectTrigger className="w-[140px] rounded-xl">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => (
                <SelectItem key={r.key} value={r.key}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Mode */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={metricMode === "stacked" ? "default" : "secondary"}
              className="rounded-xl"
              onClick={() => setMetricMode("stacked")}
            >
              Stacked
            </Button>
            <Button
              size="sm"
              variant={metricMode === "single" ? "default" : "secondary"}
              className="rounded-xl"
              onClick={() => setMetricMode("single")}
            >
              Single
            </Button>
          </div>

          {/* Metric selector for single mode */}
          {metricMode === "single" && (
            <Select
              value={activeMetric}
              onValueChange={(v) => setActiveMetric(v as MetricKey)}
            >
              <SelectTrigger className="w-[160px] rounded-xl">
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent>
                {METRICS.map((m) => (
                  <SelectItem key={m.key} value={m.key}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickMargin={8}
                minTickGap={22}
                // if labels are ISO dates, this keeps it readable
                tickFormatter={(v) => String(v).slice(5)}
              />
              <YAxis tickMargin={8} />
              <Tooltip />
              <Legend />

              {/* IMPORTANT: no explicit colors (your instruction). Recharts will auto-pick. */}
              {visibleMetrics.includes("users") && (
                <Area
                  type="monotone"
                  dataKey="users"
                  name="Users"
                  stackId={metricMode === "stacked" ? "1" : undefined}
                  fillOpacity={0.25}
                />
              )}
              {visibleMetrics.includes("deposits") && (
                <Area
                  type="monotone"
                  dataKey="deposits"
                  name="Deposits"
                  stackId={metricMode === "stacked" ? "1" : undefined}
                  fillOpacity={0.25}
                />
              )}
              {visibleMetrics.includes("withdraws") && (
                <Area
                  type="monotone"
                  dataKey="withdraws"
                  name="Withdraws"
                  stackId={metricMode === "stacked" ? "1" : undefined}
                  fillOpacity={0.25}
                />
              )}
              {visibleMetrics.includes("transactions") && (
                <Area
                  type="monotone"
                  dataKey="transactions"
                  name="Transactions"
                  stackId={metricMode === "stacked" ? "1" : undefined}
                  fillOpacity={0.25}
                />
              )}
              {visibleMetrics.includes("gameRequests") && (
                <Area
                  type="monotone"
                  dataKey="gameRequests"
                  name="Game Requests"
                  stackId={metricMode === "stacked" ? "1" : undefined}
                  fillOpacity={0.25}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        

        {series.length === 0 && (
          <div className="mt-3 text-sm text-muted-foreground">
            No chart data for this range.
          </div>
        )}
      </CardContent>
    </Card>
  );
}