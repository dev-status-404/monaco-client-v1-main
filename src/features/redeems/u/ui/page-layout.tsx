"use client";

import React, { useEffect, useMemo, useState } from "react";
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

import { useUserInfo } from "@/helpers/use-user";
import { useWithdrawlActions, useWithdrawls } from "@/hooks/withdrawls";
import { useQueryClient } from "@tanstack/react-query";
import GamesSelect, { type GameOption } from "@/features/platforms/ui/select";

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
  CreditCard,
} from "lucide-react";
import { useGames } from "@/hooks/games";

type PaymentMethod = "pointsmate";

type RedeemRow = {
  id: string;
  amount: string;
  currency?: string;
  method?: string;
  destination?: string;

  status: string;
  admin_note?: string | null;

  createdAt: string;
  updatedAt?: string;

  game_id?: string;
  game_name?: string;
  game?: { id: string; name: string };

  user?: { id: string; email: string; firstName?: string; lastName?: string };
  reviewed_by_admin_id?: string | null;
  reviewedByAdmin?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  } | null;
};

type RedeemStatus =
  | "all"
  | "requested"
  | "pending"
  | "processing"
  | "approved"
  | "paid"
  | "completed"
  | "confirmed"
  | "rejected"
  | "failed";

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

function statusVariant(status?: string) {
  const s = String(status ?? "").toLowerCase();
  if (["paid", "approved", "completed", "confirmed", "granted"].includes(s))
    return "success";
  if (["requested", "pending", "processing"].includes(s)) return "primary";
  return "destructive";
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "pointsmate", label: "Pointsmate" },
];

