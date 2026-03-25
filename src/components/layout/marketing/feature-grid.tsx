"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";
import { cn } from "@/lib/utils";

/**
 * ✅ DROP-IN SECTION
 * - Matches the screenshot layout (title/subtitle + "NEW FREE-TO-PLAY GAMES" + 3x2 grid look)
 * - Badges: New / Hot (top-left)
 * - Ribbon: BUY-BONUS & FAST-PLAY (top-right optional)
 * - Hover: zoom + dark overlay + play button
 *
 * Replace the imports below with your real game images.
 */

// ✅ Replace with your real images in /public/assets/games/
import Game1 from "../../../../public/assets/SVGs/luke/caishen.svg";
import Game2 from "../../../../public/assets/SVGs/luke/chatur.svg";
import Game3 from "../../../../public/assets/SVGs/luke/pearl.svg";
import Game4 from "../../../../public/assets/SVGs/luke/china.svg";
import Game5 from "../../../../public/assets/SVGs/luke/bagua.svg";
import Game6 from "../../../../public/assets/SVGs/luke/jack.svg";

type GameItem = {
  id: string;
  title: string;
  image: StaticImageData;
  isNew?: boolean;
  isHot?: boolean;
  ribbon?: string;
  href?: string;
};

const games: GameItem[] = [
  {
    id: "bagua",
    title: "Bagua",
    image: Game1,
    isNew: true,
    isHot: true,
    ribbon: "BUY-BONUS & FAST-PLAY",
    href: "/games/bagua",
  },
  {
    id: "blackjack",
    title: "BlackJack",
    image: Game2,
    isNew: true,
    isHot: true,
    href: "/games/blackjack",
  },
  {
    id: "burning-pearl",
    title: "Burning Pearl",
    image: Game3,
    isNew: true,
    isHot: true,
    ribbon: "BUY-BONUS & FAST-PLAY",
    href: "/games/burning-pearl",
  },
  {
    id: "cashen-riches",
    title: "Cashen Riches",
    image: Game4,
    isNew: true,
    isHot: true,
    href: "/games/cashen-riches",
  },
  {
    id: "cash-hunter",
    title: "Cash Hunter",
    image: Game5,
    isNew: true,
    isHot: true,
    ribbon: "BUY-BONUS & FAST-PLAY",
    href: "/games/cash-hunter",
  },
  {
    id: "china",
    title: "China",
    image: Game6,
    isNew: true,
    isHot: true,
    ribbon: "BUY-BONUS & FAST-PLAY",
    href: "/games/china",
  },
];

export default function CasinoGamesSection() {
  return (
    <section className="w-full">
      {/* Background like screenshot (dark/green) */}
      <div className="rounded-3xl px-5 py-14 md:px-10">
        {/* Header */}
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold tracking-wide text-white/70 md:text-base">
            Win with Monaco on over 2,000 exciting
          </p>

          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-6xl">
            Hot-List Casino Games
          </h2>
        </div>

        {/* Sub heading */}
        <div className="mx-auto mt-12 max-w-6xl">
          <h3 className="text-xl font-extrabold tracking-tight text-white md:text-2xl">
            NEW FREE-TO-PLAY GAMES
          </h3>

          {/* Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
            {games.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function GameCard({ game }: { game: GameItem }) {
  const Comp: any = game.href ? "a" : "div";
  const compProps = game.href
    ? {
        href: game.href,
        "aria-label": `Open ${game.title}`,
      }
    : {};

  return (
    <Comp
      {...compProps}
      className={cn(
        "group relative block overflow-hidden rounded-2xl",
      )}
    >
      {/* Image area */}
      <div className="relative aspect-square w-full">
        <Image
          src={game.image}
          alt={game.title}
          fill
          className="object-cover"
          priority={false}
        />

        {/* Dark overlay (stronger on hover like screenshot) */}
        <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/35" />

        {/* Center play icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <div
            className={cn(
              "grid h-14 w-14 place-items-center rounded-full",
              "bg-white/90 text-black",
              "shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
            )}
          >
            <PlayIcon />
          </div>
        </div>
      </div>

      {/* Top-left tags */}
      <div className="absolute left-2 top-2 z-10 flex gap-1">
        {game.isNew && <Tag className="bg-emerald-500">New</Tag>}
        {game.isHot && <Tag className="bg-amber-500">Hot</Tag>}
      </div>

      {/* Top-right ribbon */}
      {game.ribbon ? (
        <div
          className={cn(
            "absolute right-0 top-0 z-10",
            "rounded-bl-xl bg-emerald-500 px-3 py-1",
            "text-[10px] font-extrabold tracking-wide text-black"
          )}
        >
          {game.ribbon}
        </div>
      ) : null}
    </Comp>
  );
}

function Tag({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-xs font-extrabold text-black",
        className
      )}
    >
      {children}
    </span>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 7l10 5-10 5V7z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
