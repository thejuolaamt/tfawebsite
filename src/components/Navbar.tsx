"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { JOIN_URL } from "@/lib/links";

const links = [
  { label: "About", href: "/#about" },
  { label: "Team", href: "/#team" },
  { label: "Events", href: "/events" },
  { label: "Materials", href: "/materials" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-line bg-cream/95 lg:backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="The Fine Artist Community, back to top" className="flex items-center">
          <Image
            src="/images/tfa-logo-mark.png"
            alt="The Fine Artist Community logo"
            width={240}
            height={133}
            priority
            className="h-9 w-auto"
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-muted transition hover:text-crimson"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/account"
              aria-label="My account"
              title="My account"
              className="inline-flex size-10 items-center justify-center rounded-full border border-line text-muted transition hover:border-crimson hover:text-crimson"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </Link>
          </li>
          <li>
            <Link
              href={JOIN_URL}
              className="rounded-full bg-crimson px-5 py-2.5 text-sm font-bold text-cream transition hover:bg-crimson-deep"
            >
              Become a Member
            </Link>
          </li>
        </ul>

        {/* Mobile and tablet toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="min-h-11 rounded-full border-[1.5px] border-ink px-5 text-[15px] font-bold text-ink lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {/* Mobile and tablet menu */}
      {open && (
        <ul className="flex flex-col border-t border-line bg-cream px-6 pb-6 pt-2 lg:hidden">
          {[...links, { label: "My account", href: "/account" }].map((link) => (
            <li key={link.href} className="border-b border-line">
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-4 font-display text-2xl font-bold tracking-tight text-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="flex flex-col gap-3 pt-5">
            <Link
              href={JOIN_URL}
              onClick={() => setOpen(false)}
              className="inline-flex min-h-13 w-full items-center justify-center rounded-full bg-crimson text-base font-bold text-cream"
            >
              Become a Member
            </Link>
          </li>
        </ul>
      )}
    </header>
  );
}
