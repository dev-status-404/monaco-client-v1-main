import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import handshake from "../../../../public/assets/SVGs/handshake.svg";
import wallet from "../../../../public/assets/SVGs/wallet.svg";
import calende from "../../../../public/assets/SVGs/calende.svg";
import growth from "../../../../public/assets/SVGs/growth.svg";

const perks = [
  { title: "Referral Bonus", icon: handshake.src, desc: "Invite friends, earn extra coins." },
  { title: "RakeBack", icon: wallet.src, desc: "Get a % back on every play." },
  { title: "Daily Login", icon: calende.src, desc: "Free coins waiting every day." },
  { title: "Level Up Bonus", icon: growth.src, desc: "Unlock big rewards as you climb." },
];

export default function Rewards() {
  return (
    <section className="relative py-10">
      {/* heading (exact line break behavior like screenshots) */}
      <div className="text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          <span className="text-emerald-400">Earn Rewards</span>
          <span className="text-white"> as You Play</span>
        </h2>
      </div>

      {/* ✅ responsive layout:
          - mobile: 2x2
          - md+: 4 in a row
      */}
      <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        {perks.map((p, idx) => (
          <Card
            key={p.title}
            className={cn(
              "relative !h-full overflow-hidden rounded-2xl border border-white/5",
              "bg-[#0b1220] shadow-[0_18px_55px_rgba(0,0,0,0.45)]",
              "transition-transform duration-200 hover:-translate-y-0.5"
            )}
          >
            {/* ✅ per-card soft glow (subtle like screenshot) */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 opacity-90",
                idx === 0 &&
                  "bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.18),transparent_60%)]",
                idx === 1 &&
                  "bg-[radial-gradient(circle_at_50%_20%,rgba(59,130,246,0.16),transparent_60%)]",
                idx === 2 &&
                  "bg-[radial-gradient(circle_at_50%_20%,rgba(245,158,11,0.16),transparent_60%)]",
                idx === 3 &&
                  "bg-[radial-gradient(circle_at_70%_20%,rgba(34,197,94,0.16),transparent_60%)]"
              )}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/25" />

            <CardContent
              className={cn(
                // ✅ enough height so text aligns like screenshot
                "relative flex h-full flex-col justify-center text-center",
                "px-6",
                "min-h-[170px] sm:min-h-[190px] md:min-h-[210px]"
              )}
            >
              {/* icon centered at top */}
              <div className="mx-auto mb-5 h-16 w-16">
                <img src={p.icon} alt={p.title} className="h-full w-full object-contain" />
              </div>

              <p className="text-lg md:text-xl font-extrabold text-white">
                {p.title}
              </p>
              <p className="mt-2 text-sm md:text-base leading-snug text-white/70">
                {p.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
