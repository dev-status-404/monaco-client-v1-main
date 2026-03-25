"use client";

import React, { useMemo, useState } from "react";
import SectionTitle from "@/components/common/section-title";
import { GlobalDataTable } from "@/components/common/global-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";

import {
  Search,
  Filter,
  RefreshCw,
  Users as UsersIcon,
  Shield,
  Ban,
  CheckCircle2,
  Settings2,
} from "lucide-react";

import { UserActionsForm } from "@/features/user/form";
import { useUsers } from "@/hooks/user";

type UserRole = "all" | "user" | "admin" | "support";
type UserStatus = "all" | "active" | "blocked";

type UserRow = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  createdAt?: string;

  blocked?: boolean;
  isBlocked?: boolean;
  status?: string;
};

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "support", label: "Support" },
];

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
];

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

function resolveBlocked(u: UserRow) {
  if (typeof u.blocked === "boolean") return u.blocked;
  if (typeof u.isBlocked === "boolean") return u.isBlocked;
  if (typeof u.status === "string") return u.status.toLowerCase() === "blocked";
  return false;
}

function userName(u: UserRow) {
  const fn = String(u.firstName ?? "").trim();
  const ln = String(u.lastName ?? "").trim();
  const n = `${fn} ${ln}`.trim();
  return n || u.email || u.id;
}

