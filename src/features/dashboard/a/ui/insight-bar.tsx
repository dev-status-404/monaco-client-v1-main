"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Users,
  CreditCard,
  Landmark,
  Repeat,
  Gamepad2,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

/** -------- Types (loose on purpose) -------- */
type SectionKey =
  | "users"
  | "deposits"
  | "withdraws"
  | "transactions"
  | "gameRequests";

type Insights = {
  rangeDays?: number;
  total?: number;
  avgPerDay?: number;
  bestDay?: string | null;
  bestCount?: number;
  lastDay?: string | null;
  todayCount?: number;
  prevCount?: number;
  trend?: "up" | "down" | "flat" | string;
};

type SectionMeta = {
  page?: number;
  limit?: number;
  totalItems?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  insights?: Insights | null;
};

type DashboardLike = {
  pages?: Partial<Record<SectionKey, { items?: any[]; meta?: SectionMeta }>>;
  insights?: Partial<Record<SectionKey, Insights>>;
  charts?: Partial<
    Record<SectionKey, { labels?: string[]; counts?: number[] }>
  >;
  filter?: { range?: string };
};

/** -------- Safe helpers -------- */
const safeNum = (v: any, fallback = 0) =>
  Number.isFinite(Number(v)) ? Number(v) : fallback;
const safeStr = (v: any, fallback = "—") =>
  v === null || v === undefined || v === "" ? fallback : String(v);

const getSectionInsights = (
  data: DashboardLike | undefined,
  key: SectionKey,
): Insights => {
  const fromMeta = data?.pages?.[key]?.meta?.insights;
  const fromTop = data?.insights?.[key];
  return (fromMeta ?? fromTop ?? {}) as Insights;
};

const getSectionMeta = (
  data: DashboardLike | undefined,
  key: SectionKey,
): SectionMeta => {
  return (data?.pages?.[key]?.meta ?? {}) as SectionMeta;
};

const getSectionItemsCount = (
  data: DashboardLike | undefined,
  key: SectionKey,
) => {
  const items = data?.pages?.[key]?.items;
  return Array.isArray(items) ? items.length : 0;
};

/** -------- Trend Pill -------- */
const TrendPill = ({ trend }: { trend?: string }) => {
  const t = String(trend ?? "flat").toLowerCase();
  const Icon = t === "up" ? TrendingUp : t === "down" ? TrendingDown : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        t === "up" && "bg-green-500 text-green-700",
        t === "down" && "bg-red-500 text-red-700",
        "bg-zinc-100 text-zinc-700",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {t === "up" ? "Up" : t === "down" ? "Down" : "Flat"}
    </span>
  );
};

const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-xl  bg-card p-3">
    <div className="text-[11px] text-foreground">{label}</div>
    {/* <div className="mt-1 text-sm font-semibold text-foreground">{value}</div> */}
    <div className="mt-1 text-xl font-semibold text-foreground">{value}</div>
  </div>
);

/** -------- Card UI -------- */
const InsightCard = ({
  title,
  subtitle,
  icon,
  insights,
  meta,
  itemsCount,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  insights: Insights;
  meta: SectionMeta;
  itemsCount: number;
}) => {
  const rangeDays = safeNum(insights.rangeDays, 0);
  const total = safeNum(insights.total, 0);
  const avgPerDay = safeNum(insights.avgPerDay, 0);

  const bestDay = safeStr(insights.bestDay, "—");
  const bestCount = safeNum(insights.bestCount, 0);

  const lastDay = safeStr(insights.lastDay, "—");
  const todayCount = safeNum(insights.todayCount, 0);
  const prevCount = safeNum(insights.prevCount, 0);

  const page = safeNum(meta.page, 1);
  const limit = safeNum(meta.limit, 10);
  const totalItems = safeNum(meta.totalItems, 0);
  const totalPages = safeNum(meta.totalPages, 1);

  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-300 text-zinc-800">
            {icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-500 dark:text-white">
              {title}
            </div>
            <div className="text-xs text-zinc-500 dark:text-white">
              {subtitle ?? `${rangeDays || "—"} days window`}
            </div>
          </div>
        </div>

        <TrendPill trend={String(insights.trend ?? "flat")} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Total (range)" value={total} />
        {/* <Stat label="Avg / day" value={avgPerDay} /> */}
        {/* <Stat label="Best day" value={bestDay} /> */}
        {/* <Stat label="Best count" value={bestCount} /> */}
        {/* <Stat label="Last day" value={lastDay} /> */}
        {/* <Stat label="Today / Prev" value={`${todayCount} / ${prevCount}`} /> */}
      </div>
    </div>
  );
};

/** -------- Exported Grid Component -------- */
export const DashboardInsightsCards = ({ data }: { data?: DashboardLike }) => {
  const cards = useMemo(() => {
    const sections: Array<{
      key: SectionKey;
      title: string;
      icon: React.ReactNode;
    }> = [
      { key: "users", title: "Users", icon: <Users className="h-5 w-5" /> },
      {
        key: "deposits",
        title: "Deposits",
        icon: <CreditCard className="h-5 w-5 " />,
      },
      {
        key: "withdraws",
        title: "Withdraws",
        icon: <Landmark className="h-5 w-5" />,
      },
      {
        key: "transactions",
        title: "Transactions",
        icon: <Repeat className="h-5 w-5" />,
      },
      {
        key: "gameRequests",
        title: "Game Requests",
        icon: <Gamepad2 className="h-5 w-5" />,
      },
    ];

    return sections.map((s) => {
      const insights = getSectionInsights(data, s.key);
      const meta = getSectionMeta(data, s.key);
      const itemsCount = getSectionItemsCount(data, s.key);
      return { ...s, insights, meta, itemsCount };
    });
  }, [data]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((c) => (
        <InsightCard
          key={c.key}
          title={c.title}
          subtitle={
            data?.filter?.range ? `Range: ${data.filter.range}` : undefined
          }
          icon={c.icon}
          insights={c.insights}
          meta={c.meta}
          itemsCount={c.itemsCount}
        />
      ))}
    </div>
  );
};
