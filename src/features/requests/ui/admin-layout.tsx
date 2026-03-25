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

import {
  Search,
  Filter,
  RefreshCw,
  CalendarDays,
  CheckCircle2,
  Ban,
  Hourglass,
  ShieldCheck,
} from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";

import { useGameRequests, useGameRequestsActions } from "@/hooks/game-requests";
import { useGameCredsActions } from "@/hooks/game-creds";
import { useUserInfo } from "@/helpers/use-user";

type RequestStatus = "all" | "pending" | "approved" | "rejected";

type GameRequestRow = {
  id: string | number;
  status: "pending" | "approved" | "rejected";
  note?: string | null;

  createdAt?: string;
  updatedAt?: string;

  game_id?: string;
  game_name?: string;
  game?: { id: string; name: string };

  user_id?: string;
  user?: { id: string; email?: string; firstName?: string; lastName?: string };

  reviewed_by_admin_id?: string | null;
};

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const DATE_OPTIONS: { value: "all" | "today" | "last7" | "last30"; label: string }[] =
  [
    { value: "all", label: "All time" },
    { value: "today", label: "Today" },
    { value: "last7", label: "Last 7 days" },
    { value: "last30", label: "Last 30 days" },
  ];

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

function startOfDayISO(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

// ✅ Prevent "map is not a function"
const pickArray = (v: any): any[] => {
  if (Array.isArray(v)) return v;

  const candidates = [
    v?.data?.requests,
    v?.data?.items,
    v?.data?.rows,
    v?.data?.data,
    v?.data,
    v?.items,
    v?.rows,
    v?.results,
    v?.result,
  ];

  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
};

function statusVariant(s?: string) {
  const x = String(s ?? "").toLowerCase();
  if (x === "approved") return "default";
  if (x === "pending") return "secondary";
  return "destructive";
}

function userName(u?: GameRequestRow["user"]) {
  if (!u) return "-";
  const fn = String(u.firstName ?? "").trim();
  const ln = String(u.lastName ?? "").trim();
  const n = `${fn} ${ln}`.trim();
  return n || u.email || u.id;
}

function gameName(r: GameRequestRow) {
  return r.game_name ?? r.game?.name ?? r.game_id ?? "-";
}

export default function AdminLayout() {
  const queryClient = useQueryClient();
  const { id: adminId } = useUserInfo();

  // 1) Draft UI inputs (DO NOT apply/fetch automatically)
  const [filters, setFilters] = useState<{
    status: RequestStatus;
    date: "all" | "today" | "last7" | "last30";
    search: string;
  }>({
    status: "all",
    date: "all",
    search: "",
  });

  // 2) Applied filters (table + KPI use THIS)
  const [appliedFilters, setAppliedFilters] = useState(filters);

  // 3) Server query (ONLY changes on Apply / pagination / rows)
  const [query, setQuery] = useState<{
    page: number;
    limit: number;
    createdAt?: string;
    status?: "pending" | "approved" | "rejected";
    search?: string;
  }>({
    page: 1,
    limit: 10,
    createdAt: undefined,
    status: undefined,
    search: undefined,
  });

  const { data, isLoading } = useGameRequests(query);
  const requestActions = useGameRequestsActions();
  const credsActions = useGameCredsActions();

  // ---- Approve Modal state ----
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveRow, setApproveRow] = useState<GameRequestRow | null>(null);

  // ✅ only the two inputs you want
  const [credsForm, setCredsForm] = useState<{
    login_username: string;
    login_password_enc: string;
  }>({
    login_username: "",
    login_password_enc: "",
  });

  const isBusy = requestActions.isLoading || credsActions.isLoading;

  // normalize list
  const rowsRaw: GameRequestRow[] = useMemo(() => {
    const arr = pickArray(data);

    return arr.map((r: any) => ({
      id: r.id ?? r._id,
      status: (String(r.status ?? "pending").toLowerCase() as any) ?? "pending",
      note: r.note ?? r.admin_note ?? null,

      createdAt: r.createdAt,
      updatedAt: r.updatedAt,

      game_id: r.game_id ?? r.game?.id ?? r.gameId,
      game_name: r.game_name ?? r.game?.name ?? r.gameName,
      game: r.game,

      user_id: r.user_id ?? r.user?.id ?? r.userId,
      user: r.user,

      reviewed_by_admin_id: r.reviewed_by_admin_id ?? null,
    }));
  }, [data]);

  // client-side filtering (only APPLIED)
  const filteredRows: GameRequestRow[] = useMemo(() => {
    const q = appliedFilters.search.trim().toLowerCase();

    let cutoff: Date | null = null;
    if (appliedFilters.date !== "all") {
      const now = new Date();
      cutoff = new Date(now);
      cutoff.setHours(0, 0, 0, 0);

      if (appliedFilters.date === "last7") cutoff.setDate(cutoff.getDate() - 7);
      if (appliedFilters.date === "last30") cutoff.setDate(cutoff.getDate() - 30);
    }

    return rowsRaw.filter((r) => {
      if (appliedFilters.status !== "all") {
        if (String(r.status).toLowerCase() !== appliedFilters.status) return false;
      }

      if (cutoff && r.createdAt) {
        const created = new Date(r.createdAt);
        if (Number.isFinite(created.getTime()) && created < cutoff) return false;
      }

      if (q) {
        const hay = [
          String(r.id),
          r.status,
          r.note ?? "",
          gameName(r),
          r.user?.email ?? "",
          userName(r.user),
          r.user_id ?? "",
          r.game_id ?? "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [rowsRaw, appliedFilters]);

  // KPI
  const stats = useMemo(() => {
    const total = filteredRows.length;
    const pending = filteredRows.filter((r) => r.status === "pending").length;
    const approved = filteredRows.filter((r) => r.status === "approved").length;
    const rejected = filteredRows.filter((r) => r.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [filteredRows]);

  // pagination (from backend)
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

  // Apply / Reset
  const applyFilters = () => {
    setAppliedFilters(filters);

    const nextStatus =
      filters.status === "all" ? undefined : (filters.status as any);

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

    const nextSearch = filters.search.trim() ? filters.search.trim() : undefined;

    setQuery((p) => ({
      ...p,
      page: 1,
      status: nextStatus,
      createdAt: nextCreatedAt,
      search: nextSearch,
    }));

    queryClient.invalidateQueries({ queryKey: ["game_requests"] });
  };

  const resetFilters = () => {
    const cleared = { status: "all", date: "all", search: "" } as const;
    setFilters(cleared);
    setAppliedFilters(cleared);

    setQuery((p) => ({
      ...p,
      page: 1,
      status: undefined,
      createdAt: undefined,
      search: undefined,
    }));

    queryClient.invalidateQueries({ queryKey: ["game_requests"] });
  };

  const activeFiltersCount =
    (appliedFilters.status !== "all" ? 1 : 0) +
    (appliedFilters.date !== "all" ? 1 : 0) +
    (appliedFilters.search.trim() ? 1 : 0);

  // Actions
  const openApprove = (row: GameRequestRow) => {
    setApproveRow(row);
    setCredsForm({ login_username: "", login_password_enc: "" });
    setApproveOpen(true);
  };

  const approveAndCreateCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveRow) return;

    const game_id = approveRow.game_id ?? approveRow.game?.id;
    const assigned_to_user_id = approveRow.user_id ?? approveRow.user?.id;

    if (!game_id) return alert("Game id missing on request");
    if (!assigned_to_user_id) return alert("User id missing on request");

    if (!credsForm.login_username.trim()) return alert("Login username is required");
    if (!credsForm.login_password_enc.trim()) return alert("Login password is required");

    try {
      await credsActions.createCredential({
        game_id,
        assigned_to_user_id,
        login_username: credsForm.login_username.trim(),
        login_password_enc: credsForm.login_password_enc.trim(),
        status: "assigned",
      } as any);

      // ✅ Approve request (status validation: pending/approved/rejected)
      await requestActions.updateRequest({
        id: approveRow.id,
        status: "approved",
        reviewed_by_admin_id: String(adminId),
      });

      queryClient.invalidateQueries({ queryKey: ["game_requests"] });
      queryClient.invalidateQueries({ queryKey: ["game_creds"] });

      setApproveOpen(false);
      setApproveRow(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to approve");
    }
  };

  const rejectRequest = async (row: GameRequestRow) => {
    try {
      await requestActions.updateRequest({
        id: row.id,
        status: "rejected",
        reviewed_by_admin_id: String(adminId),
      });

      queryClient.invalidateQueries({ queryKey: ["game_requests"] });
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to reject");
    }
  };

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
        <SectionTitle title="Admin - Game Requests" />

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="rounded-2xl"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["game_requests"] })
            }
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
            <div className="text-xs text-slate-600 dark:text-white/60">Total (filtered)</div>
            <ShieldCheck className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.total}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">Pending</div>
            <Hourglass className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.pending}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">Approved</div>
            <CheckCircle2 className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.approved}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">Rejected</div>
            <Ban className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.rejected}
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
                      status: e.target.value as RequestStatus,
                    }))
                  }
                  className="h-10 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 pl-10 pr-3 text-slate-900 dark:text-white outline-none"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-white dark:bg-slate-900">
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
                    setFilters((p) => ({ ...p, date: e.target.value as any }))
                  }
                  className="h-10 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 pl-10 pr-3 text-slate-900 dark:text-white outline-none"
                >
                  {DATE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-white dark:bg-slate-900">
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2 lg:col-span-2">
              <Label className="text-slate-700 dark:text-white/80">Search</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-white/40" />
                <Input
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, search: e.target.value }))
                  }
                  placeholder="User email, game, status, note..."
                  className="h-10 rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 pl-10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/30"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button className="rounded-2xl" onClick={applyFilters}>
              Apply
            </Button>
            <Button variant="secondary" className="rounded-2xl" onClick={resetFilters}>
              Reset
            </Button>

            {activeFiltersCount > 0 ? (
              <div className="ml-0 text-xs text-slate-600 dark:text-white/60 lg:ml-2">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} active
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Table */}
      <GlobalDataTable<GameRequestRow>
        title="Game Requests"
        columns={[
          { key: "id", title: "ID", render: (r) => String(r.id).slice(0, 8) },
          { key: "user", title: "User", render: (r) => userName(r.user) },
          { key: "user_email", title: "Email", render: (r) => r.user?.email ?? "-" },
          { key: "game", title: "Game", render: (r) => gameName(r) },
          {
            key: "status",
            title: "Status",
            render: (r) => (
              <Badge variant={statusVariant(r.status) as any}>{r.status}</Badge>
            ),
          },
          { key: "note", title: "Note", render: (r) => r.note ?? "-" },
          {
            key: "createdAt",
            title: "Created",
            render: (r) =>
              r.createdAt ? new Date(r.createdAt).toLocaleString() : "-",
          },
        ]}
        data={filteredRows}
        showActions
        enableAdd={false}
        heightClassName="h-[420px]"
        actions={[
          {
            key: "approve",
            label: "Approve",
            icon: <CheckCircle2 className="h-4 w-4" />,
            onClick: (row) => {
              const r = row as any as GameRequestRow;
              if (r.status !== "pending") return;
              openApprove(r);
            },
          },
          {
            key: "reject",
            label: "Reject",
            icon: <Ban className="h-4 w-4" />,
            onClick: (row) => {
              const r = row as any as GameRequestRow;
              if (r.status !== "pending") return;
              rejectRequest(r);
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

      {/* Approve Modal (ONLY username + password) */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Approve Request & Create Game Credentials</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-white/60">
              This will create credentials with:
              <br />
              <span className="text-slate-900 dark:text-white/80">
                game_id = request.game_id, assigned_to_user_id = request.user_id, status = "assigned"
              </span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={approveAndCreateCreds} className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 text-xs text-slate-600 dark:text-white/70">
              <div>
                <span className="text-slate-500 dark:text-white/50">User:</span>{" "}
                {approveRow?.user?.email ?? userName(approveRow?.user)}
              </div>
              <div>
                <span className="text-slate-500 dark:text-white/50">Game:</span>{" "}
                {approveRow ? gameName(approveRow) : "-"}
              </div>
              <div>
                <span className="text-slate-500 dark:text-white/50">game_id:</span>{" "}
                <span className="font-mono">{approveRow?.game_id ?? "-"}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-white/50">assigned_to_user_id:</span>{" "}
                <span className="font-mono">{approveRow?.user_id ?? "-"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Login Username</Label>
              <Input
                value={credsForm.login_username}
                disabled={isBusy}
                onChange={(e) =>
                  setCredsForm((p) => ({ ...p, login_username: e.target.value }))
                }
                className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/30"
                placeholder="@gamer-4061"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Login Password</Label>
              <Input
                type="password"
                value={credsForm.login_password_enc}
                disabled={isBusy}
                onChange={(e) =>
                  setCredsForm((p) => ({ ...p, login_password_enc: e.target.value }))
                }
                className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/30"
                placeholder="••••••••"
              />
              <div className="text-xs text-slate-600 dark:text-white/50">
                If your backend expects encrypted value in <span className="font-mono">login_password_enc</span>,
                pass the encrypted string here. Otherwise rename backend field to accept plain password.
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-2xl"
                onClick={() => setApproveOpen(false)}
                disabled={isBusy}
              >
                Cancel
              </Button>

              <Button type="submit" className="rounded-2xl" disabled={isBusy}>
                {isBusy ? "Saving..." : "Approve & Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}