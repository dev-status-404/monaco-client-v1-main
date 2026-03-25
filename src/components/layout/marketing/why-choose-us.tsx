import Image, { StaticImageData } from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import clock from "../../../../public/assets/SVGs/clock.svg";
import lock from "../../../../public/assets/SVGs/lock.svg";
import cash from "../../../../public/assets/SVGs/cash.svg";
import gold from "../../../../public/assets/SVGs/gold.svg";

type Item = {
  title: string;
  desc: string;
  icon: StaticImageData;
  accent: "blue" | "teal" | "green" | "purple";
};

const items: Item[] = [
  {
    title: "Safe & Secure",
    desc: "Protected payments,\ntrusted play.",
    icon: lock,
    accent: "blue",
  },
  {
    title: "24/7 Support",
    desc: "Always here when you\nneed us.",
    icon: clock,
    accent: "teal",
  },
  {
    title: "Same Day\nRedemption",
    desc: "Fast, easy redeems.",
    icon: cash,
    accent: "green",
  },
  {
    title: "Loyalty Club",
    desc: "Unlock exclusive perks &\nrewards.",
    icon: gold,
    accent: "purple",
  },
];

function accent(a: Item["accent"]) {
  switch (a) {
    case "blue":
      return {
        orb: "bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.55),rgba(59,130,246,0.18)_45%,transparent_70%)]",
        glow: "bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,0.22),transparent_60%)]",
      };
    case "teal":
      return {
        orb: "bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.55),rgba(20,184,166,0.18)_45%,transparent_70%)]",
        glow: "bg-[radial-gradient(circle_at_20%_15%,rgba(20,184,166,0.22),transparent_60%)]",
      };
    case "purple":
      return {
        orb: "bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.55),rgba(168,85,247,0.18)_45%,transparent_70%)]",
        glow: "bg-[radial-gradient(circle_at_20%_15%,rgba(168,85,247,0.22),transparent_60%)]",
      };
    case "green":
    default:
      return {
        orb: "bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.55),rgba(34,197,94,0.18)_45%,transparent_70%)]",
        glow: "bg-[radial-gradient(circle_at_20%_15%,rgba(34,197,94,0.20),transparent_60%)]",
      };
  }
}

export default function WhyChooseUs() {
  return (
    <section className="w-full py-12">
      <div className="mx-auto px-4">
        {/* ✅ 2x2 grid exactly like reference */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it) => {
            const a = accent(it.accent);

            return (
              <Card
                key={it.title}
                className={cn(
                  "relative h-[200px] rounded-2xl overflow-visible",
                  "bg-[#0b1220] border border-white/5",
                  "shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
                )}
              >
                {/* card glow */}
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-2xl",
                    a.glow
                  )}
                />

                {/* floating orb */}
                <div className="absolute left-1/2 -top-8 -translate-x-1/2">
                  <div
                    className={cn("grid h-20 w-20 place-items-center", a.orb)}
                  >
                    <div className="relative grid h-16 w-16 place-items-center rounded-full bg-[#0b1220]/40">
                      <Image
                        src={it.icon}
                        alt={it.title}
                        width={64}
                        height={64}
                        className="h-12 w-12 object-contain"
                      />
                    </div>
                  </div>
                </div>

                <CardContent className="flex h-full flex-col items-center justify-center px-4 pt-10 text-center">
                  <p className="whitespace-pre-line text-lg font-extrabold leading-tight text-white">
                    {it.title}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-snug text-white/70">
                    {it.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
