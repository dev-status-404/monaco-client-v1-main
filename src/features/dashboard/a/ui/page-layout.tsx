"use client";

import { useUserInfo } from "@/helpers/use-user";
import { useDashboard } from "@/hooks/dashboard";
import { useMemo, useState } from "react";

// insights
import { DashboardInsightsCards } from "@/features/dashboard/a/ui/insight-bar";

// table
import { GlobalDataTable } from "@/components/common/global-table";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";

// ✅ your modal form (uses useUpdateUser inside)
import { UserActionsForm } from "@/features/user/form";
import { GlobalAreaChart } from "@/components/common/global-area-chart";
import { Spinner } from "@/components/ui/spinner";

const AdminDashboard = () => {
  const { id } = useUserInfo();

  const [query, setQuery] = useState({
    range: "1w",
    user_id: id || "",
  });

  const { data, isLoading } = useDashboard(query);
  
  const pages = data?.pages ?? {};

  // ✅ table data
  const users = (pages?.users?.items ?? []) as any[];
  const deposits = (pages?.deposits?.items ?? []) as any[];
  const withdraws = (pages?.withdraws?.items ?? []) as any[];
  const transactions = (pages?.transactions?.items ?? []) as any[];
  const gameRequests = (pages?.gameRequests?.items ?? []) as any[];

  // ✅ Build a fast lookup: userId -> "First Last" (fallback to email/id)
  const userNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users) {
      const fn = String(u?.firstName ?? "").trim();
      const ln = String(u?.lastName ?? "").trim();
      const name = `${fn} ${ln}`.trim();
      map.set(String(u?.id ?? ""), name || u?.email || String(u?.id ?? ""));
    }
    return map;
  }, [users]);

  const resolveUserName = (row: any) => {
    // many rows include `user` object; use it first
    const u = row?.user;
    if (u) {
      const fn = String(u?.firstName ?? "").trim();
      const ln = String(u?.lastName ?? "").trim();
      const name = `${fn} ${ln}`.trim();
      return name || u?.email || u?.id || "-";
    }
    // fallback to lookup by user_id
    const uid = String(row?.user_id ?? "");
    return userNameById.get(uid) || uid || "-";
    // (if you want "—" instead of id fallback, replace `uid` above)
  };

  const usersColumns = useMemo(
    () => [
      {
        key: "name",
        title: "Name",
        render: (row: any) => {
          const fn = String(row?.firstName ?? "").trim();
          const ln = String(row?.lastName ?? "").trim();
          const name = `${fn} ${ln}`.trim();
          return name || row?.email || "-";
        },
      },
      { key: "email", title: "Email" },
      { key: "role", title: "Role" },
      {
        key: "blocked",
        title: "Blocked",
        render: (row: any) => (
          <Badge variant={row?.blocked ? "destructive" : "success"}>
            {row?.blocked ? "Yes" : "No"}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        title: "Created",
        render: (row: any) =>
          row?.createdAt ? new Date(row.createdAt).toLocaleString() : "-",
      },
    ],
    [],
  );

  const depositsColumns = useMemo(
    () => [
      {
        key: "user_name",
        title: "User",
        render: (row: any) => resolveUserName(row),
      },
      {
        key: "game_name",
        title: "Game",
        render: (row: any) => row?.game?.name || row?.game_name || "-",
      },
      { key: "provider", title: "Provider" },
      { key: "amount", title: "Amount", align: "right" as const },
      { key: "currency", title: "Currency" },
      {
        key: "status",
        title: "Status",
        render: (row: any) => (
          <Badge variant="yellow">{row?.status ?? "-"}</Badge>
        ),
      },
      {
        key: "createdAt",
        title: "Created",
        render: (row: any) =>
          row?.createdAt ? new Date(row.createdAt).toLocaleString() : "-",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userNameById],
  );

  const withdrawsColumns = useMemo(
    () => [
      {
        key: "user_name",
        title: "User",
        render: (row: any) => resolveUserName(row),
      },
      {
        key: "game_name",
        title: "Game",
        render: (row: any) => row?.game?.name || row?.game_name || "-",
      },
      { key: "amount", title: "Amount", align: "right" as const },
      { key: "currency", title: "Currency" },
      { key: "method", title: "Method" },
      {
        key: "status",
        title: "Status",
        render: (row: any) => (
          <Badge variant="primary">{row?.status ?? "-"}</Badge>
        ),
      },
      {
        key: "createdAt",
        title: "Created",
        render: (row: any) =>
          row?.createdAt ? new Date(row.createdAt).toLocaleString() : "-",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userNameById],
  );

  const transactionsColumns = useMemo(
    () => [
      {
        key: "user_name",
        title: "User",
        render: (row: any) => resolveUserName(row),
      },
      { key: "type", title: "Type" },
      { key: "direction", title: "Direction" },
      { key: "amount", title: "Amount", align: "right" as const },
      {
        key: "status",
        title: "Status",
        render: (row: any) => (
          <Badge variant="blue">{row?.status ?? "-"}</Badge>
        ),
      },
      {
        key: "createdAt",
        title: "Created",
        render: (row: any) =>
          row?.createdAt ? new Date(row.createdAt).toLocaleString() : "-",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userNameById],
  );

  const gameRequestsColumns = useMemo(
    () => [
      {
        key: "user_name",
        title: "User",
        render: (row: any) => resolveUserName(row),
      },
      {
        key: "game_name",
        title: "Game",
        render: (row: any) => row?.game?.name || row?.game_name || "-",
      },
      {
        key: "createdAt",
        title: "Created",
        render: (row: any) =>
          row?.createdAt ? new Date(row.createdAt).toLocaleString() : "-",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userNameById],
  );

  if (isLoading) {
    return (
      <div className="p-10 text-white flex items-center justify-center h-full">
        <Spinner className="size-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardInsightsCards data={data} />
      <GlobalAreaChart
        data={data}
        range={String(query.range)}
        onRangeChange={(next) => setQuery((p) => ({ ...p, range: next }))}
        title="Global Activity"
      />
      <div className="w-full grid grid-cols-2 gap-5">
        {/* USERS */}
        <GlobalDataTable
          title="Users"
          columns={usersColumns as any}
          data={users}
          enableAdd={false}
          showActions={false}
          actions={[]}
          viewAllLabel="View Users"
          viewAllHref={`/users/a/${id}`}
          showViewAll
        />
        {/* DEPOSITS */}
        <GlobalDataTable
          title="Deposits"
          columns={depositsColumns as any}
          data={deposits}
          enableAdd={false}
          showActions={false}
          actions={[]}
          viewAllLabel="View Deposits"
          viewAllHref={`/deposits/a/${id}`}
          showViewAll
        />
        {/* WITHDRAWS */}
        <GlobalDataTable
          title="Withdraws"
          columns={withdrawsColumns as any}
          data={withdraws}
          enableAdd={false}
          showActions={false}
          actions={[]}
          viewAllHref={`/redeems/a/${id}`}
          viewAllLabel="View Redeems"
          showViewAll
        />
        {/* GAME REQUESTS */}
        <GlobalDataTable
          title="Game Requests"
          columns={gameRequestsColumns as any}
          data={gameRequests}
          enableAdd={false}
          showActions={false}
          actions={[]}
          viewAllHref={`/game-requests/a/${id}`}
          viewAllLabel="View Game Requests"
          showViewAll
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
