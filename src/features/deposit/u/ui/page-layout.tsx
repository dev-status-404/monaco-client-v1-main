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
import { useQueryClient } from "@tanstack/react-query";
import { useUserInfo } from "@/helpers/use-user";
import GamesSelect, { type GameOption } from "@/features/platforms/ui/select";
import { useGames } from "@/hooks/games";
import {
  useWalletActions,
  useWalletBalance,
  useWalletTransactionsByUser,
} from "@/hooks/wallet";
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
  Link2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

type ReceiveType = "lightning" | "onchain";

type DepositRow = {
  id: string;
  amount: string;
  currency?: string;
  status: string;
  api_status?: string;
  createdAt: string;
  game_id?: string | null;
  game_name?: string | null;
  address?: string | null;
  magic_link?: string | null;
};

type DepositStatus =
  | "all"
  | "pending"
  | "initiated"
  | "processing"
  | "created"
  | "completed"
  | "confirmed"
  | "failed";

const STATUS_OPTIONS: { value: DepositStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "initiated", label: "Initiated" },
  { value: "processing", label: "Processing" },
  { value: "created", label: "Created" },
  { value: "completed", label: "Completed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "failed", label: "Failed" },
];

const RECEIVE_TYPE_OPTIONS: { value: ReceiveType; label: string }[] = [
  { value: "lightning", label: "Lightning" },
  { value: "onchain", label: "On-chain" },
];

const DATE_OPTIONS: {
  value: "all" | "today" | "last7" | "last30";
  label: string;
}[] = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
];

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

function truncateAddress(addr?: string | null): string {
  if (!addr) return "-";
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-4)}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy full address"
      className="ml-1 inline-flex items-center rounded p-0.5 text-slate-500 hover:text-slate-900 dark:text-white/40 dark:hover:text-white transition-colors"
    >
      {copied ? (
        <Check className="size-3 text-emerald-500" />
      ) : (
        <Copy className="size-3" />
      )}
    </button>
  );
}

function statusVariant(status?: string) {
  const s = String(status ?? "").toLowerCase();
  if (["completed", "confirmed"].includes(s)) return "success";
  if (["pending", "initiated", "processing", "created"].includes(s)) return "primary";
  return "destructive";
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
  return ["completed", "confirmed"].includes(String(s ?? "").toLowerCase());
}

function isPendingStatus(s?: string) {
  return ["pending", "initiated", "processing", "created"].includes(
    String(s ?? "").toLowerCase(),
  );
}

function isWithinDate(createdAt: string, range: "all" | "today" | "last7" | "last30") {
  if (range === "all") return true;

  const created = new Date(createdAt);
  if (!Number.isFinite(created.getTime())) return true;

  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);

  if (range === "last7") cutoff.setDate(cutoff.getDate() - 7);
  if (range === "last30") cutoff.setDate(cutoff.getDate() - 30);

  return created >= cutoff;
}

