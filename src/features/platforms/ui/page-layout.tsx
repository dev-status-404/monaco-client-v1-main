"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";

import { useGames } from "@/hooks/games";
import { useGameCreds } from "@/hooks/game-creds";
import { useGameRequests, useGameRequestsActions } from "@/hooks/game-requests";

import { useUserInfo } from "@/helpers/use-user";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Play, Search } from "lucide-react";
import SectionTitle from "@/components/common/section-title";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

type GameRow = {
  id: string;
  name: string;
  status: string;
  createdAt?: string;
  image_url?: string;
  url?: string;
  provider?: string;
  slug?: string;
};

type CredRow = {
  id: string;
  game_id: string;
  user_id?: string;
  username?: string;
  assigned_to_user_id?: string;
  login_password_enc?: string;
  note?: string;
  status: string;
  login_username?: string;
  createdAt?: string;
};

type RequestRow = {
  id: string | number;
  game_id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  note?: string;
  createdAt?: string;
};
const pickArray = (v: any): any[] => {
  if (Array.isArray(v)) return v;

  // common API patterns
  const candidates = [
    v?.data?.items,
    v?.data?.rows,
    v?.data?.data,
    v?.data,
    v?.items,
    v?.rows,
    v?.result,
    v?.results,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }

  return [];
};