const STATUS_OPTIONS: { value: RedeemStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "requested", label: "Requested" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "approved", label: "Approved" },
  { value: "paid", label: "Paid" },
  { value: "completed", label: "Completed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "Rejected" },
  { value: "failed", label: "Failed" },
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

const METHOD_FILTERS: { value: "all" | PaymentMethod; label: string }[] = [
  { value: "all", label: "All methods" },
  { value: "pointsmate", label: "Pointsmate" },
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
      currency,
      style: "currency",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

function isSuccessStatus(s?: string) {
  const x = String(s ?? "").toLowerCase();
  return ["paid", "approved", "completed", "confirmed", "granted"].includes(x);
}
function isPendingStatus(s?: string) {
  const x = String(s ?? "").toLowerCase();
  return ["requested", "pending", "processing"].includes(x);
}

export default function RedeemsLayout() {
  const queryClient = useQueryClient();
  const { id, role } = useUserInfo() as any;
  const isAdmin = String(role ?? "").toLowerCase() === "admin";
  const { data: gamesData } = useGames({ limit: 200 });

  const games = useMemo(() => {
    const rows = gamesData?.data ?? gamesData?.rows ?? gamesData?.games ?? [];
    if (!Array.isArray(rows)) return [];
    return rows.map((g: any) => ({
      id: g.id ?? g._id,
      name: g.name ?? g.title ?? "-",
    }));
  }, [gamesData]);

  /* ---------------- FILTER STATE ---------------- */

  const [filters, setFilters] = useState({
    status: "all" as RedeemStatus,
    date: "all" as any,
    method: "all" as any,
    search: "",
    game_id: "",
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    createdAt: undefined as string | undefined,
    status: undefined as string | undefined,
    method: undefined as string | undefined,
    game_id: undefined as string | undefined,
    user_id: isAdmin ? undefined : (id as string | undefined),
  });

  useEffect(() => {
    setQuery((prev) => ({
      ...prev,
      user_id: isAdmin ? undefined : (id as string | undefined),
    }));
  }, [id, isAdmin]);

  const { data, isLoading } = useWithdrawls(query);

  // ---- Withdraw actions (create) ----
  const withdrawlActions = useWithdrawlActions();
  const createWithdrawl = withdrawlActions.createWithdrawl;

  const isSubmitting: boolean =
    (withdrawlActions as any).isPending ??
    (withdrawlActions as any).isLoading ??
    (createWithdrawl as any)?.isPending ??
    (createWithdrawl as any)?.isLoading ??
    false;

  // ---- Request Modal state ----
  const [open, setOpen] = useState(false);
  const [requestForm, setRequestForm] = useState<{
    payment_method: PaymentMethod | "";
    amount: string;
    destination: string;
    game_id: string;
    game_name?: string;
  }>({
    payment_method: "pointsmate",
    amount: "",
    destination: "",
    game_id: "",
    game_name: "",
  });

  const submitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.user_id) return alert("User not found");

    const amt = Number(requestForm.amount);
    if (!Number.isFinite(amt) || amt <= 0) return alert("Enter a valid amount");
    if (!requestForm.destination.trim()) return alert("Enter wallet address");
    if (!requestForm.game_id) return alert("Select platform");

    createWithdrawl(
      {
        user_id: query.user_id!,
        method: requestForm.payment_method,
        amount: requestForm.amount,
        destination: requestForm.destination.trim(),
        game_id: requestForm.game_id,
        game_name: requestForm.game_name,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["withdrawls"] });
          queryClient.invalidateQueries({ queryKey: ["withdrawals"] });

          setOpen(false);
          setRequestForm({
            payment_method: "pointsmate",
            amount: "",
            destination: "",
            game_id: "",
            game_name: "",
          });
        },
        onError: (err: any) => {
          const validationDetails = err?.response?.data?.errors;
          const firstValidationMessage = Array.isArray(validationDetails)
            ? Object.values(validationDetails[0] || {})?.[0]
            : null;

          alert(
            firstValidationMessage ||
              err?.response?.data?.error?.message ||
              err?.response?.data?.message ||
              err?.message ||
              "Request failed",
          );
        },
      },
    );
  };

  const handleApproveWithdrawal = async (row: RedeemRow) => {
    if (!id) {
      alert("Admin user not found");
      return;
    }

    try {
      const destination = String(row.destination ?? "").trim();

      await withdrawlActions.updateWithdrawl({
        id: row.id,
        status: "approved",
        reviewed_by_admin_id: id,
        admin_note: row.admin_note || "Approved by admin",
        destination:
          destination && destination !== "-" ? destination : undefined,
        address: destination && destination !== "-" ? destination : undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["withdrawls"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      alert("Withdrawal approved and payout released.");
    } catch (err: any) {
      alert(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Approval failed",
      );
    }
  };

  const handleDenyWithdrawal = async (row: RedeemRow) => {
    if (!id) {
      alert("Admin user not found");
      return;
    }

    if (!window.confirm("Are you sure you want to deny this withdrawal request?")) return;

    try {
      await withdrawlActions.updateWithdrawl({
        id: row.id,
        status: "rejected",
        reviewed_by_admin_id: id,
        admin_note: "Rejected by admin",
      });

      queryClient.invalidateQueries({ queryKey: ["withdrawls"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      alert("Withdrawal request has been denied.");
    } catch (err: any) {
      alert(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Denial failed",
      );
    }
  };

  const rowsRaw: RedeemRow[] = useMemo(() => {
    const arr =
      (Array.isArray((data as any)?.data?.withdrawals) &&
        (data as any).data.withdrawals) ||
      (Array.isArray((data as any)?.data?.withdraws) &&
        (data as any).data.withdraws) ||
      (Array.isArray((data as any)?.data?.items) && (data as any).data.items) ||
      (Array.isArray((data as any)?.data) && (data as any).data) ||
      [];

    return arr.map((w: any) => ({
      id: w.id ?? w._id,
      amount: String(w.amount ?? "0"),
      currency: w.currency ?? "USD",
      method: w.method ?? w.payment_method ?? "-",
      destination: w.destination ?? w.address ?? "",

      status: String(w.status ?? "requested"),
      admin_note: w.admin_note ?? null,

      createdAt: w.createdAt ?? new Date().toISOString(),
      updatedAt: w.updatedAt,

      game_id: w.game_id ?? w.game?.id,
      game: w.game,
      game_name: w.game_name ?? w.game?.name ?? w.gameName ?? "-",

      user: w.user,

      reviewed_by_admin_id: w.reviewed_by_admin_id ?? null,
      reviewedByAdmin: w.reviewedByAdmin ?? null,
    }));
  }, [data]);

  // ✅ Apply ALL filters client-side using appliedFilters (so UI changes don't affect table until Apply)
  const filteredRows: RedeemRow[] = useMemo(() => {
    const q = appliedFilters.search.trim().toLowerCase();

    let cutoff: Date | null = null;
    if (appliedFilters.date !== "all") {
      const now = new Date();
      if (appliedFilters.date === "today") {
        cutoff = new Date(now);
        cutoff.setHours(0, 0, 0, 0);
      }
      if (appliedFilters.date === "last7") {
        cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 7);
        cutoff.setHours(0, 0, 0, 0);
      }
      if (appliedFilters.date === "last30") {
        cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 30);
        cutoff.setHours(0, 0, 0, 0);
      }
    }

    return rowsRaw.filter((r) => {
      // status
      if (appliedFilters.status !== "all") {
        const s = String(r.status ?? "").toLowerCase();
        if (s !== String(appliedFilters.status).toLowerCase()) return false;
      }

      // method
      if (appliedFilters.method !== "all") {
        const m = String(r.method ?? "").toLowerCase();
        if (m !== String(appliedFilters.method).toLowerCase()) return false;
      }

      if (appliedFilters.game_id) {
        if (String(r.game_id) !== String(appliedFilters.game_id)) {
          return false;
        }
      }

      // date
      if (cutoff) {
        const created = new Date(r.createdAt);
        if (Number.isFinite(created.getTime()) && created < cutoff)
          return false;
      }

      // search
      if (q) {
        const admin = r.reviewedByAdmin;
        const adminName = admin
          ? [admin.firstName, admin.lastName].filter(Boolean).join(" ")
          : "";

        const hay = [
          r.amount,
          r.currency,
          r.method,
          r.destination ?? "",
          r.status,
          r.game_name,
          r.game_id ?? "",
          r.admin_note ?? "",
          admin?.email ?? "",
          adminName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [rowsRaw, appliedFilters]);

  // ✅ KPI based on filteredRows (what user sees)
  const stats = useMemo(() => {
    const total = filteredRows.length;
    const approvedPaidCount = filteredRows.filter((r) =>
      isSuccessStatus(r.status),
    ).length;
    const pendingCount = filteredRows.filter((r) =>
      isPendingStatus(r.status),
    ).length;
    const failedCount = filteredRows.filter((r) =>
      ["failed", "rejected"].includes(String(r.status ?? "").toLowerCase()),
    ).length;

    const totalPaid = filteredRows
      .filter((r) => isSuccessStatus(r.status))
      .reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

    const currency = filteredRows.find((r) => r.currency)?.currency ?? "USD";

    return {
      total,
      approvedPaidCount,
      pendingCount,
      failedCount,
      totalPaid,
      currency,
    };
  }, [filteredRows]);

  // pagination from backend
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

  const applyFilters = () => {
    setAppliedFilters(filters);

    const nextStatus = filters.status === "all" ? undefined : filters.status;
    const nextMethod = filters.method === "all" ? undefined : filters.method;

    let nextCreatedAt: string | undefined;
    const now = new Date();

    if (filters.date === "today") nextCreatedAt = startOfDayISO(now);
    if (filters.date === "last7") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      nextCreatedAt = startOfDayISO(d);
    }
    if (filters.date === "last30") {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      nextCreatedAt = startOfDayISO(d);
    }

    setQuery((p) => ({
      ...p,
      page: 1,
      status: nextStatus,
      method: nextMethod,
      createdAt: nextCreatedAt,
      game_id: filters.game_id || undefined,
    }));

    queryClient.invalidateQueries({ queryKey: ["withdrawls"] });
  };

  const resetFilters = () => {
    const cleared = {
      status: "all",
      date: "all",
      method: "all",
      search: "",
      game_id: "",
    };

    setFilters(cleared as any);
    setAppliedFilters(cleared as any);

    setQuery((p) => ({
      ...p,
      page: 1,
      status: undefined,
      method: undefined,
      createdAt: undefined,
      game_id: undefined,
    }));

    queryClient.invalidateQueries({ queryKey: ["withdrawls"] });
  };

  const activeFiltersCount =
    (appliedFilters.status !== "all" ? 1 : 0) +
    (appliedFilters.method !== "all" ? 1 : 0) +
    (appliedFilters.date !== "all" ? 1 : 0) +
    (appliedFilters.search ? 1 : 0) +
    (appliedFilters.game_id ? 1 : 0);

  if (isLoading) {
    return (
      <div className="p-10 text-white flex items-center justify-center h-full">
        <Spinner className="size-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-12 text-foreground">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle title="Redeems" />

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="rounded-2xl"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["withdrawls"] });
              queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
            }}
            title="Refresh"
          >
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>

          {!isAdmin && (
            <Button className="rounded-2xl" onClick={() => setOpen(true)}>
              <Plus className="mr-2 size-4" />
              Request Redeem
            </Button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Total requests</div>
            <Wallet className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-semibold">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Approved / Paid</div>
            <BadgeCheck className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {stats.approvedPaidCount}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {formatMoney(String(stats.totalPaid), stats.currency)} total
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Pending</div>
            <Hourglass className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {stats.pendingCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Failed / Rejected
            </div>
            <AlertTriangle className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-semibold">{stats.failedCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:flex-1">
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      status: e.target.value as RedeemStatus,
                    }))
                  }
                  className="h-10 w-full rounded-2xl border border-border  pl-10 pr-3 outline-none"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={filters.date}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      date: e.target.value as any,
                    }))
                  }
                  className="h-10 w-full rounded-2xl border border-border  pl-10 pr-3 outline-none"
                >
                  {DATE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Method</Label>
              <div className="relative">
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={filters.method}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      method: e.target.value as any,
                    }))
                  }
                  className="h-10 w-full rounded-2xl border border-border pl-10 pr-3 outline-none"
                >
                  {METHOD_FILTERS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
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
                className="h-10 w-full mt-2 dark:bg-black rounded-2xl border border-border"
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
              <div className="ml-0 text-xs text-muted-foreground lg:ml-2">
                {activeFiltersCount} filter
                {activeFiltersCount > 1 ? "s" : ""} active
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {/* Pagination */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Rows</span>
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
            <span className="text-xs text-muted-foreground">Page</span>
            <Input
              defaultValue={page}
              className="h-9 w-16 rounded-2xl"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                const v = Number((e.target as HTMLInputElement).value);
                const next = clamp(Number.isFinite(v) ? v : 1, 1, totalPages);
                setQuery((p) => ({ ...p, page: next }));
              }}
            />
            <span className="text-xs text-muted-foreground">
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
      <GlobalDataTable<RedeemRow>
        title="Redeem Requests"
        columns={[
          { key: "game", title: "Game", render: (row) => row.game_name ?? "-" },
          {
            key: "amount",
            title: "Amount",
            align: "right",
            render: (row) => formatMoney(row.amount, row.currency ?? "USD"),
          },
          {
            key: "currency",
            title: "Currency",
            render: (row) => row.currency ?? "-",
          },
          {
            key: "method",
            title: "Method",
            render: (row) => row.method ?? "-",
          },
          {
            key: "destination",
            title: "Wallet Address",
            render: (row) => row.destination ?? "-",
          },
          {
            key: "status",
            title: "Status",
            render: (row) => (
              <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
            ),
          },
          {
            key: "admin_note",
            title: "Admin Note",
            render: (row) => row.admin_note ?? "-",
          },
          {
            key: "reviewed_by_admin_id",
            title: "Admin",
            render: (row) => row.reviewed_by_admin_id ?? "-",
          },
          {
            key: "createdAt",
            title: "Date",
            render: (row) => new Date(row.createdAt).toLocaleString(),
          },
          {
            key: "approve_action",
            title: "Approve",
            render: (row) => {
              const canAct =
                isAdmin &&
                ["requested", "pending", "processing"].includes(
                  String(row.status ?? "").toLowerCase(),
                );

              if (!canAct) return "-";

              return (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="rounded-xl"
                    onClick={() => handleApproveWithdrawal(row)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="rounded-xl"
                    onClick={() => handleDenyWithdrawal(row)}
                  >
                    Deny
                  </Button>
                </div>
              );
            },
          },
        ]}
        data={filteredRows}
        showActions={isAdmin}
        actions={
          isAdmin
            ? [
                {
                  key: "approve-withdrawal",
                  label: "Approve & Release",
                  onClick: handleApproveWithdrawal,
                  visible: (row) =>
                    ["requested", "pending", "processing"].includes(
                      String(row.status ?? "").toLowerCase(),
                    ),
                },
                {
                  key: "deny-withdrawal",
                  label: "Deny Request",
                  onClick: handleDenyWithdrawal,
                  visible: (row) =>
                    ["requested", "pending", "processing"].includes(
                      String(row.status ?? "").toLowerCase(),
                    ),
                },
              ]
            : []
        }
      />

      {/* Modal */}
      {!isAdmin && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="border-border bg-card text-foreground">
            <DialogHeader>
              <DialogTitle>Request Redeem</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Select your payment method and submit a redeem request.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submitRequest} className="space-y-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  value={requestForm.amount}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setRequestForm((p) => ({ ...p, amount: e.target.value }))
                  }
                  placeholder="e.g. 100.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Input value="Pointsmate" disabled />
              </div>

              <div className="space-y-2">
                <Label>Wallet Address</Label>
                <Input
                  value={requestForm.destination}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setRequestForm((p) => ({
                      ...p,
                      destination: e.target.value,
                    }))
                  }
                  placeholder="Enter payout wallet address"
                />
              </div>

              <div className="space-y-2">
                <Label>Select Platform</Label>
                <GamesSelect
                  value={requestForm.game_id}
                  disabled={isSubmitting}
                  onChange={(game: GameOption | null) =>
                    setRequestForm((p) => ({
                      ...p,
                      game_id: game?.id ?? "",
                      game_name: game?.name ?? "",
                    }))
                  }
                />
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
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
