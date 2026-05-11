"use client";

import React, { useMemo, useState } from "react";
import { useGames } from "@/hooks/games"; // adjust if needed
import { Spinner } from "@/components/ui/spinner";

export type GameOption = { id: string; name: string };

type GamesSelectProps = {
  value?: string; // selected game_id
  onChange: (game: GameOption | null) => void;

  placeholder?: string;
  disabled?: boolean;
  className?: string;

  limit?: number;
  /** If provided, these games are used directly and the internal fetch is skipped. */
  games?: GameOption[];
};

const GamesSelect: React.FC<GamesSelectProps> = ({
  value,
  onChange,
  placeholder = "Select platform",
  disabled,
  className = "",
  limit = 100,
  games: gamesProp,
}) => {
  const [query] = useState({ page: 1, limit });

  // Only fetch from the API when no external list is provided
  const { data, isLoading } = useGames(gamesProp ? null : (query as any));

  const games: GameOption[] = useMemo(() => {
    // If caller passed an explicit list, use it directly
    if (gamesProp) return gamesProp;

    const arr =
      (Array.isArray((data as any)?.data?.games) && (data as any).data.games) ||
      (Array.isArray((data as any)?.data?.items) && (data as any).data.items) ||
      (Array.isArray((data as any)?.data) && (data as any).data) ||
      (Array.isArray(data as any) && (data as any)) ||
      [];

    return arr
      .map((g: any) => ({
        id: g.id ?? g._id,
        name: g.name ?? g.title ?? "Unnamed platform",
      }))
      .filter((g: GameOption) => Boolean(g.id));
  }, [data, gamesProp]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <select
          value={value ?? ""}
          disabled={disabled || isLoading}
          onChange={(e) => {
            const id = e.target.value;

            if (!id) {
              onChange(null);
              return;
            }

            const selected = games.find((x) => x.id === id) ?? null;
            onChange(selected);
          }}
          className="h-10 w-full rounded-2xl border rounded-md dark:border-white/10 px-3 pr-10 dark:text-white outline-none disabled:opacity-60"
        >
          <option value="" className="!bg-card" >
            {isLoading ? "Loading platforms..." : placeholder}
          </option>

          {games.map((g) => (
            <option key={g.id} value={g.id} className="!bg-card">
              {g.name}
            </option>
          ))}
        </select>

        {isLoading ? (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner className="size-4" />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GamesSelect;