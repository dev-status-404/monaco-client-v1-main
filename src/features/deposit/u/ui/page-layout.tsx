"use client";

import React, { useMemo, useState } from "react";
import SectionTitle from "@/components/common/section-title";
import { GlobalDataTable } from "@/components/common/global-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useDeposits, useDepositActions } from "@/hooks/deposit";
import { useQueryClient } from "@tanstack/react-query";
import { useUserInfo } from "@/helpers/use-user";
import GamesSelect, { type GameOption } from "@/features/platforms/ui/select";

// ✅ if you have lucide installed (shadcn default), these give a nicer UI
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  CalendarDays,
  Wallet,
  BadgeCheck,
  AlertTriangle,
  Hourglass,
} from "lucide-react";
import { useGames } from "@/hooks/games";

type DepositRow = {
  id: string;
  amount: string;
  status: string;
  currency?: string;
  provider?: string;
  createdAt: string;

  game_id?: string;
  game_name?: string;
  game?: { id: string; name: string };

  user?: { id: string; email: string; firstName?: string; lastName?: string };
};

type DepositStatus =
  | "all"
  | "pending"
  | "initiated"
  | "processing"
  | "confirmed"
  | "completed"
  | "failed";

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

function statusVariant(status?: string) {
  const s = String(status ?? "").toLowerCase();
  if (["confirmed", "completed"].includes(s)) return "success";
  if (["pending", "initiated", "processing"].includes(s)) return "primary";
  return "destructive";
}

const STATUS_OPTIONS: { value: DepositStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "initiated", label: "Initiated" },
  { value: "processing", label: "Processing" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

const PROVIDER_OPTIONS = ["Stripe", "Coinflow"] as const;

const DATE_OPTIONS: {
  value: "all" | "today" | "last7" | "last30";
  label: string;
}[] = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
];

