"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function PartnerProgramCard() {
  return (
    <section className="w-full py-10">
      <div className="mx-auto w-full max-w-2xl px-4">
        <Card
          className={cn(
            "relative overflow-hidden rounded-3xl",
            "border border-amber-300/70",
            "bg-[#222222]",
            "shadow-[0_24px_70px_rgba(0,0,0,0.60)]"
          )}
        >
          {/* inner glow / vignette */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.14),transparent_60%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,0.10),transparent_62%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/25" />
          </div>

          {/* gold inner border like screenshot */}
          <div className="pointer-events-none absolute inset-[10px] rounded-[22px] border border-amber-300/35" />

          <CardContent className="relative px-7 py-10 sm:px-10 sm:py-14">
            {/* title */}
            <h3 className="text-center text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Join the Monaco Partner Program
            </h3>

            {/* intro */}
            <p className="mx-auto mt-6 max-w-lg text-center text-sm leading-relaxed text-white/75 sm:text-base">
              Unlock multiple earning opportunities with one powerful system.
            </p>

            {/* checklist */}
            <div className="mx-auto mt-10 max-w-md space-y-6">
              <CheckRow text="High commission structure" />
              <CheckRow text="Real-time referral dashboard" />
              <CheckRow text="Weekly payouts" />
            </div>

            {/* note */}
            <p className="mx-auto mt-10 max-w-lg text-center text-sm leading-relaxed text-white/75 sm:text-base">
              Grow faster with a brand trusted by thousands of players.
            </p>

            {/* highlight line */}
            <p className="mx-auto mt-8 max-w-lg text-center text-sm font-semibold text-amber-300">
              Your success starts here — become a partner today
            </p>

            {/* button */}
            <div className="mt-10 flex justify-center">
              <Link
                href="/partner"
                className={cn(
                  "inline-flex h-12 items-center justify-center rounded-xl px-10",
                  "bg-gradient-to-b from-emerald-700 to-emerald-900",
                  "text-sm font-extrabold tracking-wide text-white",
                  "shadow-[0_18px_40px_rgba(0,0,0,0.45)]",
                  "ring-1 ring-emerald-300/20",
                  "hover:brightness-110 transition"
                )}
              >
                Join Partner Program
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function CheckRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "grid h-9 w-9 place-items-center rounded-full",
          "bg-emerald-500/15 ring-1 ring-emerald-400/35"
        )}
      >
        <Check className="h-5 w-5 text-emerald-400" />
      </div>
      <p className="text-base font-semibold text-white sm:text-lg">{text}</p>
    </div>
  );
}
