"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ✅ Replace with your real assets
import LEPRECHAUN from "../../../../public/assets/SVGs/luke/hat.png"; // character on right
import GAME_1 from "../../../../public/assets/SVGs/luke/card_1.svg";
import GAME_2 from "../../../../public/assets/SVGs/luke/card_02.svg";

type TopGame = {
  id: string;
  title: string;
  image: StaticImageData;
  href?: string;
};

const topWeekGames: TopGame[] = [
  { id: "golden-dragon", title: "Golden Dragon", image: GAME_1, href: "/games/golden-dragon" },
  { id: "magic-city", title: "Magic City", image: GAME_2, href: "/games/magic-city" },
];

export default function TopOfWeekCta() {
  return (
    <section className="relative w-full py-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl px-4">
        <Card
          className={cn(
            "relative overflow-hidden rounded-3xl border border-white/5",
            "bg-[#041510] shadow-[0_18px_55px_rgba(0,0,0,0.55)]"
          )}
        >
          {/* glow + vignette */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.22),transparent_55%),radial-gradient(circle_at_70%_25%,rgba(245,158,11,0.16),transparent_55%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.05),transparent_60%)] opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/45" />
          </div>

          <CardContent className="relative p-5 sm:p-8 lg:p-10">
            {/* ======================
                TOP BANNER
            ====================== */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_320px] lg:items-center">
                {/* left text */}
                <div>
                  <h3 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    Early- Bird Discounts
                  </h3>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                      href="/games"
                      className={cn(
                        "inline-flex h-12 items-center justify-center rounded-xl px-6",
                        "bg-gradient-to-b from-emerald-500 to-emerald-700",
                        "text-sm font-extrabold tracking-wide text-white",
                        "shadow-[0_18px_40px_rgba(0,0,0,0.45)]",
                        "hover:brightness-110 transition"
                      )}
                    >
                      Start playing for free
                    </Link>
                  </div>
                </div>

                {/* right character + button */}
                <div className="relative mx-auto w-full max-w-[320px]">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={LEPRECHAUN}
                      alt="Lucky Luke character"
                      fill
                      className="object-contain drop-shadow-[0_35px_50px_rgba(0,0,0,0.55)]"
                      priority={false}
                      sizes="(max-width: 1024px) 60vw, 320px"
                    />
                  </div>

                  <Link
                    href="/games"
                    className={cn(
                      "absolute bottom-2 right-2",
                      "inline-flex h-11 items-center justify-center rounded-full px-6",
                      "bg-gradient-to-b from-emerald-400 to-emerald-700",
                      "text-sm font-extrabold tracking-wide text-white",
                      "shadow-[0_18px_40px_rgba(0,0,0,0.45)]",
                      "hover:brightness-110 transition"
                    )}
                  >
                    Play Now
                  </Link>
                </div>
              </div>
            </div>

            {/* ======================
                TOP OF THE WEEK
            ====================== */}
            <div className="mt-8">
              <h4 className="text-lg font-extrabold tracking-tight text-white">
                TOP OF THE WEEK
              </h4>

              <div className="mt-5 grid grid-cols-2 gap-4">
                {topWeekGames.map((g, i) => (
                  <TopWeekCard key={g.id} game={g} bigNumber={i + 1} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/* =========================
   Components
========================= */

function NavItem({
  label,
  icon,
  active,
}: {
  label: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2",
        active ? "bg-white/5" : "hover:bg-white/5 transition"
      )}
    >
      <span className="text-lg">{icon}</span>
      <span className={cn("text-xs font-semibold", active ? "text-white" : "text-white/70")}>
        {label}
      </span>
    </button>
  );
}

function TopWeekCard({ game, bigNumber }: { game: TopGame; bigNumber: number }) {
  const Comp: any = game.href ? Link : "div";
  const props = game.href ? { href: game.href } : {};

  return (
    <Comp
      {...props}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-amber-400/25 bg-black/20",
        "shadow-[0_20px_55px_rgba(0,0,0,0.55)]",
        "transition hover:scale-[1.02]"
      )}
    >
      {/* big number behind */}
      <div
        className={cn(
          "pointer-events-none absolute -left-6 -top-10 select-none",
          "text-[180px] font-extrabold leading-none",
          "text-amber-400/20"
        )}
      >
        {bigNumber}
      </div>

      {/* image */}
      <div className="relative aspect-[4/5] w-full">
        <Image src={game.image} alt={game.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/15 transition group-hover:bg-black/30" />

        {/* play badge */}
        <div className="absolute left-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-white/90 text-black shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
          <PlayIcon />
        </div>
      </div>

      {/* bottom title strip */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3">
        <p className="text-sm font-extrabold text-white">{game.title}</p>
      </div>
    </Comp>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
