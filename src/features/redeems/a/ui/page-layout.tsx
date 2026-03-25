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
  Pencil,
} from "lucide-react";
import { WithdrawlActionsForm } from "../../form";

type PaymentMethod = "coin-flow" | "manual" | "paypal" | "bank";

type RedeemRow = {
  id: string;
  amount: string;
  currency?: string;
  method?: string;

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
  { value: "coin-flow", label: "Coin-Flow" },
  { value: "manual", label: "Manual" },
  { value: "paypal", label: "PayPal" },
  { value: "bank", label: "Bank Transfer" },
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
  ...PAYMENT_METHODS.map((m) => ({ value: m.value, label: m.label })),
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
  return ["paid", "approved", "completed", "confirmed", "granted"].includes(x);
}
function isPendingStatus(s?: string) {
  const x = String(s ?? "").toLowerCase();
  return ["requested", "pending", "processing"].includes(x);
}

export default function RedeemsLayout() {
  const queryClient = useQueryClient();
  const { id } = useUserInfo();

  // Draft UI inputs (DO NOT apply/fetch automatically)
  const [filters, setFilters] = useState<{
    status: RedeemStatus;
    date: "all" | "today" | "last7" | "last30";
    method: "all" | PaymentMethod;
    search: string;
    user_id?: string;
  }>({
    status: "all",
    date: "all",
    method: "all",
    search: "",
    user_id: id as string,
  });

  // Applied filters (only changes on Apply button)
  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Server query (only changes on Apply button / pagination / rows per page)
  const [query, setQuery] = useState<{
    page: number;
    limit: number;
    createdAt?: string;
    status?: string;
    method?: string;
    user_id: string;
  }>({
    page: 1,
    limit: 10,
    createdAt: undefined,
    status: undefined,
    method: undefined,
    user_id: id as string,
  });

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
    game_id: string;
    game_name?: string;
    admin_note?: string;
    reviewed_by_admin_id?: string;
  }>({
    payment_method: "",
    amount: "",
    game_id: "",
    game_name: "",
    admin_note: "",
    reviewed_by_admin_id: id as string,
  });

  const submitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.user_id) return alert("User not found");

    const amt = Number(requestForm.amount);
    if (!Number.isFinite(amt) || amt <= 0) return alert("Enter a valid amount");
    if (!requestForm.payment_method) return alert("Select payment method");
    if (!requestForm.game_id) return alert("Select platform");

    createWithdrawl(
      {
        user_id: query.user_id!,
        method: requestForm.payment_method,
        amount: requestForm.amount,
        game_id: requestForm.game_id,
        game_name: requestForm.game_name,
        admin_note: requestForm.admin_note,
        reviewed_by_admin_id: requestForm.reviewed_by_admin_id,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["withdrawls"] });
          queryClient.invalidateQueries({ queryKey: ["withdrawals"] });

          setOpen(false);
          setRequestForm({
            payment_method: "",
            amount: "",
            game_id: "",
            game_name: "",
          });
        },
        onError: (err: any) => {
          alert(
            err?.response?.data?.message || err?.message || "Request failed",
          );
        },
      },
    );
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
          r.status,
          r.game_name,
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

  // ✅ Apply button: applies filters to UI + (optionally) triggers server query
  const applyFilters = () => {
    // 1) Apply locally (table + KPI)
    setAppliedFilters(filters);

    // 2) Apply to server query ONLY on click
    const nextStatus = filters.status === "all" ? undefined : filters.status;
    const nextMethod = filters.method === "all" ? undefined : filters.method;

    let nextCreatedAt: string | undefined = undefined;
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
    }));

    // NOTE:
    // - If your hook uses queryKey: ["withdrawls", query], you DON'T need this.
    // - If your hook uses a static key ["withdrawls"], keep it to force refetch.
    queryClient.invalidateQueries({ queryKey: ["withdrawls"] });
    queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
  };

  const resetFilters = () => {
    const cleared = {
      status: "all",
      date: "all",
      method: "all",
      search: "",
    } as const;

    setFilters(cleared);
    setAppliedFilters(cleared);

    setQuery((p) => ({
      ...p,
      page: 1,
      status: undefined,
      method: undefined,
      createdAt: undefined,
    }));

    // optional: refetch base list
    queryClient.invalidateQueries({ queryKey: ["withdrawls"] });
    queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
  };

  // ✅ Active filters should reflect APPLIED (not draft)
  const activeFiltersCount =
    (appliedFilters.status !== "all" ? 1 : 0) +
    (appliedFilters.method !== "all" ? 1 : 0) +
    (appliedFilters.date !== "all" ? 1 : 0) +
    (appliedFilters.search.trim() ? 1 : 0);

  if (isLoading) {
    return (
      <div className="p-10 text-slate-900 dark:text-white flex items-center justify-center h-full">
        <Spinner className="size-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-12">
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
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">Total requests</div>
            <Wallet className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.total}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">Approved / Paid</div>
            <BadgeCheck className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.approvedPaidCount}
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-white/60">
            {formatMoney(String(stats.totalPaid), stats.currency)} total
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">Pending</div>
            <Hourglass className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.pendingCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">Failed / Rejected</div>
            <AlertTriangle className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.failedCount}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:flex-1">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Status</Label>
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-white/40" />
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      status: e.target.value as RedeemStatus,
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

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Method</Label>
              <div className="relative">
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-white/40" />
                <select
                  value={filters.method}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      method: e.target.value as any,
                    }))
                  }
                  className="h-10 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 pl-10 pr-3 text-slate-900 dark:text-white outline-none"
                >
                  {METHOD_FILTERS.map((o) => (
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

            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label className="text-slate-700 dark:text-white/80">Search</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-white/40" />
                <Input
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, search: e.target.value }))
                  }
                  placeholder="Game, amount, status..."
                  className="h-10 rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 pl-10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/30"
                />
              </div>
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
            key: "status",
            title: "Status",
            render: (row) => (
              <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
            ),
          },
          {
            key: String("reviewedBy"),
            title: "Reviewed By",
            render: (row) => {
              const admin = row.reviewedByAdmin;
              if (!admin) return "-";
              const name = [admin.firstName, admin.lastName]
                .filter(Boolean)
                .join(" ");
              return name || admin.email || admin.id;
            },
          },
          {
            key: "reviewed_by_admin_id",
            title: "Reviewed By (ID)",
            render: (row) => row.reviewed_by_admin_id ?? "-",
          },
          {
            key: "admin_note",
            title: "Admin Note",
            render: (row) => row.admin_note ?? "-",
          },
          {
            key: "createdAt",
            title: "Date",
            render: (row) => new Date(row.createdAt).toLocaleString(),
          },
        ]}
        data={filteredRows}
        showActions={true}
        enableAdd={false}
        actions={[
          {
            key: "edit",
            label: "Edit",
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => {},
            openModal: {
              title: (row) => `Redeem #${String(row.id).slice(0, 8)}`,
              description: () => "Update status & admin note.",
              render: ({ row, onClose, onSuccess }) => (
                <WithdrawlActionsForm
                  mode="custom"
                  row={row as any}
                  onClose={onClose}
                  onSuccess={() => {
                    // refresh list after success
                    queryClient.invalidateQueries({ queryKey: ["withdrawls"] });
                    queryClient.invalidateQueries({
                      queryKey: ["withdrawals"],
                    });
                    onSuccess();
                  }}
                  readOnly={true} // ✅ only status + note by default
                  allowStatusEdit={true} // ✅ admin can change status
                />
              ),
            },
          },
        ]}
      />

      {/* Pagination */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 dark:text-white/60">Rows</span>
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

      {/* Request Redeem Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Request Redeem</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-white/60">
              Select your payment method and submit a redeem request.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitRequest} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Amount</Label>
              <Input
                value={requestForm.amount}
                disabled={isSubmitting}
                onChange={(e) =>
                  setRequestForm((p) => ({ ...p, amount: e.target.value }))
                }
                placeholder="e.g. 100.00"
                className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Payment Method</Label>
              <select
                value={requestForm.payment_method}
                disabled={isSubmitting}
                onChange={(e) =>
                  setRequestForm((p) => ({
                    ...p,
                    payment_method: e.target.value as PaymentMethod,
                  }))
                }
                className="h-10 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-slate-900 dark:text-white outline-none disabled:opacity-60"
              >
                <option value="" className="bg-white dark:bg-slate-900">
                  Select method
                </option>
                {PAYMENT_METHODS.map((m) => (
                  <option
                    key={m.value}
                    value={m.value}
                    className="bg-white dark:bg-slate-900"
                  >
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Select Platform</Label>
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
    </div>
  );
}
