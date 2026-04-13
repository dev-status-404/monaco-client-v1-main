"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Slide = {
  src: string;
  alt: string;
};

export default function Hero() {
  const slides: Slide[] = useMemo(
    () => [
      { src: "https://ik.imagekit.io/kowkpgj32/games/big%20dady.png?updatedAt=1770682001752", alt: "Big Daddy Dragon" },
    ],
    []
  );

  return (
    <section className={cn("relative flex w-full overflow-hidden rounded-3xl")}>
      <HeroSlider
        slides={slides}
        autoPlay
        intervalMs={4500}
        className="min-h-[420px] md:min-h-[560px]"
      >
        {/* ===== Overlay Content (center buttons + branding) ===== */}
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 text-center">
          <p className="text-sm font-semibold tracking-[0.25em] text-white/70 md:text-base">
            WELCOME TO
          </p>

          <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-emerald-400 md:text-7xl">
            Monaco
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
            Your favorite slots, fish tables, and live games — all in one place.
            Play for free, and win real cash prizes!
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className={cn(
                "inline-flex items-center justify-center rounded-full px-10 py-4",
                "bg-emerald-400 text-black font-extrabold tracking-wide",
                "shadow-[0_22px_55px_rgba(0,0,0,0.45)]",
                "hover:bg-emerald-300 transition"
              )}
            >
              Sign Up Now
            </Link>

            <Link
              href="/games"
              className={cn(
                "inline-flex items-center justify-center rounded-full px-10 py-4",
                "border border-white/25 bg-black/35 text-white font-extrabold tracking-wide",
                "shadow-[0_18px_45px_rgba(0,0,0,0.45)]",
                "hover:bg-black/50 transition"
              )}
            >
              Play Now
            </Link>
          </div>
        </div>
      </HeroSlider>
    </section>
  );
}

/* =========================
   Slider (arrows + dots like screenshot)
========================= */

function HeroSlider({
  slides,
  autoPlay = true,
  intervalMs = 5000,
  className,
  children,
}: {
  slides: Slide[];
  autoPlay?: boolean;
  intervalMs?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const [idx, setIdx] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<number | null>(null);

  const total = slides.length;

  const go = (next: number) => {
    const safe = ((next % total) + total) % total;
    setIdx(safe);
  };

  const next = () => go(idx + 1);
  const prev = () => go(idx - 1);

  // autoplay
  useEffect(() => {
    if (!autoPlay || total <= 1 || isHovering) return;

    timerRef.current = window.setInterval(() => {
      setIdx((v) => (v + 1) % total);
    }, intervalMs);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [autoPlay, intervalMs, total, isHovering]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, total]);

  return (
    <div
      className={cn("relative w-full", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-roledescription="carousel"
    >
      {/* Background slides */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <div
            key={s.alt + i}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === idx ? "opacity-100" : "opacity-0"
            )}
            aria-hidden={i !== idx}
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              priority={i === 0}
              className="object-cover object-center"
            />

            {/* dark overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/35" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative h-full w-full">{children}</div>

      {/* Left arrow (middle) */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className={cn(
              "absolute left-4 top-1/2 z-20 -translate-y-1/2",
              "grid h-12 w-12 place-items-center rounded-full",
              "bg-black/45 text-white ring-1 ring-white/20 backdrop-blur",
              "hover:bg-black/60 transition"
            )}
          >
            <ChevronLeft />
          </button>

          {/* Right arrow (middle) */}
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className={cn(
              "absolute right-4 top-1/2 z-20 -translate-y-1/2",
              "grid h-12 w-12 place-items-center rounded-full",
              "bg-black/45 text-white ring-1 ring-white/20 backdrop-blur",
              "hover:bg-black/60 transition"
            )}
          >
            <ChevronRight />
          </button>

          {/* Dots bottom center */}
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition",
                  i === idx ? "bg-white" : "bg-white/35 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================
   Icons
========================= */

function ChevronLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
