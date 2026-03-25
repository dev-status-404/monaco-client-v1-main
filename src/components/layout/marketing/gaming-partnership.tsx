"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

// ✅ Replace these with your real assets
import SLIDE_1 from "../../../../public/assets/SVGs/luke/card_left.svg";
import SLIDE_2 from "../../../../public/assets/SVGs/luke/card_middle.svg";
import SLIDE_3 from "../../../../public/assets/SVGs/luke/card_right.svg";

import PARTNER_1 from "../../../../public/assets/SVGs/luke/tada.svg";
import PARTNER_2 from "../../../../public/assets/SVGs/luke/eurasian.svg";

type Slide = { id: string; src: StaticImageData; alt: string };
type Partner = { id: string; src: StaticImageData; alt: string };

export default function GamingPartnersSection() {
  const slides: Slide[] = useMemo(
    () => [
      { id: "s1", src: SLIDE_1, alt: "Slide 1" },
      { id: "s2", src: SLIDE_2, alt: "Slide 2" },
      { id: "s3", src: SLIDE_3, alt: "Slide 3" },
    ],
    []
  );

  const partners: Partner[] = useMemo(
    () => [
      { id: "tada", src: PARTNER_1, alt: "TaDa Gaming" },
      { id: "eurasian", src: PARTNER_2, alt: "Eurasian Gaming" },
    ],
    []
  );

  return (
    <section className="w-full py-10">
      <div className="mx-auto w-full max-w-2xl px-4">
        <div>
          <CardContent className="relative p-6 sm:p-8">
            {/* ===== top heading ===== */}
            <p className="text-center text-sm font-extrabold tracking-wide text-white/90">
              FAST SETUP TO WIN EARLY
            </p>

            {/* ===== carousel (stacked cards) ===== */}
            <div className="mt-6">
              <CardStackCarousel slides={slides} autoPlay intervalMs={4000} />
            </div>

            {/* ===== partners copy ===== */}
            <div className="mt-10">
              <p className="text-lg font-extrabold text-white">
                GAMING PARTNERS
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/70">
                Featuring world-class game studios from across the globe
              </p>
            </div>

            {/* ===== partners row ===== */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {partners.map((p) => (
                <PartnerCard key={p.id} partner={p} />
              ))}
            </div>

            {/* ===== CTA ===== */}
            <div className="mt-8 flex justify-center">
              <Link
                href="/games"
                className={cn(
                  "inline-flex h-12 items-center justify-center rounded-xl px-10",
                  "bg-gradient-to-b from-amber-300 to-amber-500",
                  "text-sm font-extrabold tracking-wide text-black",
                  "shadow-[0_18px_40px_rgba(0,0,0,0.45)]",
                  "hover:brightness-110 transition"
                )}
              >
                Start playing for free
              </Link>
            </div>
          </CardContent>
        </div>
      </div>
    </section>
  );
}

/* =========================
   Card Stack Carousel (like screenshot)
========================= */

function CardStackCarousel({
  slides,
  autoPlay = true,
  intervalMs = 4500,
}: {
  slides: Slide[];
  autoPlay?: boolean;
  intervalMs?: number;
}) {
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(false);
  const timerRef = useRef<number | null>(null);

  const total = slides.length;
  const current = slides[idx];

  const prev = () => setIdx((v) => (v - 1 + total) % total);
  const next = () => setIdx((v) => (v + 1) % total);


  // neighbors for the “stack” look
  const left = slides[(idx - 1 + total) % total];
  const right = slides[(idx + 1) % total];

  return (
    <div
      className="relative mx-auto flex w-full max-w-[520px] items-center justify-center"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* left card */}
      <StackCard
        slide={left}
        className={cn(
          "absolute left-0 -translate-x-2 rotate-[-18deg] opacity-90",
          "w-[190px] sm:w-[220px]"
        )}
        onClick={prev}
      />

      {/* center card */}
      <div
        className={cn(
          "relative z-10 w-[220px] sm:w-[260px]",
          "rounded-2xl border-2 border-amber-300/80",
          "shadow-[0_30px_70px_rgba(0,0,0,0.65)]",
          "overflow-hidden"
        )}
      >
        <div className="relative aspect-[3/4] w-full bg-black/20">
          <Image
            src={current.src}
            alt={current.alt}
            fill
            className="object-cover"
            priority={false}
            sizes="260px"
          />
          <div className="absolute inset-0 bg-black/15" />

          {/* play icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-black shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
              <PlayIcon />
            </div>
          </div>
        </div>
      </div>

      {/* right card */}
      <StackCard
        slide={right}
        className={cn(
          "absolute right-0 translate-x-2 rotate-[18deg] opacity-90",
          "w-[190px] sm:w-[220px]"
        )}
        onClick={next}
      />

      {/* arrows */}
      <button
        type="button"
        aria-label="Previous"
        onClick={prev}
        className={cn(
          "absolute left-1 top-1/2 z-20 -translate-y-1/2",
          "grid h-10 w-10 place-items-center rounded-full",
          "bg-black/40 text-white ring-1 ring-white/20 backdrop-blur",
          "hover:bg-black/60 transition"
        )}
      >
        <ChevronLeft />
      </button>

      <button
        type="button"
        aria-label="Next"
        onClick={next}
        className={cn(
          "absolute right-1 top-1/2 z-20 -translate-y-1/2",
          "grid h-10 w-10 place-items-center rounded-full",
          "bg-black/40 text-white ring-1 ring-white/20 backdrop-blur",
          "hover:bg-black/60 transition"
        )}
      >
        <ChevronRight />
      </button>
    </div>
  );
}

function StackCard({
  slide,
  className,
  onClick,
}: {
  slide: Slide;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${slide.alt}`}
      className={cn(
        "group relative z-[1] overflow-hidden rounded-2xl ",
        "transition hover:opacity-100",
        className
      )}
    >
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={slide.src}
          alt={slide.alt}
          fill
          className="object-cover h-full w-full"
        />
      </div>
    </button>
  );
}

/* =========================
   Partners
========================= */

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl",
        "border border-amber-300/60 bg-white/10",
        "px-4 py-5",
        "shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
      )}
    >
      <div className="relative h-10 w-[180px]">
        <Image
          src={partner.src}
          alt={partner.alt}
          fill
          className="object-contain opacity-90"
          sizes="180px"
        />
      </div>
    </div>
  );
}

/* =========================
   Icons
========================= */

function PlayIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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

function ChevronLeft() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
