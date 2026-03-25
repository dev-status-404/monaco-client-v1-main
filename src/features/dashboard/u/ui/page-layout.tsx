"use client";

import { useEffect, useMemo, useState } from "react";
import Insights from "./insights";
import SectionTitle from "@/components/common/section-title";
import { GlobalDataTable } from "@/components/common/global-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDashboard } from "@/hooks/dashboard";
import { useUserInfo } from "@/helpers/use-user";
import { useGames } from "@/hooks/games";

import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Filter,
  RefreshCw,
  Hash,
  Gamepad2,
  Gift,
  Copy,
  ExternalLink,
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

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "approved", label: "Approved" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "rejected", label: "Rejected" },
];

const formatMoney = (amount?: string) => {
  const value = Number(amount ?? 0);
  if (!Number.isFinite(value)) return amount ?? "-";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
};

const normalizeStatus = (value?: string) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const statusVariant = (value?: string) => {
  const status = normalizeStatus(value);

  if (["approved", "paid", "completed", "confirmed"].includes(status)) {
    return "success";
  }

  if (["pending", "processing"].includes(status)) {
    return "yellow";
  }

  if (["failed", "rejected"].includes(status)) {
    return "destructive";
  }

  return "secondary";
};

const directionVariant = (value?: string) =>
  String(value ?? "").toLowerCase() === "credit" ? "success" : "primary";

const matchesDateFilter = (
  createdAt: string | undefined,
  filter: DateFilter,
) => {
  if (filter === "all") return true;
  if (!createdAt) return false;

  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) return false;

  const now = new Date();

  if (filter === "today") {
    return createdDate.toDateString() === now.toDateString();
  }

  const days = filter === "last7" ? 7 : 30;
  const threshold = new Date(now);
  threshold.setHours(0, 0, 0, 0);
  threshold.setDate(threshold.getDate() - (days - 1));

  return createdDate >= threshold;
};

