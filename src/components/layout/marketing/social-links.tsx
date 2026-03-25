"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import facebook from "../../../../public/assets/SVGs/facebook.svg";
import instagram from "../../../../public/assets/SVGs/instagram.svg";
import twitter from "../../../../public/assets/SVGs/twitter.svg";
import youtube from "../../../../public/assets/SVGs/youtube.svg";
import telegram from "../../../../public/assets/SVGs/telegram.svg";

type Social = {
  name: string;
  icon: string;
  tone: "facebook" | "instagram" | "x" | "youtube" | "telegram";
};

const socials: Social[] = [
  { name: "Facebook", icon: facebook.src, tone: "facebook" },
  { name: "Instagram", icon: instagram.src, tone: "instagram" },
  { name: "X", icon: twitter.src, tone: "x" },
  { name: "Youtube", icon: youtube.src, tone: "youtube" },
  { name: "Telegram", icon: telegram.src, tone: "telegram" },
];

function barGradient(tone: Social["tone"]) {
  switch (tone) {
    case "facebook":
      return "bg-gradient-to-r from-sky-700/70 via-sky-900/40 to-zinc-900/30";
    case "instagram":
      return "bg-gradient-to-r from-amber-600/55 via-pink-700/35 to-zinc-900/30";
    case "x":
      return "bg-gradient-to-r from-zinc-700/55 via-zinc-800/35 to-zinc-900/30";
    case "youtube":
      return "bg-gradient-to-r from-red-700/60 via-red-900/35 to-zinc-900/30";
    case "telegram":
      return "bg-gradient-to-r from-sky-700/55 via-cyan-900/30 to-zinc-900/30";
  }
}

export default function SocialLinks() {
  return (
    <section className="relative ">
      {/* ✅ small: 1 column (stack)
          ✅ lg+: 2 columns like screenshot */}
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:items-center">
        {/* LEFT TEXT */}
        <div className="relative text-center lg:text-left">
          {/* floating coins only on lg+ */}
          <Coin className="left-[48%] top-6 scale-90" tone="amber" label="G" />
          <Coin
            className="left-[60%] top-[78%] scale-[1.8] -rotate-12 mt-16"
            tone="amber"
            label="G"
          />

          <h2 className="text-4xl sm:text-5xl font-semibold leading-tight text-foreground">
            Follow Us on <br />
            <span className="text-emerald-400 dark:text-emerald-300">
              Social Media!
            </span>
          </h2>

          <p className="mt-6 mx-auto lg:mx-0 max-w-md text-sm leading-relaxed text-muted-foreground dark:text-white/75">
            Get the latest updates on minigames, giveaways, events &amp; more.
          </p>
        </div>

        {/* RIGHT LIST */}
        <div className="space-y-4 sm:space-y-6">
          {socials.map((s) => (
            <div
              key={s.name}
              className={cn(
                "overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-xl",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
              )}
            >
              <div className="!p-0">
                <div
                  className={cn(
                    "flex items-center justify-between ",
                    barGradient(s.tone)
                  )}
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="grid h-14 w-14 sm:h-20 sm:w-20 place-items-center rounded-2xl">
                      <img
                        src={s.icon}
                        alt={s.name}
                        className="h-12 w-12 sm:h-16 sm:w-16 object-contain transform translate-x-0.5 -translate-y-0.5"
                      />
                    </div>

                    <p className="text-lg sm:text-2xl font-semibold text-foreground dark:text-white">
                      {s.name}
                    </p>
                  </div>

                  {/* chevron like screenshot */}
                  <span className="text-white/40 text-2xl leading-none px-3">›</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Coin({
  className,
  tone,
  label,
}: {
  className?: string;
  tone: "amber" | "emerald";
  label: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute hidden lg:block",
        "h-16 w-16 rounded-full shadow-[0_25px_55px_rgba(0,0,0,0.45)]",
        tone === "amber"
          ? "bg-gradient-to-b from-amber-300 to-amber-500"
          : "bg-gradient-to-b from-emerald-400 to-emerald-600",
        className
      )}
    >
      <div className="absolute inset-[10px] rounded-full bg-background/90 shadow-inner" />
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-3xl font-black text-foreground">{label}</span>
      </div>
    </div>
  );
}
