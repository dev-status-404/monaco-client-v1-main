"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, MessageCircle, ShoppingCart } from "lucide-react";

import LOGO from "../../../public/assets/SVGs/luke/hat.png";
import facebook from "../../../public/assets/SVGs/facebook.svg";
import instagram from "../../../public/assets/SVGs/instagram.svg";

const aboutLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms and Conditions", href: "/tos" },
  { label: "Responsible Play Policy", href: "/responsible-play-policy" },
  { label: "Contact Hub", href: "/contact" },
];

const featureLinks = [
  { label: "Casino", href: "/" },
  { label: "Sweepstakes Games", href: "/" },
  { label: "VIP Rewards", href: "/" },
  { label: "Refer a Friend", href: "/auth/signup" },
];

const socialLinks = [
  { label: "Facebook", href: "#", icon: facebook },
  { label: "Instagram", href: "#", icon: instagram },
];

export default function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-border bg-card/90 text-card-foreground shadow-[0_-1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
      <div className="grid gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.15fr_1fr_1fr_1.25fr_1.25fr] lg:gap-14 xl:px-10">
        <section className="space-y-6">
          <Link href="/" className="block w-fit">
            <div className="relative h-28 w-52">
              <Image
                src={LOGO}
                alt="Monaco Gameroom"
                fill
                className="object-contain"
                priority={false}
              />
            </div>
          </Link>

          <p className="max-w-xs text-lg font-medium leading-relaxed text-muted-foreground">
            Your premier destination for sweepstakes casino entertainment. Play
            top games and win real prizes.
          </p>

          <div>
            <h2 className="text-lg font-extrabold uppercase tracking-wide text-primary">
              Social Media
            </h2>
            <div className="mt-4 flex items-center gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="grid h-12 w-12 place-items-center rounded-full transition hover:scale-105"
                >
                  <Image
                    src={link.icon}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        </section>

        <FooterColumn title="About Monaco Gameroom" links={aboutLinks} />
        <FooterColumn title="Features" links={featureLinks} />

        <section>
          <h2 className="text-lg font-extrabold uppercase tracking-wide text-primary">
            Contact Us
          </h2>
          <div className="mt-6 space-y-5 text-lg font-medium text-muted-foreground">
            <ContactRow
              icon={<Mail className="h-6 w-6" />}
              text="support@monacogameroom.com"
              href="mailto:support@monacogameroom.com"
            />
            <ContactRow
              icon={<Mail className="h-6 w-6" />}
              text="contact@monacogameroom.com"
              href="mailto:contact@monacogameroom.com"
            />
            <ContactRow
              icon={<Clock className="h-6 w-6" />}
              text="24/7 Live Support"
            />
            <ContactRow
              icon={<MessageCircle className="h-6 w-6" />}
              text="Contact Hub"
              href="/contact"
            />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-extrabold uppercase tracking-wide text-primary">
            How It Works
          </h2>
          <div className="mt-6 space-y-7">
            <HowItWorksItem
              icon={
                <span className="grid h-16 w-16 place-items-center rounded-full border-4 border-primary bg-background text-2xl font-black text-foreground shadow-[0_0_0_2px_rgba(255,255,255,0.12)]">
                  21+
                </span>
              }
              text="Must be 21+ to play where required."
            />
            <HowItWorksItem
              icon={
                <span className="relative grid h-16 w-16 place-items-center rounded-full border-4 border-destructive bg-background text-foreground">
                  <ShoppingCart className="h-8 w-8" />
                  <span className="absolute h-1 w-16 rotate-[-35deg] rounded-full bg-red-500" />
                </span>
              }
              text="No purchase necessary."
            />
          </div>
        </section>
      </div>

      <div className="border-t border-border bg-background/80 px-5 py-6 text-center text-base font-bold text-foreground sm:text-lg">
        <span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-full bg-primary text-sm font-black text-primary-foreground">
          MG
        </span>
        &copy; 2026 Monaco Gameroom All Rights Reserved.
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <section>
      <h2 className="max-w-52 text-lg font-extrabold uppercase tracking-wide text-primary">
        {title}
      </h2>
      <nav className="mt-6 space-y-5">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="block text-lg font-medium text-muted-foreground transition hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}

function ContactRow({
  icon,
  text,
  href,
}: {
  icon: React.ReactNode;
  text: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="shrink-0 text-primary">{icon}</span>
      <span className="min-w-0 break-words">{text}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-start gap-4 transition hover:text-primary">
        {content}
      </Link>
    );
  }

  return <div className="flex items-start gap-4">{content}</div>;
}

function HowItWorksItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-6">
      <div className="shrink-0">{icon}</div>
      <p className="text-base font-medium leading-relaxed text-muted-foreground">
        {text}
      </p>
    </div>
  );
}
