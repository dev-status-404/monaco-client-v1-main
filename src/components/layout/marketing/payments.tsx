"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import CASION_DEPOSIT from "../../../../public/assets/SVGs/casino.svg";
import REDEEM from "../../../../public/assets/SVGs/redeem.svg";

const payments = [
  {
    key: "deposit",
    title: "Gold Coins (GC)",
    desc: "Play for fun, explore\nnew games, and\nkeep the excitement\ngoing.",
    coin: "G",
    coinRing: "from-amber-300 to-amber-500",
    titleColor: "text-amber-400",
    glow: "bg-[radial-gradient(circle_at_15%_25%,rgba(245,158,11,0.35),transparent_55%),radial-gradient(circle_at_65%_55%,rgba(255,255,255,0.05),transparent_60%)]",
    image: CASION_DEPOSIT,
  },
  {
    key: "redeem",
    title: "Points (Pts)",
    desc: "Play for real cash\nprizes — redeem to\nyour Debit Card,\nBank, or Gift Cards.",
    coin: "S",
    coinRing: "from-emerald-400 to-emerald-600",
    titleColor: "text-emerald-400",
    glow: "bg-[radial-gradient(circle_at_85%_25%,rgba(16,185,129,0.35),transparent_55%),radial-gradient(circle_at_35%_60%,rgba(255,255,255,0.05),transparent_60%)]",
    image: REDEEM,
  },
];

export default function Payments() {
  return (
    <section className="relative w-full py-10">
      {/* ✅ 2 cards side-by-side on md+, stacked on mobile */}
      <div className="mx-auto grid  gap-6 px-4 md:grid-cols-2 md:gap-8">
        {payments.map((p) => (
          <Card
            key={p.key}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-white/5",
              "bg-[#0b1220] shadow-[0_18px_55px_rgba(0,0,0,0.45)]"
            )}
          >
            {/* inner glow (same vibe as screenshot) */}
            <div className={cn("pointer-events-none absolute inset-0", p.glow)} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/25" />

            {/* ✅ big coin top-left like screenshot */}
            <div className="absolute -left-6 -top-7 z-10">
              <div
                className={cn(
                  "grid h-28 w-28 place-items-center rounded-full bg-gradient-to-b",
                  p.coinRing,
                  "shadow-[0_30px_60px_rgba(0,0,0,0.35)]"
                )}
              >
                <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-white/90 text-5xl font-black text-black shadow-inner">
                  {p.coin}
                </div>
              </div>
            </div>

            {/* ✅ exact layout:
                - desktop: text left, bunny right
                - mobile: keep bunny inside card, below/right aligned
            */}
            <CardContent className="relative p-6 md:p-10">
              <div className="grid gap-6 md:grid-cols-[1fr_1.05fr] md:items-center">
                {/* LEFT TEXT */}
                <div className="pt-10 md:pt-12">
                  <h3 className={cn("text-2xl md:text-3xl font-extrabold", p.titleColor)}>
                    {p.title}
                  </h3>

                  <p className="mt-4 w-full text-base leading-snug text-white/85">
                    {p.desc}
                  </p>
                </div>

                {/* RIGHT IMAGE */}
                <div
                  className={cn(
                    "relative w-full",
                    // mobile: shorter, keeps the bunny in frame
                    "h-[220px] sm:h-[260px]",
                    // md+: tall like screenshot
                    "md:h-[320px] lg:h-[360px]"
                  )}
                >
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className={cn(
                      // screenshot style: bunny to the right/bottom
                      "object-contain object-right-bottom",
                      "drop-shadow-[0_35px_40px_rgba(0,0,0,0.35)]"
                    )}
                    priority={false}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