const matchesSearch = (row: TxRow, search: string) => {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  return [
    row.id,
    row.amount,
    row.status,
    row.createdAt,
    row.game_name,
    row.direction,
    row.reference_type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
};

const filterRows = (
  rows: TxRow[],
  applied: {
    date: DateFilter;
    status: StatusFilter;
    search: string;
  },
) => {
  return rows.filter((row) => {
    const hasStatusMatch =
      applied.status === "all" ||
      normalizeStatus(row.status) === applied.status;

    return (
      hasStatusMatch &&
      matchesDateFilter(row.createdAt, applied.date) &&
      matchesSearch(row, applied.search)
    );
  });
};

export default function Dashboard() {
  const { id } = useUserInfo();
  const queryClient = useQueryClient();
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [origin, setOrigin] = useState("https://demo.lukesweeps.com");

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

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

  const referralCode = useMemo(() => {
    const rawId = String(id ?? "demo-user").trim();
    return rawId ? `friend-${rawId.slice(0, 8)}` : "friend-demo";
  }, [id]);

  const referralUrl = useMemo(() => {
    const base = origin.replace(/\/$/, "");
    return `${base}/auth/signup?ref=${encodeURIComponent(referralCode)}&demo=1`;
  }, [origin, referralCode]);

  const totals = data?.totals ?? {
    totalDeposits: 0,
    totalWithdraws: 0,
    totalRewards: 0,
  };

  const deposits: TxRow[] = data?.pages?.deposits?.items ?? [];
  const withdraws: TxRow[] = data?.pages?.withdraws?.items ?? [];

  const filteredDeposits = useMemo(
    () => filterRows(deposits, applied),
    [deposits, applied],
  );

  const filteredWithdraws = useMemo(
    () => filterRows(withdraws, applied),
    [withdraws, applied],
  );

  const copyReferralUrl = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast.success("Referral demo URL copied.");
    } catch {
      toast.error("Unable to copy the referral URL.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 h-full text-slate-900 dark:text-white flex items-center justify-center">
        <Spinner className="size-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle title="Dashboard" />

        <div className="flex items-center gap-2">
          <Button
            className="rounded-2xl"
            onClick={() => setIsReferralOpen(true)}
          >
            <Gift className="mr-2 size-4" />
            Refer a Friend
          </Button>

          <Button
            variant="secondary"
            className="rounded-2xl"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["dashboard"] })
            }
            title="Refresh"
          >
            <RefreshCw
              className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <Dialog open={isReferralOpen} onOpenChange={setIsReferralOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-card dark:text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="size-5" />
              Refer a Friend
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-white/60">
              Share this demo signup URL with a friend. It points to the signup
              page with a sample referral code.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <Label className="text-slate-700 dark:text-white/80">
                  Demo referral URL
                </Label>
                <Badge variant="secondary" className="rounded-xl">
                  {referralCode}
                </Badge>
              </div>

              <Input
                value={referralUrl}
                readOnly
                className="font-mono text-xs sm:text-sm"
              />

              <p className="mt-2 text-xs text-slate-500 dark:text-white/50">
                Friends can use this link to open signup with the demo referral
                attached.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                className="rounded-2xl"
                onClick={copyReferralUrl}
              >
                <Copy className="mr-2 size-4" />
                Copy Link
              </Button>

              <Button asChild className="rounded-2xl">
                <a href={referralUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 size-4" />
                  Open Signup
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Insights totals={totals} />

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:flex-1">
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
                      status: e.target.value as StatusFilter,
                    }))
                  }
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-slate-900 outline-none dark:border-white/10 dark:bg-black/5 dark:text-white"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-white dark:bg-slate-900"
                    >
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
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      date: e.target.value as DateFilter,
                    }))
                  }
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-slate-900 outline-none dark:border-white/10 dark:bg-black/5 dark:text-white"
                >
                  {DATE_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-white dark:bg-slate-900"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">Game</Label>
              <div className="relative">
                <Gamepad2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-white/40" />
                <select
                  value={filters.game_id}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      game_id: e.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-slate-900 outline-none dark:border-white/10 dark:bg-black/5 dark:text-white"
                >
                  <option value="">All games</option>
                  {games.map((g) => (
                    <option
                      key={g.id}
                      value={g.id}
                      className="bg-white dark:bg-slate-900"
                    >
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-white/80">
                Search
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-white/40" />
                <Input
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      search: e.target.value,
                    }))
                  }
                  placeholder="ID, game, status..."
                  className="h-10 rounded-2xl border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-500 dark:border-white/10 dark:bg-black/5 dark:text-white dark:placeholder:text-white/30"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

            {activeFiltersCount > 0 ? (
              <div className="ml-0 text-xs text-slate-600 dark:text-white/60 lg:ml-2">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""}{" "}
                active
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <GlobalDataTable<TxRow>
          title="Recent Deposits"
          data={filteredDeposits}
          showActions={false}
          showViewAll
          viewAllHref={`/deposits/u/${id}`}
          viewAllLabel="View Deposits"
          heightClassName="h-[420px]"
          columns={[
            {
              key: "id",
              title: "ID",
              render: (row) => (
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                  <div className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/70">
                    <Hash className="size-4" />
                  </div>
                  <span className="max-w-[11rem] truncate font-mono text-xs sm:text-sm">
                    {row.id}
                  </span>
                </div>
              ),
            },
            {
              key: "game_name",
              title: "Game",
              render: (row) => (
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {row.game_name ?? "-"}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-white/50">
                    Deposit
                  </span>
                </div>
              ),
            },
            {
              key: "amount",
              title: "Amount",
              align: "right",
              render: (row) => (
                <div className="text-right">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {formatMoney(row.amount)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-white/50">
                    USD
                  </div>
                </div>
              ),
            },
            {
              key: "status",
              title: "Status",
              render: (row) => (
                <Badge
                  variant={statusVariant(row.status) as any}
                  className="rounded-xl capitalize"
                >
                  {row.status ?? "-"}
                </Badge>
              ),
            },
            {
              key: "createdAt",
              title: "Date",
              render: (row) => (
                <span className="text-sm text-slate-600 dark:text-white/70">
                  {formatDate(row.createdAt)}
                </span>
              ),
            },
          ]}
        />

        <GlobalDataTable<TxRow>
          title="Recent Redeems"
          data={filteredWithdraws}
          showActions={false}
          showViewAll
          viewAllHref={`/redeems/u/${id}`}
          viewAllLabel="View Redeems"
          heightClassName="h-[420px]"
          columns={[
            {
              key: "direction",
              title: "Flow",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Badge
                    variant={directionVariant(row.direction) as any}
                    className="rounded-xl capitalize"
                  >
                    {row.direction === "credit" ? (
                      <ArrowDownLeft className="size-3" />
                    ) : (
                      <ArrowUpRight className="size-3" />
                    )}
                    {row.direction ?? "-"}
                  </Badge>
                </div>
              ),
            },
            {
              key: "game_name",
              title: "Game",
              render: (row) => (
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {row.game_name ?? "-"}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-white/50">
                    {row.reference_type ?? "Redeem"}
                  </span>
                </div>
              ),
            },
            {
              key: "amount",
              title: "Amount",
              align: "right",
              render: (row) => (
                <div className="text-right">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {formatMoney(row.amount)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-white/50">
                    USD
                  </div>
                </div>
              ),
            },
            {
              key: "status",
              title: "Status",
              render: (row) => (
                <Badge
                  variant={statusVariant(row.status) as any}
                  className="rounded-xl capitalize"
                >
                  {row.status ?? "-"}
                </Badge>
              ),
            },
            {
              key: "createdAt",
              title: "Date",
              render: (row) => (
                <span className="text-sm text-slate-600 dark:text-white/70">
                  {formatDate(row.createdAt)}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
