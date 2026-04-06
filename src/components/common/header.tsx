"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

import LOGO from "../../../public/assets/SVGs/luke/hat.png";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full">
      {/* GOLD DIVIDER */}
      <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-4">
        {/* ===== TOP BAR ===== */}
        <div className="flex items-center justify-between">
          {/* LEFT (desktop only) */}
          <div className="flex-1 hidden md:flex items-center gap-3">
            <div className="flex items-center rounded-full bg-zinc-900 p-1 shadow-inner">
              {/* <NavItem href="#" active>
                Casino
              </NavItem>
              <NavItem href="#">Sport</NavItem>
              <NavItem href="#">Favorites</NavItem> */}
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="flex-1 flex md:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="text-yellow-400"
            >
              {open ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

          {/* LOGO */}
          <Link href="/" className="flex items-center justify-center">
            <div className="relative h-16 w-16 sm:h-16 sm:w-16">
              <Image
                src={LOGO}
                alt="Logo"
                fill
                priority
                className="object-contain rounded-full"
              />
            </div>
          </Link>

          {/* RIGHT (desktop only) */}
          <div className="flex-1 hidden md:flex items-center justify-end gap-3">
            <AuthButtons />
          </div>

          {/* spacer to balance mobile layout */}
          <div className="flex-1 md:hidden" />
        </div>

        {/* ===== MOBILE DROPDOWN ===== */}
        {open && (
          <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-zinc-900 p-5 md:hidden">
            {/* <NavItem href="#" mobile active>
              Casino
            </NavItem>
            <NavItem href="#" mobile>
              Sport
            </NavItem>
            <NavItem href="#" mobile>
              Favorites
            </NavItem> */}

            <div className="h-px bg-white/10 my-2" />

            <AuthButtons mobile />
          </div>
        )}
      </div>
    </header>
  );
}

/* ================= Components ================= */

function NavItem({
  href,
  children,
  active = false,
  mobile = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  mobile?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "transition font-medium",
        mobile
          ? "rounded-xl px-4 py-3 text-base"
          : "rounded-full px-5 py-2 text-sm",
        active
          ? "bg-yellow-400 text-black shadow-[0_6px_20px_rgba(255,215,0,0.35)]"
          : "text-zinc-400 hover:text-white",
      )}
    >
      {children}
    </Link>
  );
}

function AuthButtons({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={cn("flex gap-3", mobile ? "flex-col" : "items-center")}>
      <Link
        href="/auth/signin"
        className="rounded-full bg-yellow-400 px-6 py-2 text-sm font-semibold text-black hover:bg-yellow-300 transition text-center"
      >
        Login
      </Link>

      <Link
        href="/auth/signup"
        className="rounded-full bg-yellow-400 px-6 py-2 text-sm font-semibold text-black hover:bg-yellow-300 transition text-center"
      >
        Sign up
      </Link>
    </div>
  );
}
