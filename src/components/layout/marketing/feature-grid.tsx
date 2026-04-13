"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type GameItem = {
  id: string;
  title: string;
  image: string;
  isNew?: boolean;
  isHot?: boolean;
  ribbon?: string;
  href?: string;
};

const games: GameItem[] = [
  {
    id: "king-of-pop",
    title: "King of Pop",
    image: "https://ik.imagekit.io/kowkpgj32/games/nofpop.webp?updatedAt=1770682003571",
    isNew: true,
    isHot: true,
    href: "https://www.slots88888.com/",
  },
  {
    id: "pandamaster",
    title: "Pandamaster",
    image: "https://ik.imagekit.io/kowkpgj32/games/panda%20master.webp",
    isNew: true,
    isHot: true,
    href: "https://pandamaster.vip:8888/",
  },
  {
    id: "tai-chi-master",
    title: "Tai Chi Master",
    image: "https://ik.imagekit.io/kowkpgj32/games/splash%20master.jpg?updatedAt=1770682001744",
    isNew: true,
    isHot: true,
    href: "http://okay.jkgame.vip/web_game/taichimaster_pc/",
  },
  {
    id: "orionstar",
    title: "Orionstar",
    image: "https://ik.imagekit.io/kowkpgj32/games/star.webp",
    isNew: true,
    isHot: true,
    href: "http://start.orionstars.vip:8580/",
  },
  {
    id: "egames",
    title: "Egames",
    image: "https://ik.imagekit.io/rvrrhkzxq/Untitled%20design%20(17).png",
    isNew: true,
    isHot: true,
    href: "https://play.egames.com/",
  },
  {
    id: "fortune-2-go",
    title: "Fortune 2 GO",
    image: "https://ik.imagekit.io/kowkpgj32/games/fortuen.png?updatedAt=1770682003696",
    isNew: true,
    isHot: true,
    href: "https://www.fortune2go20.com/",
  },
  {
    id: "juwa-v2",
    title: "Juwa Version 2",
    image: "https://ik.imagekit.io/kowkpgj32/games/bg.jpg",
    isNew: true,
    isHot: true,
    href: "https://m.juwa2.com",
  },
  {
    id: "golden-dragon",
    title: "Golden Dragon",
    image: "https://ik.imagekit.io/kowkpgj32/games/goden.png?updatedAt=1770682005809",
    isNew: true,
    isHot: true,
    href: "https://goldendragoncity.com/SSLobby/m5682.2/web-mobile/index.html?",
  },
  {
    id: "riversweeps",
    title: "RiverSweeps",
    image: "https://ik.imagekit.io/rvrrhkzxq/hqdefault.jpg",
    isNew: true,
    isHot: true,
    href: "https://river777.com/",
  },
  {
    id: "big-daddy-dragon",
    title: "Big Daddy Dragon",
    image: "https://ik.imagekit.io/kowkpgj32/games/big%20dady.png?updatedAt=1770682001752",
    isNew: true,
    isHot: true,
    href: "https://www.playbdd.com/",
  },
  {
    id: "vblink",
    title: "Vblink",
    image: "https://ik.imagekit.io/kowkpgj32/games/cropped.jpg",
    isNew: true,
    isHot: true,
    href: "https://www.vblink777.club/",
  },
  {
    id: "ultrapanda",
    title: "Ultrapanda",
    image: "https://ik.imagekit.io/kowkpgj32/games/1_Lcjd7YYZJhQvEVoI0Jctsg.png",
    isNew: true,
    isHot: true,
    href: "https://www.ultrapanda.mobi/",
  },
  {
    id: "new-game-vault",
    title: "New Game Vault",
    image: "https://ik.imagekit.io/kowkpgj32/games/background.jpg",
    isNew: true,
    isHot: true,
    href: "https://www.gamevault77777.com",
  },
  {
    id: "vegassweep",
    title: "Vegassweep",
    image: "https://ik.imagekit.io/kowkpgj32/games/0x0.png",
    isNew: true,
    isHot: true,
    href: "https://m.lasvegassweeps.com/",
  },
  {
    id: "nova-play",
    title: "Nova Play",
    image: "https://ik.imagekit.io/kowkpgj32/games/novap.png?updatedAt=1770682005184",
    isNew: true,
    isHot: true,
    href: "https://novaplay.cc/",
  },
  {
    id: "firekirin",
    title: "Firekirin",
    image: "https://ik.imagekit.io/kowkpgj32/games/Fire-Kirin-PNG-Logo-transparent.png",
    isNew: true,
    isHot: true,
    href: "https://firekirin.com/download-fire-kirin-app.html",
  },
  {
    id: "gamevault",
    title: "Gamevault",
    image: "https://ik.imagekit.io/kowkpgj32/games/NIm6-IBB_400x400.png",
    isNew: true,
    isHot: true,
    href: "https://download.gamevault999.com/",
  },
  {
    id: "lucky-ox",
    title: "Lucky OX",
    image: "https://ik.imagekit.io/kowkpgj32/games/kuckyox.png?updatedAt=1770682005209",
    isNew: true,
    isHot: true,
    href: "https://ik.imagekit.io/kowkpgj32/games/kuckyox.png?updatedAt=1770682005209",
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
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
        target: "_blank",
        rel: "noopener noreferrer",
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
