"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import CARDS from "../../../../public/assets/SVGs/cards.svg";
import ULTRA_PANDA from "../../../../public/assets/SVGs/ultra_panda.svg";
import FORTUNE_KINGS from "../../../../public/assets/SVGs/fortune_kings.svg";

import visa from "../../../../public/assets/SVGs/visa.svg";
import mastercard from "../../../../public/assets/SVGs/mastercard.svg";
import s from "../../../../public/assets/SVGs/s.svg";
import chime from "../../../../public/assets/SVGs/chime.svg";
import paypal from "../../../../public/assets/SVGs/paypal.svg";
import coam from "../../../../public/assets/SVGs/coam.svg";

const payments = [
  { name: "VISA", icon: visa.src },
  { name: "MASTERCARD", icon: mastercard.src },
  { name: "S", icon: s.src },
  { name: "chime", icon: chime.src },
  { name: "PayPal", icon: paypal.src },
  { name: "COAM", icon: coam.src },
];

function StepNum({ n }: { n: number }) {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-xl font-extrabold text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      {n}
    </div>
  );
}

function StepCard({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* number pinned to top-left like screenshot */}
      <div className="absolute ">
        <StepNum n={n} />
      </div>

      <Card
        className={cn(
          "relative overflow-hidden  border-none",
          "bg-transparent shadow-[0_18px_55px_rgba(0,0,0,0.45)]"
        )}
      >
        <CardContent className="relative p-6">{children}</CardContent>
      </Card>
    </div>
  );
}

export default function HowToPlaySteps() {
  return (
    <section className="relative w-full py-10">
      {/* ✅ responsive container */}
      <div className="mx-auto max-w-9xl px-4">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start">
          {/* LEFT */}
          <div className="relative">
            <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              How to play in <span className="text-emerald-400">3 Easy Steps</span>
            </h2>

            <div className="relative mt-6 w-full">
              {/* keep image large on desktop, centered on mobile */}
              <div className="relative mx-auto h-[280px] w-full max-w-[520px] sm:h-[360px] lg:mx-0 lg:h-[520px] lg:max-w-none">
                <Image
                  src={CARDS}
                  alt="How to play illustration"
                  fill
                  className="object-contain"
                  priority={false}
                  sizes="(max-width: 1024px) 100vw, 520px"
                />
              </div>
            </div>
          </div>

          {/* RIGHT (scrollable on md/lg/xl) */}
          <div className="relative border-l">
            {/* ✅ on large/medium: scroll inside this column */}
            <div className="space-y-6 md:max-h-[620px] md:overflow-y-auto md:pr-2 lg:max-h-[560px]">
              {/* STEP 1 */}
              <StepCard n={1}>
                <p className="text-sm font-semibold text-white/70">
                  Sign up &amp; get:
                </p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                    <div className="text-sm font-bold text-amber-200">
                      $10 Signup bonus
                    </div>
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-amber-400 text-black font-black">
                      G
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                    <div className="text-sm font-bold text-emerald-200">
                      $10 Referal Bonus
                    </div>
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500 text-black font-black">
                      S
                    </div>
                  </div>
{/* 
                  <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                    <div className="text-sm font-bold text-fuchsia-200">
                      + 333% bonus on 1st purchase
                    </div>
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-fuchsia-500 text-black font-black">
                      %
                    </div>
                  </div> */}
                </div>

                <button
                  type="button"
                  className="mt-5 w-full rounded-full bg-emerald-400 py-3 text-sm font-extrabold text-black hover:bg-lime-300 transition"
                >
                  CLAIM
                </button>
              </StepCard>

              {/* STEP 2 */}
              <StepCard n={2}>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="relative flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="relative h-12 w-full">
                      <Image
                        src={ULTRA_PANDA}
                        alt="Ultra Panda"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="relative h-12 w-full">
                      <Image
                        src={FORTUNE_KINGS}
                        alt="Fortune Kings"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </StepCard>

              {/* STEP 3 */}
              <StepCard n={3}>
                <p className="text-lg font-extrabold text-white leading-tight">
                  Redeem Instantly
                </p>
                <p className="mt-2 text-sm text-white/70">
                  To your Debit Card, Bank, or Gift Cards.
                </p>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {payments.map((x) => (
                    <div
                      key={x.name}
                      className="grid h-16 place-items-center rounded-2xl border border-white/10 bg-white/5"
                    >
                      <img src={x.icon} alt={x.name} className="h-8 w-auto" />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-5 w-full rounded-full bg-emerald-400 py-3 text-sm font-extrabold text-black hover:bg-lime-300 transition"
                >
                  REDEEM
                </button>
              </StepCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