function startOfDayISO(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function formatMoney(amount: string, currency = "USD") {
  const n = Number(amount);
  if (!Number.isFinite(n)) return amount;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

function isSuccessStatus(s?: string) {
  const x = String(s ?? "").toLowerCase();
  return x === "confirmed" || x === "completed";
}
function isPendingStatus(s?: string) {
  const x = String(s ?? "").toLowerCase();
  return x === "pending" || x === "initiated" || x === "processing";
}

export default function DepositLayout() {
  const queryClient = useQueryClient();
  const { id } = useUserInfo();
  const { data: gamesData } = useGames({ limit: 200 });

  const games = useMemo(() => {
    const rows = gamesData?.data ?? gamesData?.rows ?? gamesData?.games ?? [];
    if (!Array.isArray(rows)) return [];
    return rows.map((g: any) => ({
      id: g.id ?? g._id,
      name: g.name ?? g.title ?? "-",
    }));
  }, [gamesData]);

  // ---- Filters ----
  const [filters, setFilters] = useState<{
    status: DepositStatus;
    date: "all" | "today" | "last7" | "last30";
    search: string;
    game_id: string;
  }>({
    status: "all",
    date: "all",
    search: "",
    game_id: "",
  });

  // ---- Query ----
  const [query, setQuery] = useState<{
    page: number;
    limit: number;
    createdAt?: string;
    status?: string;
    game_id?: string;
    user_id: string;
  }>({
    page: 1,
    limit: 10,
    createdAt: undefined,
    status: undefined,
    game_id: undefined,
    user_id: id as string,
  });

  const { data, isLoading } = useDeposits(query);

  // ✅ actions
  const depositActions = useDepositActions();
  const createDeposit = depositActions.createDeposit;

  const isSubmitting: boolean =
    (depositActions as any).isPending ??
    (depositActions as any).isLoading ??
    (createDeposit as any)?.isPending ??
    (createDeposit as any)?.isLoading ??
    false;

  // ---- Modal state ----
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<{
    amount: string;
    currency: string;
    provider: string;
    game_id: string;
    game_name: string;
  }>({
    amount: "",
    currency: "USD",
    provider: "Stripe",
    game_id: "",
    game_name: "",
  });

  // ✅ normalize deposits list
  const depositsRaw: DepositRow[] = useMemo(() => {
    const arr =
      (Array.isArray((data as any)?.data?.deposits) &&
        (data as any).data.deposits) ||
      (Array.isArray((data as any)?.data?.items) && (data as any).data.items) ||
      (Array.isArray((data as any)?.data) && (data as any).data) ||
      (Array.isArray(data as any) && (data as any)) ||
      [];

    return arr.map((d: any) => ({
      id: d.id ?? d._id,
      amount: String(d.amount ?? "0"),
      status: String(d.status ?? "pending"),
      currency: d.currency ?? "USD",
      provider: d.provider ?? "—",
      createdAt: d.createdAt ?? new Date().toISOString(),

      game_id: d.game_id ?? d.game?.id,
      game: d.game,
      game_name: d.game_name ?? d.game?.name ?? d.gameName ?? "-",

      user: d.user,
    }));
  }, [data]);

  // ✅ client-side search
  const deposits: DepositRow[] = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return depositsRaw;

    return depositsRaw.filter((d) => {
      const hay = [d.amount, d.currency, d.provider, d.status, d.game_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [depositsRaw, filters.search]);

  // ✅ KPI summary cards (better UI + quick insights)
  const stats = useMemo(() => {
    const total = deposits.length;

    const completedCount = deposits.filter((d) =>
      isSuccessStatus(d.status),
    ).length;
    const pendingCount = deposits.filter((d) =>
      isPendingStatus(d.status),
    ).length;
    const failedCount = deposits.filter(
      (d) => String(d.status ?? "").toLowerCase() === "failed",
    ).length;

    const totalCompletedAmount = deposits
      .filter((d) => isSuccessStatus(d.status))
      .reduce((acc, d) => acc + (Number(d.amount) || 0), 0);

    const currency = deposits.find((d) => d.currency)?.currency ?? "USD";

    return {
      total,
      completedCount,
      pendingCount,
      failedCount,
      totalCompletedAmount,
      currency,
    };
  }, [deposits]);

  // ✅ pagination
  const totalCount = Number(
    (data as any)?.pagination?.totalCount ??
      (data as any)?.data?.pagination?.totalCount ??
      0,
  );
  const totalPages = Number(
    (data as any)?.pagination?.totalPages ??
      (data as any)?.data?.pagination?.totalPages ??
      1,
  );

  const page = query.page;
  const limit = query.limit;

  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  // ---- Apply Filters ----
  const applyFilters = () => {
    const nextStatus = filters.status === "all" ? undefined : filters.status;

    let nextCreatedAt: string | undefined;
    const now = new Date();

    if (filters.date === "today") {
      nextCreatedAt = startOfDayISO(now);
    } else if (filters.date === "last7") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      nextCreatedAt = startOfDayISO(d);
    } else if (filters.date === "last30") {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      nextCreatedAt = startOfDayISO(d);
    }

    setQuery((p) => ({
      ...p,
      page: 1,
      status: nextStatus,
      createdAt: nextCreatedAt,
      game_id: filters.game_id || undefined,
    }));
  };

  const resetFilters = () => {
    setFilters({ status: "all", date: "all", search: "", game_id: "" });
    setQuery((p) => ({
      ...p,
      page: 1,
      status: undefined,
      createdAt: undefined,
      game_id: undefined,
    }));
  };

  const activeFiltersCount =
    (query.status ? 1 : 0) +
    (query.createdAt ? 1 : 0) +
    (query.game_id ? 1 : 0) +
    (filters.search ? 1 : 0);

  // ---- Create deposit ----
  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.user_id) {
      alert("User not found");
      return;
    }

    const amt = Number(form.amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      alert("Enter a valid amount");
      return;
    }

    if (!form.game_id) {
      alert("Select a game");
      return;
    }

    createDeposit(
      {
        user_id: query.user_id!,
        amount: form.amount,
        currency: form.currency,
        provider: form.provider,
        game_id: form.game_id,
        game_name: form.game_name,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["deposits"] });
          queryClient.invalidateQueries({ queryKey: ["deposit"] });

          setOpen(false);
          setForm({
            amount: "",
            currency: "USD",
            provider: "Stripe",
            game_id: "",
            game_name: "",
          });
        },
        onError: (err: any) => {
          alert(
            err?.response?.data?.message || err?.message || "Create failed",
          );
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="p-10 h-full text-white flex items-center justify-center">
        <Spinner className="size-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle title="Deposits" />

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="rounded-2xl"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["deposits"] })
            }
            title="Refresh"
          >
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>

          <Button className="rounded-2xl" onClick={() => setOpen(true)}>
            <Plus className="mr-2 size-4" />
            Add Deposit
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">
              Total records
            </div>
            <Wallet className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.total}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">
              Completed
            </div>
            <BadgeCheck className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.completedCount}
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-white/60">
            {formatMoney(String(stats.totalCompletedAmount), stats.currency)}{" "}
            total
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">
              Pending
            </div>
            <Hourglass className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.pendingCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">
              Failed
            </div>
            <AlertTriangle className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.failedCount}
          </div>
        </div>
      </div>

      {/* Filters row (compact + modern) */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:flex-1">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">
                Status
              </Label>
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-white/40" />
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      status: e.target.value as DepositStatus,
                    }))
                  }
                  className="h-10 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 pl-10 pr-3 text-slate-900 dark:text-white outline-none"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option
                      key={o.value}
                      value={o.value}
                      className="bg-white dark:bg-slate-900"
                    >
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Date</Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-white/40" />
                <select
                  value={filters.date}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      date: e.target.value as any,
                    }))
                  }
                  className="h-10 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 pl-10 pr-3 text-slate-900 dark:text-white outline-none"
                >
                  {DATE_OPTIONS.map((o) => (
                    <option
                      key={o.value}
                      value={o.value}
                      className="bg-white dark:bg-slate-900"
                    >
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ✅ Game Select (SERVER SIDE) */}
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
                className="h-10 w-full mt-3 dark:bg-black rounded-2xl border"
              >
                <option value="">All games</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button className="rounded-2xl" onClick={applyFilters}>
              Apply
            </Button>
            <Button
              variant="secondary"
              className="rounded-2xl"
              onClick={resetFilters}
            >
              Reset
            </Button>

            {activeFiltersCount > 0 ? (
              <div className="ml-0 text-xs text-slate-600 dark:text-white/60 lg:ml-2">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""}{" "}
                active
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {/* Pagination */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 dark:text-white/60">
            Rows
          </span>
          <div className="flex gap-2">
            {[10, 20, 50].map((l) => (
              <Button
                key={l}
                variant={limit === l ? "default" : "secondary"}
                className="h-9 rounded-2xl"
                onClick={() => setQuery((p) => ({ ...p, limit: l, page: 1 }))}
              >
                {l}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="h-9 rounded-2xl"
            disabled={isFirst}
            onClick={() => setQuery((p) => ({ ...p, page: p.page - 1 }))}
          >
            Prev
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-white/60">
              Page
            </span>
            <Input
              defaultValue={page}
              className="h-9 w-16 rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                const v = Number((e.target as HTMLInputElement).value);
                const next = clamp(Number.isFinite(v) ? v : 1, 1, totalPages);
                setQuery((p) => ({ ...p, page: next }));
              }}
            />
            <span className="text-xs text-slate-600 dark:text-white/60">
              / {totalPages}
            </span>
          </div>

          <Button
            variant="secondary"
            className="h-9 rounded-2xl"
            disabled={isLast || totalCount === 0}
            onClick={() => setQuery((p) => ({ ...p, page: p.page + 1 }))}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Table */}
      <GlobalDataTable<DepositRow>
        title="Deposit History"
        columns={[
          {
            key: "game",
            title: "Game",
            render: (row) => row.game_name ?? "-",
          },
          {
            key: "amount",
            title: "Amount",
            align: "right",
            render: (row) => formatMoney(row.amount, row.currency ?? "USD"),
          },
          {
            key: "status",
            title: "Status",
            render: (row) => (
              <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
            ),
          },
          {
            key: "provider",
            title: "Provider",
            render: (row) => row.provider ?? "-",
          },
          {
            key: "currency",
            title: "Currency",
            render: (row) => row.currency ?? "-",
          },
          {
            key: "createdAt",
            title: "Date",
            render: (row) => new Date(row.createdAt).toLocaleString(),
          },
        ]}
        data={deposits}
        showActions={false}
      />

      {/* Add Deposit Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-slate-200 dark:border-white/10 bg-white dark:bg-card text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Add Deposit</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-white/60">
              Choose a game, set amount, and submit a deposit.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">
                Select Game
              </Label>
              <GamesSelect
                value={form.game_id}
                disabled={isSubmitting}
                onChange={(g: GameOption | null) => {
                  setForm((p) => ({
                    ...p,
                    game_id: g?.id ?? "",
                    game_name: g?.name ?? "",
                  }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">
                Amount
              </Label>
              <Input
                value={form.amount}
                disabled={isSubmitting}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                placeholder="e.g. 50.00"
                className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-white/80">
                  Currency
                </Label>
                <Input
                  value={form.currency}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, currency: e.target.value }))
                  }
                  placeholder="USD"
                  className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/30"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-white/80">
                  Provider
                </Label>
                <select
                  value={form.provider}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, provider: e.target.value }))
                  }
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-slate-900 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white disabled:opacity-60"
                >
                  {PROVIDER_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-white dark:bg-slate-900">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-2xl"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="rounded-2xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
