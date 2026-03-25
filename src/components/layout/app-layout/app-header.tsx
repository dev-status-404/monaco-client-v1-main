"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Trophy,
  Gamepad2,
  Coins,
  Banknote,
  Gift,
  User,
  Users2,
  ArrowLeftRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserInfo } from "@/helpers/use-user";
import { useAppDispatch } from "@/redux/hook";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/redux/slices/user";
import { useRouter } from "next/navigation";
import LOGO from "../../../../public/assets/SVGs/luke/hat.png";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string; // e.g. "NEW!"
};

const AppHeader = () => {
  const pathname = usePathname();
  const { id, role } = useUserInfo();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isAdmin = role === "admin";

  const NAV: NavItem[] = isAdmin
    ? [
        {
          href: isAdmin ? "/dashboard/a/" + id : "/dashboard/u/" + id,
          label: "Dashboard",
          icon: <LayoutGrid className="h-4 w-4" />,
        },
        {
          href: isAdmin ? "/deposits/a/" + id : "/deposits/u/" + id,
          label: "Deposits",
          icon: <Coins className="h-4 w-4" />,
        },
        {
          href: isAdmin ? "/redeems/a/" + id : "/redeems/u/" + id,
          label: "Redeems",
          icon: <Banknote className="h-4 w-4" />,
        },
        {
          href: isAdmin && "/users/a/" + id,
          label: "Users",
          icon: <Users2 className="h-4 w-4" />,
        },
        {
          href: isAdmin && "/game-requests/a/" + id,
          label: "Platform Requests",
          icon: <ArrowLeftRightIcon className="h-4 w-4" />,
        },
      ]
    : [
        {
          href: isAdmin ? "/dashboard/a/" + id : "/dashboard/u/" + id,
          label: "Dashboard",
          icon: <LayoutGrid className="h-4 w-4" />,
        },
        {
          href: isAdmin ? "/platforms/a/" + id : "/platforms/u/" + id,
          label: "Platforms",
          icon: <Gamepad2 className="h-4 w-4" />,
        },
        {
          href: isAdmin ? "/deposits/a/" + id : "/deposits/u/" + id,
          label: "Deposits",
          icon: <Coins className="h-4 w-4" />,
        },
        {
          href: isAdmin ? "/redeems/a/" + id : "/redeems/u/" + id,
          label: "Redeems",
          icon: <Banknote className="h-4 w-4" />,
        },
        // { href: "/rewards", label: "My Rewards", icon: <Gift className="h-4 w-4" /> },
      ];
  return (
    <header className="w-full">
      <div className=" border border-white/15 bg-emerald-400 px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Brand */}
          <Link href="/dashboard" className="flex items-center gap-3">
            {/* Replace with your logo */}
            <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/20">
              {/* If you don't have a file, remove Image and use text */}
              <Image
                src={LOGO}
                alt="Logo"
                className="object-contain p-1 !rounded-full"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-extrabold tracking-tight text-black/90">
                Monaco
              </div>
              <div className="text-xs font-medium text-black/50">
                Player Hub
              </div>
            </div>
          </Link>

          {/* Middle: Links */}
          <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition",
                    "text-black/55 hover:text-black/90 hover:bg-white/25",
                    active && "bg-white/30 text-black/95",
                  )}
                >
                  <span
                    className={cn(
                      "transition",
                      active ? "opacity-100" : "opacity-85",
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>

                  {item.badge ? (
                    <span className="absolute -top-2 right-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-red-500 shadow">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Right: Profile */}
          <Link
            href={isAdmin ? "/profile/" + id : "/profile/" + id}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition",
              "bg-white/20 hover:bg-white/30 text-black/85 hover:text-black",
            )}
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </Link>
          <Button
            className="rounded-2xl px-4 py-2 text-sm"
            variant={"destructive"}
            onClick={() => {
              dispatch(logoutUser());
              router.replace("/auth/signin");
            }}
          >
            Logout
          </Button>
        </div>

        {/* Mobile pills */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold transition",
                  "bg-white/15 text-black/70 hover:bg-white/25",
                  active && "bg-white/35 text-black/95",
                )}
              >
                <span className="mr-2 inline-flex align-middle">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