const PlatformLayout = () => {
  const queryClient = useQueryClient();
  const { id: userId } = useUserInfo();

  const [params, setParams] = useState({ page: 1, limit: 40 });
  const [q, setQ] = useState("");

  // request modal state
  const [requestOpen, setRequestOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameRow | null>(null);
  const [requestNote, setRequestNote] = useState("");

  const { data: gamesData, isLoading: gamesLoading } = useGames(params);

  // ✅ fetch creds + requests for this user
  const { data: credsData, isLoading: credsLoading } = useGameCreds({
    page: 1,
    limit: 200,
    user_id: userId,
  });

  const { data: reqData, isLoading: reqLoading } = useGameRequests({
    page: 1,
    limit: 200,
    user_id: userId,
  });
  const router = useRouter();
  const { createRequest } = useGameRequestsActions();

  const games: GameRow[] = useMemo(() => {
    const raw =
      (gamesData as any)?.data ??
      (gamesData as any)?.data?.rows ??
      (gamesData as any)?.rows ??
      [];
    return (raw as any[]).map((g) => ({
      id: g.id ?? g._id,
      name: g.name ?? g.title ?? "Untitled",
      status: g.status ?? "inactive",
      createdAt: g.createdAt,
      image_url: g.image_url ?? g.cover ?? g.thumbnail,
      url: g.url ?? `/play/${g.slug ?? g.id}`,
      provider: g.provider,
      slug: g.slug,
    }));
  }, [gamesData]);

  const creds: any[] = useMemo(() => {
    const raw =
      (credsData as any)?.data?.data?.credentials ??
      (credsData as any)?.credentials ??
      [];

    return raw.map((c: any) => ({
      id: c.id,
      game_id: c.game_id,
      assigned_to_user_id: c.assigned_to_user_id,
      login_username: c.login_username,
      login_password_enc: c.login_password_enc,
      status: c.status,
      note: c.note,
    }));
  }, [credsData]);
  const requests: RequestRow[] = useMemo(() => {
    const raw = pickArray(reqData);

    return raw.map((r: any) => ({
      id: r.id ?? r._id,
      game_id: r.game_id ?? r.game?.id ?? r.gameId,
      user_id: r.user_id ?? r.user?.id ?? r.userId,
      status: (String(r.status ?? "pending").toLowerCase() as any) ?? "pending",
      note: r.note,
      createdAt: r.createdAt,
    }));
  }, [reqData]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return games;
    return games.filter((g) => g.name.toLowerCase().includes(term));
  }, [games, q]);

  const credsForGame = (gameId: string) => {
    const approved = approvedRequestForGame(gameId);
    if (!approved) return undefined;

    return creds.find(
      (c: any) =>
        c.game_id === gameId &&
        c.assigned_to_user_id === userId &&
        c.login_username &&
        c.login_password_enc &&
        c.status === "assigned",
    );
  };

  const requestForGame = (gameId: string) =>
    requests.find((r) => r.game_id === gameId && r.user_id === userId);

  const approvedRequestForGame = (gameId: string) =>
    requests.find(
      (r) =>
        r.game_id === gameId && r.user_id === userId && r.status === "approved",
    );

  const onPlay = (game: GameRow) => {
    const c = credsForGame(game.id);
    // ✅ if creds exist, play directly
    if (c) {
      setSelectedGame({
        ...game,
        url: game.url ?? `/play/${game.slug ?? game.id}`,
      });
      setRequestOpen(true);
      return;
    }

    // ❌ no creds => open request modal
    setSelectedGame(game);
    setRequestNote("");
    setRequestOpen(true);
  };

  const createGameRequest = async () => {
    if (!selectedGame) return;
    if (!userId) return alert("User id missing");

    try {
      await createRequest(
        {
          game_id: selectedGame.id,
          user_id: userId,
          note: requestNote.trim() ? requestNote.trim() : undefined,
        },
        {
          onSuccess: () => {
            // show pending state
            setRequestOpen(false);
          },
        },
      );

      // refresh requests list
      queryClient.invalidateQueries({ queryKey: ["game_requests"] });
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create request",
      );
    }
  };

  const isLoading = gamesLoading || credsLoading || reqLoading;

  const modalState = useMemo(() => {
    if (!selectedGame || !userId) return { kind: "none" };

    const c = credsForGame(selectedGame.id);

    if (c) return { kind: "approved_with_creds", creds: c };

    const r = requestForGame(selectedGame.id);
    if (!r) return { kind: "no_request" };
    if (r.status === "pending") return { kind: "pending", request: r };
    if (r.status === "rejected") return { kind: "rejected", request: r };
    if (r.status === "approved") return { kind: "approved", request: r };
    return { kind: "approved_wait_creds", request: r };
  }, [selectedGame, creds, requests, userId]);

  if (isLoading) {
    return (
      <div className="p-10 h-full text-slate-900 dark:text-white flex items-center justify-center">
        <Spinner className="size-12" />
      </div>
    );
  }

  return (
    <div className="page-shell mt-10 space-y-6">
      <SectionTitle title="Platforms" />

      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-white/40" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search games..."
            className="h-11 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/10 pl-10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/70">
          <span className="rounded-2xl bg-slate-100 dark:bg-white/10 px-3 py-2 text-slate-900 dark:text-white">
            Showing <span className="font-semibold">{filtered.length}</span>
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((game, index) => {
          const cardVariant = [
            "gradient-card-a",
            "gradient-card-b",
            "gradient-card-c",
            "gradient-card-d",
            "gradient-card-e",
          ][index % 5];
          const c = credsForGame(game.id);
          const r = requestForGame(game.id);
          const badgeText = c
            ? "Access"
            : r?.status === "pending"
              ? "Requested"
              : r?.status === "rejected"
                ? "Rejected"
                : r?.status === "approved"
                  ? "Approved"
                  : "No Access";

          const badgeVariant = c
            ? "default"
            : r?.status === "pending"
              ? "secondary"
              : "destructive";

          return (
            <div
              key={game.id}
              className={`group overflow-hidden rounded-2xl ${cardVariant} shadow-sm backdrop-blur`}
            >
              <div className="relative h-40 w-full bg-black/10">
                {game.image_url ? (
                  <Image
                    src={game.image_url}
                    alt={game.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-500 dark:text-white/60">
                    No cover
                  </div>
                )}

                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <Badge
                    variant={game.status === "active" ? "default" : "secondary"}
                    className="rounded-xl"
                  >
                    {game.status}
                  </Badge>

                  <Badge variant={badgeVariant as any} className="rounded-xl">
                    {badgeText}
                  </Badge>

                  {game.provider ? (
                    <Badge
                      variant="secondary"
                      className="rounded-xl bg-white/25 text-white"
                    >
                      {game.provider}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div className="p-4">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-white">
                    {game.name}
                  </h3>
                  <p className="mt-1 text-xs text-white/80">
                    {game.createdAt
                      ? `Added ${new Date(game.createdAt).toLocaleDateString()}`
                      : "—"}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    onClick={() => onPlay(game)}
                    className={
                      c
                        ? " bg-green-500 text-white hover:bg-green-600"
                        : " bg-red-500 text-white hover:bg-red-600"
                    }
                  >
                    <Play className="mr-2 h-4 w-4 " />
                    {c ? "Play Game" : "Request Access"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {/* <div className="flex items-center justify-between pt-2">
        <Button
          variant="secondary"
          className="rounded-2xl"
          disabled={params.page <= 1}
          onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}
        >
          Prev
        </Button>

        <div className="text-sm text-slate-600 dark:text-white/70">
          Page{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {params.page}
          </span>
        </div>

        <Button
          variant="secondary"
          className="rounded-2xl"
          onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
        >
          Next
        </Button>
      </div> */}

      {/* Request / State Modal */}
      <Dialog
        open={requestOpen}
        onOpenChange={(v) => {
          setRequestOpen(v);
          if (!v) setSelectedGame(null);
        }}
      >
        <DialogContent className="border-white/10 bg-[#0f0f0f] text-white">
          <DialogHeader>
            <DialogTitle>
              {selectedGame ? `Game: ${selectedGame.name}` : "Game"}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {modalState.kind === "no_request"
                ? "You don’t have access. Create a request to play."
                : modalState.kind === "pending"
                  ? "Your request is pending approval."
                  : modalState.kind === "rejected"
                    ? "Your request was rejected. You can request again."
                    : modalState.kind === "approved_wait_creds"
                      ? "Approved ✅ Waiting for admin to add credentials."
                      : "—"}
            </DialogDescription>
          </DialogHeader>

          {modalState.kind === "no_request" ||
          modalState.kind === "rejected" ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className=" dark:text-white/80">
                  Note (optional)
                </Label>
                <Input
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  placeholder="Tell admin why you need access..."
                  className="h-11 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={() => setRequestOpen(false)}
                >
                  Close
                </Button>

                <Button className="rounded-2xl" onClick={createGameRequest}>
                  Request Access
                </Button>
              </DialogFooter>
            </div>
          ) : null}

          {modalState.kind === "pending" ? (
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-white/60">
                    Status
                  </span>
                  <Badge variant="secondary">pending</Badge>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-slate-600 dark:text-white/60">
                    Created
                  </span>
                  <span className="text-slate-900 dark:text-white/90"></span>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={() => setRequestOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : null}

          {modalState.kind === "approved_with_creds" && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="dark:text-white">
                    Username
                  </span>
                  <span className="font-mono dark:text-white">
                    {modalState.creds.login_username}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className=" dark:text-white">
                    Password
                  </span>
                  <span className="font-mono  dark:text-white">
                    {modalState.creds.login_password_enc}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() =>
                    selectedGame.url && router.push(selectedGame.url)
                  }
                >
                  <Play className="mr-2 h-4 w-4" /> Play
                </Button>
              </DialogFooter>
            </>
          )}

          {modalState.kind === "approved_wait_creds" ? (
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-white/60">
                    Status
                  </span>
                  <Badge variant="default">approved</Badge>
                  <div className="text-slate-900 dark:text-white/90">
                    Login: {modalState.creds.username}
                  </div>
                  <div className="text-slate-900 dark:text-white/90">
                    Login: {modalState.creds.login_password_enc}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={() => setRequestOpen(false)}
                >
                  Close
                </Button>

                <Button
                  className="rounded-2xl"
                  onClick={() => {
                    // force refresh to see if creds got added
                    queryClient.invalidateQueries({ queryKey: ["game_creds"] });
                    queryClient.invalidateQueries({
                      queryKey: ["game_requests"],
                    });
                  }}
                >
                  Refresh
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformLayout;
