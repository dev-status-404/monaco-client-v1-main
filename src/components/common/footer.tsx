"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Mail,
  MessageSquare,
  Phone,
  Handshake,
} from "lucide-react";

const leftLinks = [
  "Contact Hub",
  "Affiliates",
  "AML/CTF Policy",
  "Responsible Gaming",
];
const rightLinks = [
  // "Promo Rules",
  "Privacy Policy",
  "Terms & Conditions",
  // "Help Center",
];

import LOGO from "../../../public/assets/SVGs/luke/hat.png";

export default function Footer() {
  return (
    <footer className="relative mt-16 pb-16">
      {/* subtle top separator like screenshot */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-border/60" />

      <div className="grid gap-16 pt-14 md:grid-cols-[1fr_1.6fr]">
        {/* LEFT COLUMN */}
        <div className="space-y-10">
          {/* Logo */}
          <div className="flex items-start gap-4">
            {/* Replace with your real logo file */}
            <div className="relative h-16 w-24">
              {/* If you have your logo, put it in public/images/brand/logo.png */}
              <Image
                src={LOGO}
                alt="UCSWEEPS"
                fill
                className="object-contain rounded-full"
                priority={false}
              />
            </div>
          </div>

          {/* Contact list */}
          <div className="space-y-4 text-base">
            {/* <Row icon={<Phone className="h-6 w-6" />} label="Phone :" value="123 456 789" /> */}
            <Row
              icon={<MessageSquare className="h-6 w-6" />}
              label="Live Support"
            />
            <Row
              icon={<Mail className="h-6 w-6" />}
              label="Support :"
              value="support@monacogameroom.com"
            />
            <Row
              icon={<Handshake className="h-6 w-6" />}
              label="Contact :"
              value="contact@monacogameroom.com"
            />
          </div>

          {/* Contact Hub Link */}
          <div className="pt-2">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/80 transition"
            >
              <MessageSquare className="h-5 w-5" />
              Contact Hub
            </a>
          </div>

          {/* Left links */}
          {/* <div className="space-y-5 pt-2">
            {leftLinks.map((t) => (
              <a
                key={t}
                href="#"
                className="block text-lg font-semibold text-foreground/90 hover:text-foreground transition"
              >
                {t}
              </a>
            ))}
          </div> */}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-12">
          {/* Accordion-like rows */}
          <div className="space-y-8">
            <div className="border-b border-border/60 pb-6">
              <div className="flex items-center justify-between">
                <p className="text-4xl font-semibold tracking-tight text-foreground">
                  About us
                </p>
                <ChevronDown className="h-7 w-7 text-foreground/80" />
              </div>
            </div>

            <a
              href="/contact"
              className="block border-b border-border/60 pb-6 cursor-pointer hover:opacity-80 transition"
            >
              <div className="flex items-center justify-between">
                <p className="text-4xl font-semibold tracking-tight text-foreground">
                  Give us a feedback
                </p>
                <Mail className="h-7 w-7 text-foreground/80" />
              </div>
            </a>
          </div>

          {/* Right links */}
          <div className="space-y-4 pt-2">
            {rightLinks.map((t) => {
              const href = t === "Privacy Policy" ? "/privacy" : "/tos";
              return (
                <a
                  key={t}
                  href={href}
                  className="block text-lg font-semibold text-foreground/90 hover:text-foreground transition"
                >
                  {t}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* bottom thin line like screenshot */}
      <div className="mt-14 h-px bg-border/60" />
    </footer>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-4 text-foreground/90">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted/25 border border-border">
        {icon}
      </div>
      <div className="text-lg font-semibold">
        {value ? (
          <>
            <span className="font-semibold">{label}</span>{" "}
            <span className="text-foreground/85">{value}</span>
          </>
        ) : (
          <span>{label}</span>
        )}
      </div>
    </div>
  );
}
