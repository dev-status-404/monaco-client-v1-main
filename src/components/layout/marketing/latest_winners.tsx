"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";
import { cn } from "@/lib/utils";

// ✅ Replace with your real images
import WIN_1 from "../../../../public/assets/SVGs/pearl.svg";
import WIN_2 from "../../../../public/assets/SVGs/pearl.svg";
import WIN_3 from "../../../../public/assets/SVGs/pearl.svg";

type WinnerItem = {
  id: string;
  title: string;
  image: StaticImageData;
  coins: number; // left value (1,188)
  sc: number; // green value (5.9)
  timeAgo: string; // "2h"
};

const winners: WinnerItem[] = [
  { id: "ultrapanda", title: "UltraPanda Bonus", image: WIN_1, coins: 1188, sc: 5.9, timeAgo: "2h" },
  { id: "golden-dragon", title: "Golden Dragon", image: WIN_2, coins: 1188, sc: 0, timeAgo: "2h" },
  { id: "magic-city", title: "Magic City", image: WIN_3, coins: 1188, sc: 0, timeAgo: "2h" },
];

export default function LatestWinners() {
  return (
    <section className="w-full py-10">
      <div className="mx-auto w-full max-w-7xl px-4">
        <h3 className="text-xl font-extrabold tracking-tight text-white">
          LATEST WINNERS
        </h3>

        {/* horizontal scroll like screenshot */}
        <div className="mt-6 -mx-4 px-4">
          <div className="flex gap-6 overflow-x-auto pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {winners.map((w) => (
              <WinnerCard key={w.id} item={w} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WinnerCard({ item }: { item: WinnerItem }) {
  return (
    <div
      className={cn(
        "relative shrink-0 w-[400px]",
        "rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600",
        "shadow-[0_22px_55px_rgba(0,0,0,0.45)]"
      )}
    >
      <div className="p-4">
        {/* image area */}
        <div className="relative overflow-hidden rounded-xl bg-black/25">
          <div className="relative aspect-square w-full">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              priority={false}
              sizes="270px"
            />
          </div>
        </div>

        {/* title */}
        <p className="mt-3 text-center text-sm font-semibold text-white/90">
          {item.title}
        </p>

        {/* bottom row */}
        <div className="mt-6 flex items-center justify-between">
          {/* coins */}
          <div className="flex items-center gap-2">
            <CoinIcon className="h-5 w-5 text-white/95" />
            <span className="text-lg font-extrabold text-white">
              {formatNumber(item.coins)}
            </span>
          </div>

          {/* SC */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold text-emerald-900/90">
              {item.sc ? item.sc.toFixed(1) : "—"}
            </span>
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-black">
              sc
            </span>
          </div>
        </div>

        {/* time */}
        <div className="mt-4 flex justify-end">
          <span className="text-xs font-semibold text-white/70">{item.timeAgo}</span>
        </div>
      </div>
    </div>
  );
}

function formatNumber(n: number) {
  // 1188 -> 1,188
  return new Intl.NumberFormat("en-US").format(n);
}

function CoinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3c4.97 0 9 2.24 9 5s-4.03 5-9 5-9-2.24-9-5 4.03-5 9-5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 8v4c0 2.76 4.03 5 9 5s9-2.24 9-5V8"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 12v4c0 2.76 4.03 5 9 5s9-2.24 9-5v-4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}
