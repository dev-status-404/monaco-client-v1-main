"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionTitle from "@/components/layout/marketing/site-title";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import VBLINK from "../../../../public/assets/SVGs/vblink.svg";
import FIRE_KIRIN from "../../../../public/assets/SVGs/fire_kirin.svg";
import ULTRA_PANDA from "../../../../public/assets/SVGs/ultra_panda.svg";
import FORTUNE_KINGS from "../../../../public/assets/SVGs/fortune_kings.svg";

type Game = {
  name: string;
  src: string;
  alt?: string;
};

const games: Game[] = [
  { name: "VBlink", src: VBLINK },
  { name: "Fire Kirin", src: FIRE_KIRIN },
  { name: "Ultra Panda", src: ULTRA_PANDA },
  { name: "Fortune Kings", src: FORTUNE_KINGS },
];

export default function GameStrip() {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.6);
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section>
      {/* If you only want the logos like screenshot, delete this title block */}
      <div className="mb-6">
        <SectionTitle
          title="Top Games"
          subtitle="Trending picks players love"
        />
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border",
          "bg-card/60 backdrop-blur-xl",
          "shadow-[0_0_0_1px_rgba(0,0,0,0.03)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
        )}
      >
        {/* soft background glow like screenshot */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.20),transparent_45%),radial-gradient(circle_at_85%_30%,rgba(168,85,247,0.20),transparent_45%),radial-gradient(circle_at_55%_70%,rgba(245,158,11,0.18),transparent_55%)] dark:opacity-90 opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/20 dark:to-black/45" />

        {/* arrows */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => scrollBy("left")}
          className={cn(
            "absolute left-3 top-1/2 z-10 -translate-y-1/2",
            "h-11 w-11 rounded-full",
            "bg-background/40 hover:bg-background/60 border border-border backdrop-blur",
            "text-foreground"
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => scrollBy("right")}
          className={cn(
            "absolute right-3 top-1/2 z-10 -translate-y-1/2",
            "h-11 w-11 rounded-full",
            "bg-background/40 hover:bg-background/60 border border-border backdrop-blur",
            "text-foreground"
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* strip */}
        <div
          ref={scrollerRef}
          className={cn(
            "relative flex w-full items-center gap-10 px-16 py-10",
            "overflow-x-auto scroll-smooth",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          )}
        >
          {games.map((g) => (
            <div
              key={g.name}
              className={cn(
                "flex-shrink-0",
                // 4 visible on desktop like screenshot, fewer on mobile
                "w-[220px] sm:w-[260px] md:w-[280px] lg:w-[300px]"
              )}
            >
              <div className="relative mx-auto h-[230px] w-full">
                <Image
                  src={g.src}
                  alt={g.alt ?? g.name}
                  fill
                  priority={false}
                  className="object-cover drop-shadow-[0_25px_35px_rgba(0,0,0,0.45)]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional heading shown in screenshot under the strip */}
      <div className="mt-10 text-center">
        <h3 className="text-3xl font-semibold tracking-tight">
          Why Players{" "}
          <span className="text-amber-400 dark:text-amber-300">Choose Us</span>
        </h3>
      </div>
    </section>
  );
}