export default function UsersLayout() {
  const queryClient = useQueryClient();

  // 1) Draft UI inputs (DO NOT apply/fetch automatically)
  const [filters, setFilters] = useState<{
    role: UserRole;
    status: UserStatus;
    search: string;
  }>({
    role: "all",
    status: "all",
    search: "",
  });

  // 2) Applied filters (table + KPI use THIS, like Redeems)
  const [appliedFilters, setAppliedFilters] = useState(filters);

  // 3) Server query (ONLY changes on Apply / pagination / rows)
  const [query, setQuery] = useState<{
    page: number;
    limit: number;
    role?: string;
    status?: string;
    search?: string;
  }>({
    page: 1,
    limit: 10,
    role: undefined,
    status: undefined,
    search: undefined,
  });

  const { data, isLoading } = useUsers(query);

  // normalize server list
  const usersRaw: UserRow[] = useMemo(() => {
    const arr =
      (Array.isArray((data as any)?.data?.users) && (data as any).data.users) ||
      (Array.isArray((data as any)?.data?.items) && (data as any).data.items) ||
      (Array.isArray((data as any)?.items) && (data as any).items) ||
      (Array.isArray(data as any) && (data as any)) ||
      [];

    return arr.map((u: any) => ({
      id: u.id ?? u._id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      createdAt: u.createdAt,
      blocked: u.blocked,
      isBlocked: u.isBlocked,
      status: u.status,
    }));
  }, [data]);

  // ✅ Apply ALL filters client-side using appliedFilters
  // (so typing in inputs doesn't affect table until Apply)
  const filteredUsers: UserRow[] = useMemo(() => {
    const q = appliedFilters.search.trim().toLowerCase();
    return usersRaw.filter((u) => {
      if (appliedFilters.role !== "all") {
        if (String(u.role ?? "").toLowerCase() !== appliedFilters.role) return false;
      }

      if (appliedFilters.status !== "all") {
        const isBlocked = resolveBlocked(u);
        if (appliedFilters.status === "blocked" && !isBlocked) return false;
        if (appliedFilters.status === "active" && isBlocked) return false;
      }

      if (q) {
        const hay = [
          u.email,
          u.firstName,
          u.lastName,
          u.role,
          resolveBlocked(u) ? "blocked" : "active",
          u.id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [usersRaw, appliedFilters]);

  // KPI based on what user currently sees
  const stats = useMemo(() => {
    const total = filteredUsers.length;
    const blockedCount = filteredUsers.filter((u) => resolveBlocked(u)).length;
    const activeCount = total - blockedCount;
    const adminsCount = filteredUsers.filter(
      (u) => String(u.role ?? "").toLowerCase() === "admin",
    ).length;

    return { total, activeCount, blockedCount, adminsCount };
  }, [filteredUsers]);

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

  // ✅ Apply button: applies filters to UI + triggers server query
  const applyFilters = () => {
    // 1) Apply locally (table + KPI)
    setAppliedFilters(filters);

    // 2) Apply to server query ONLY on click
    const nextRole = filters.role === "all" ? undefined : filters.role;
    const nextStatus = filters.status === "all" ? undefined : filters.status;
    const nextSearch = filters.search.trim() ? filters.search.trim() : undefined;

    setQuery((p) => ({
      ...p,
      page: 1,
      role: nextRole,
      status: nextStatus,
      search: nextSearch,
    }));

    // if your hook key is static ["users"], force refetch:
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const resetFilters = () => {
    const cleared = { role: "all", status: "all", search: "" } as const;

    setFilters(cleared);
    setAppliedFilters(cleared);

    setQuery((p) => ({
      ...p,
      page: 1,
      role: undefined,
      status: undefined,
      search: undefined,
    }));

    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  // ✅ Active filters should reflect APPLIED (not draft)
  const activeFiltersCount =
    (appliedFilters.role !== "all" ? 1 : 0) +
    (appliedFilters.status !== "all" ? 1 : 0) +
    (appliedFilters.search.trim() ? 1 : 0);

  if (isLoading) {
    return (
      <div className="p-10 h-full text-slate-900 dark:text-white flex items-center justify-center">
        <Spinner className="size-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle title="Users" />

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="rounded-2xl"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
            title="Refresh"
          >
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">Total (filtered)</div>
            <UsersIcon className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">Active</div>
            <CheckCircle2 className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{stats.activeCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">Blocked</div>
            <Ban className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{stats.blockedCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-white/60">Admins</div>
            <Shield className="size-4 text-slate-500 dark:text-white/70" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{stats.adminsCount}</div>
        </div>
      </div>

      {/* Filters row */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/5 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:flex-1">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Role</Label>
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-white/40" />
                <select
                  value={filters.role}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, role: e.target.value as UserRole }))
                  }
                  className="h-10 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/5 pl-10 pr-3 text-slate-900 dark:text-white outline-none"
                >
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-white dark:bg-slate-900">
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Status</Label>
              <div className="relative">
                <Ban className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-white/40" />
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      status: e.target.value as UserStatus,
                    }))
                  }
                  className="h-10 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/5 pl-10 pr-3 text-slate-900 dark:text-white outline-none"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-white dark:bg-slate-900">
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
                  placeholder="Email, name, role..."
                  className="h-10 rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-black/5 pl-10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/30"
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
      <GlobalDataTable<UserRow>
        title="Users"
        columns={[
          { key: "name", title: "Name", render: (row) => userName(row) },
          { key: "email", title: "Email" },
          { key: "role", title: "Role", render: (row) => row.role ?? "-" },
          {
            key: "blocked",
            title: "Blocked",
            render: (row) => {
              const b = resolveBlocked(row);
              return (
                <Badge variant={b ? "destructive" : "secondary"} className="px-2">
                  {b ? "Yes" : "No"}
                </Badge>
              );
            },
          },
          {
            key: "createdAt",
            title: "Created",
            render: (row) =>
              row.createdAt ? new Date(row.createdAt).toLocaleString() : "-",
          },
        ]}
        data={filteredUsers}
        showActions={true}
        enableAdd={false}
        heightClassName="h-[420px]"
        actions={[
          {
            key: "manage",
            label: "Manage",
            icon: <Settings2 className="h-4 w-4" />,
            onClick: () => {},
            openModal: {
              title: (row) => `User: ${row?.email ?? ""}`,
              description: () => "Update details, block/unblock, view balance.",
              render: ({ row, onClose, onSuccess }) => (
                <UserActionsForm
                  row={row as any}
                  onClose={onClose}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["users"] });
                    onSuccess();
                  }}
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
    </div>
  );
}