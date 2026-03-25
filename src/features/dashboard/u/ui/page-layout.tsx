"use client";

import { useMemo, useState } from "react";
import Insights from "./insights";
import SectionTitle from "@/components/common/section-title";
import { GlobalDataTable } from "@/components/common/global-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { useDashboard } from "@/hooks/dashboard";
import { useUserInfo } from "@/helpers/use-user";
import { useGames } from "@/hooks/games";

import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Filter,
  RefreshCw,
  Wallet,
  AlertTriangle,
  Hourglass,
  Hash,
} from "lucide-react";

type TxRow = {
  id: string;
  amount: string;
  status: string;
  createdAt: string;
  game_name?: string;
  direction?: string;
  reference_type?: string;
};

type DateFilter = "all" | "today" | "last7" | "last30";
type StatusFilter =
  | "all"
  | "pending"
  | "processing"
  | "completed"
  | "confirmed"
  | "approved"
  | "paid"
  | "failed"
  | "rejected";

export default function Dashboard() {
  const { id } = useUserInfo();

  const [filters, setFilters] = useState<{
    date: DateFilter;
    status: StatusFilter;
    search: string;
    game_id?: string;
  }>({
    date: "all",
    status: "all",
    search: "",
    game_id: "",
  });

  const [applied, setApplied] = useState(filters);

  const apply = () => setApplied(filters);

  const reset = () => {
    const cleared = {
      date: "all",
      status: "all",
      search: "",
      game_id: "",
    };
    setFilters(cleared as any);
    setApplied(cleared as any);
  };

  // ✅ Correct active filter count
  const activeFiltersCount =
    (applied.date !== "all" ? 1 : 0) +
    (applied.status !== "all" ? 1 : 0) +
    (applied.search.trim() ? 1 : 0) +
    (applied.game_id ? 1 : 0);

  const hasDraftChanges = JSON.stringify(filters) !== JSON.stringify(applied);

  // ✅ Fetch games
  const { data: gamesData } = useGames({ limit: 200 });

  const games = useMemo(() => {
    const rows = gamesData?.data ?? gamesData?.rows ?? gamesData?.games ?? [];
    if (!Array.isArray(rows)) return [];
    return rows.map((g: any) => ({
      id: g.id ?? g._id,
      name: g.name ?? g.title ?? "-",
    }));
  }, [gamesData]);

  // ✅ Server params
  const serverParams = useMemo(() => {
    return {
      page: 1,
      limit: 10,
      user_id: id ?? "",
      ...(applied.game_id ? { game_id: applied.game_id } : {}),
    };
  }, [id, applied.game_id]);

  const { data, isLoading, isFetching } = useDashboard(serverParams);

  const totals = data?.totals ?? {
    totalDeposits: 0,
    totalWithdraws: 0,
    totalRewards: 0,
  };

  const deposits: TxRow[] = data?.pages?.deposits?.items ?? [];

  const withdraws: TxRow[] = data?.pages?.withdraws?.items ?? [];

  if (isLoading || isFetching) {
    return (
      <div className="p-10 flex items-center justify-center">
        <Spinner className="size-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-12">
      <SectionTitle title="Dashboard" />

      <Insights totals={totals} />

      {/* Filters */}
      <div className="rounded-2xl border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Status</Label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  status: e.target.value as StatusFilter,
                }))
              }
              className="h-10 w-full rounded-2xl border"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <Label>Game</Label>
            <select
              value={filters.game_id}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  game_id: e.target.value,
                }))
              }
              className="h-10 w-full dark:bg-black rounded-2xl border"
            >
              <option value="">All games</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={apply} disabled={!hasDraftChanges}>
              Apply
            </Button>

            <Button
              variant="secondary"
              onClick={reset}
              disabled={activeFiltersCount === 0}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GlobalDataTable<TxRow>
          title="Deposits"
          data={deposits}
          showActions={false}
          columns={[
            {
              key: "id",
              title: "ID",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Hash className="size-4" />
                  {row.id}
                </div>
              ),
            },
            { key: "game_name", title: "Game" },
            { key: "amount", title: "Amount" },
            { key: "status", title: "Status" },
            { key: "createdAt", title: "Date" },
          ]}
        />

        <GlobalDataTable<TxRow>
          title="Redeems"
          data={withdraws}
          showActions={false}
          columns={[
            {
              key: "direction",
              title: "Flow",
              render: (row) => (
                <div className="flex items-center gap-2">
                  {row.direction === "credit" ? (
                    <ArrowDownLeft className="size-4" />
                  ) : (
                    <ArrowUpRight className="size-4" />
                  )}
                  {row.direction}
                </div>
              ),
            },
            { key: "game_name", title: "Game" },
            { key: "amount", title: "Amount" },
            { key: "status", title: "Status" },
            { key: "createdAt", title: "Date" },
          ]}
        />
      </div>
    </div>
  );
}