export default function DepositLayout({ userId: userIdProp }: { userId?: string }) {
  const queryClient = useQueryClient();
  const { id: currentUserId } = useUserInfo();
  const id = userIdProp ?? currentUserId;
  const { data: gamesData } = useGames({ limit: 200 });
  const walletActions = useWalletActions();

  const [open, setOpen] = useState(false);
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
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    status: undefined as string | undefined,
  });
  const [form, setForm] = useState({
    amount: "",
    type: "lightning" as ReceiveType,
    memo: "",
    game_id: "",
    game_name: "",
  });
  const [latestDeposit, setLatestDeposit] = useState<{
    transactionId?: string;
    pmTransactionId?: string;
    address?: string;
    magic_link?: string;
    amount?: string;
    status?: string;
  } | null>(null);

  const games = useMemo(() => {
    const rows = gamesData?.data ?? gamesData?.rows ?? gamesData?.games ?? [];
    if (!Array.isArray(rows)) return [];
    return rows.map((g: any) => ({
      id: g.id ?? g._id,
      name: g.name ?? g.title ?? "-",
    }));
  }, [gamesData]);

  const { data: balanceResponse } = useWalletBalance(id as string | undefined);
  const { data, isLoading, isFetching } = useWalletTransactionsByUser(id as string | undefined, {
    type: "deposit",
    status: query.status,
    page: query.page,
    limit: query.limit,
  });

  const rowsRaw: DepositRow[] = useMemo(() => {
    const items = (data as any)?.data?.items ?? [];
    if (!Array.isArray(items)) return [];

    return items.map((row: any) => ({
      id: row.id,
      amount: String(row.amount ?? "0"),
      currency: row.currency ?? "USD",
      status: String(row.status ?? row.api_status ?? "pending"),
      api_status: row.api_status ?? row.apiStatus ?? "pending",
      createdAt: row.createdAt ?? new Date().toISOString(),
      game_id: row.game_id ?? row.game?.id ?? null,
      game_name: row.game_name ?? row.game?.name ?? null,
      address: row.address ?? row.meta?.address ?? null,
      magic_link: row.magic_link ?? row.magicLink ?? row.meta?.magicLink ?? null,
    }));
  }, [data]);

  const rows = useMemo(() => {
    const q = filters.search.trim().toLowerCase();

    return rowsRaw.filter((row) => {
      if (filters.game_id && String(row.game_id ?? "") !== String(filters.game_id)) return false;
      if (!isWithinDate(row.createdAt, filters.date)) return false;

      if (!q) return true;

      const hay = [
        row.amount,
        row.status,
        row.api_status,
        row.address,
        row.magic_link,
        row.game_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [rowsRaw, filters]);

  const stats = useMemo(() => {
    const total = rows.length;
    const completedCount = rows.filter((row) => isSuccessStatus(row.status)).length;
    const pendingCount = rows.filter((row) => isPendingStatus(row.status)).length;
    const failedCount = rows.filter((row) => String(row.status).toLowerCase() === "failed").length;
    const totalCompletedAmount = rows
      .filter((row) => isSuccessStatus(row.status))
      .reduce((acc, row) => acc + (Number(row.amount) || 0), 0);

    return {
      total,
      completedCount,
      pendingCount,
      failedCount,
      totalCompletedAmount,
    };
  }, [rows]);

  const balance = (balanceResponse as any)?.data ?? null;
  const page = query.page;
  const limit = query.limit;
  const totalCount = Number((data as any)?.data?.totalCount ?? 0);
  const totalPages = Number((data as any)?.data?.totalPages ?? 1);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  const activeFiltersCount =
    (query.status ? 1 : 0) +
    (filters.date !== "all" ? 1 : 0) +
    (filters.game_id ? 1 : 0) +
    (filters.search.trim() ? 1 : 0);

  const applyFilters = () => {
    setQuery((prev) => ({
      ...prev,
      page: 1,
      status: filters.status === "all" ? undefined : filters.status,
    }));
  };

  const resetFilters = () => {
    setFilters({ status: "all", date: "all", search: "", game_id: "" });
    setQuery((prev) => ({ ...prev, page: 1, status: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("User not found.");
      return;
    }

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount < 1) {
      toast.error("Enter a valid amount.");
      return;
    }

    try {
      const response = await walletActions.createDeposit({
        userId: String(id),
        amount,
        type: form.type,
        memo: form.memo || undefined,
        gameId: form.game_id || undefined,
        gameName: form.game_name || undefined,
      });

      const result = response?.data ?? null;
      setLatestDeposit(result);
      setOpen(false);
      setForm({ amount: "", type: "lightning", memo: "", game_id: "", game_name: "" });
      toast.success("Deposit address created.");
      queryClient.invalidateQueries({ queryKey: ["wallet-balance", id] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions-user", id] });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Deposit request failed.",
      );
    }
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle title="Deposits" />

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="rounded-2xl"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["wallet-transactions-user", id] })}
            title="Refresh"
          >
            <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button className="rounded-2xl" onClick={() => setOpen(true)}>
            <Plus className="mr-2 size-4" />
            Create Deposit Address
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">Total records</div>
            <Wallet className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">Completed</div>
            <BadgeCheck className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{stats.completedCount}</div>
          <div className="mt-1 text-xs text-slate-600 dark:text-white/60">{formatMoney(String(stats.totalCompletedAmount))} total</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">Pending</div>
            <Hourglass className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{stats.pendingCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">Failed</div>
            <AlertTriangle className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{stats.failedCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">Spendable</div>
            <Wallet className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {formatMoney(String(balance?.spendable ?? 0))}
          </div>
        </div>
      </div>

      {latestDeposit ? (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Latest Deposit Address</div>
              <div className="text-xs text-slate-600 dark:text-white/60">
                Use the generated address or magic link. Status will update automatically when webhooks are received.
              </div>
            </div>
            <Badge variant={statusVariant(latestDeposit.status)}>{latestDeposit.status ?? "PENDING"}</Badge>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3">
              <div className="text-[11px] text-slate-600 dark:text-white/60">Amount</div>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {formatMoney(String(latestDeposit.amount ?? 0))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3 lg:col-span-2">
              <div className="text-[11px] text-slate-600 dark:text-white/60">Address</div>
              <div className="mt-1 flex items-center gap-1">
                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                  {truncateAddress(latestDeposit.address)}
                </span>
                {latestDeposit.address && <CopyButton text={latestDeposit.address} />}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3 lg:col-span-3">
              <div className="text-[11px] text-slate-600 dark:text-white/60">Magic Link</div>
              {latestDeposit.magic_link ? (
                <a
                  href={latestDeposit.magic_link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  <Link2 className="size-4" />
                  Open Deposit Link
                </a>
              ) : (
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">-</div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:flex-1">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Status</Label>
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-white/40" />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as DepositStatus }))}
                  className="h-10 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 pl-10 pr-3 text-slate-900 dark:text-white outline-none"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900">
                      {option.label}
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
                  onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value as any }))}
                  className="h-10 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 pl-10 pr-3 text-slate-900 dark:text-white outline-none"
                >
                  {DATE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Game</Label>
              <select
                value={filters.game_id}
                onChange={(e) => setFilters((prev) => ({ ...prev, game_id: e.target.value }))}
                className="h-10 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-slate-900 dark:text-white outline-none"
              >
                <option value="">All games</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id} className="bg-white dark:bg-slate-900">
                    {game.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Search</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-white/40" />
                <Input
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  placeholder="Address, magic link, amount..."
                  className="h-10 rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 pl-10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/30"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button className="rounded-2xl" onClick={applyFilters}>Apply</Button>
            <Button variant="secondary" className="rounded-2xl" onClick={resetFilters}>Reset</Button>
            {activeFiltersCount > 0 ? (
              <div className="ml-0 text-xs text-slate-600 dark:text-white/60 lg:ml-2">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} active
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 dark:text-white/60">Rows</span>
          <div className="flex gap-2">
            {[10, 20, 50].map((rowLimit) => (
              <Button
                key={rowLimit}
                variant={limit === rowLimit ? "default" : "secondary"}
                className="h-9 rounded-2xl"
                onClick={() => setQuery((prev) => ({ ...prev, limit: rowLimit, page: 1 }))}
              >
                {rowLimit}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="h-9 rounded-2xl"
            disabled={isFirst}
            onClick={() => setQuery((prev) => ({ ...prev, page: prev.page - 1 }))}
          >
            Prev
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-white/60">Page</span>
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
            <span className="text-xs text-slate-600 dark:text-white/60">/ {totalPages}</span>
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
            key: "api_status",
            title: "API Status",
            render: (row) => row.api_status ?? "-",
          },
          {
            key: "address",
            title: "Address",
            render: (row) =>
              row.address ? (
                <span className="inline-flex items-center gap-1">
                  <span className="font-mono text-sm">
                    {truncateAddress(row.address)}
                  </span>
                  <CopyButton text={row.address} />
                </span>
              ) : (
                "-"
              ),
          },
          {
            key: "magic_link",
            title: "Magic Link",
            render: (row) =>
              row.magic_link ? (
                <a
                  href={row.magic_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  <Link2 className="size-3" />
                  Open Deposit Link
                </a>
              ) : (
                "-"
              ),
          },
          {
            key: "createdAt",
            title: "Date",
            render: (row) => new Date(row.createdAt).toLocaleString(),
          },
        ]}
        data={rows}
        showActions={false}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-slate-200 dark:border-white/10 bg-white dark:bg-card text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Create Deposit Address</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-white/60">
              Submit the deposit request, then use the generated address or magic link to complete payment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">
                Amount
              </Label>
              <Input
                value={form.amount}
                disabled={walletActions.isPending}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                placeholder="Enter amount"
                className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Deposit Type</Label>
              <select
                value={form.type}
                disabled={walletActions.isPending}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as ReceiveType }))}
                className="h-10 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-slate-900 dark:text-white outline-none"
              >
                {RECEIVE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Game</Label>
              <GamesSelect
                value={form.game_id}
                disabled={walletActions.isPending}
                onChange={(game: GameOption | null) =>
                  setForm((prev) => ({
                    ...prev,
                    game_id: game?.id ?? "",
                    game_name: game?.name ?? "",
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Memo</Label>
              <Input
                value={form.memo}
                disabled={walletActions.isPending}
                onChange={(e) => setForm((prev) => ({ ...prev, memo: e.target.value }))}
                placeholder="Optional memo"
                className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-2xl"
                onClick={() => setOpen(false)}
                disabled={walletActions.isPending}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="rounded-2xl"
                disabled={walletActions.isPending}
              >
                {walletActions.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
