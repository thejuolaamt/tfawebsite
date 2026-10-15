"use client";

import { useState } from "react";
import Image from "next/image";
import { JOIN_URL, WORKSHOP_URL } from "@/lib/links";

const links = [
  { label: "Our Story", href: "#story" },
  { label: "About", href: "#about" },
  { label: "Mission", href: "#mission" },
  { label: "Team", href: "#team" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-line bg-cream/95 md:backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#" aria-label="The Fine Artist Community, back to top" className="flex items-center">
          <Image
            src="/images/tfa-logo-mark.png"
            alt="The Fine Artist Community logo"
            width={240}
            height={133}
            priority
            className="h-9 w-auto"
          />
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-muted transition hover:text-crimson"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={WORKSHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-[1.5px] border-crimson px-5 py-2.5 text-sm font-bold text-crimson transition hover:bg-crimson hover:text-cream"
            >
              Register for Workshop
            </a>
          </li>
          <li>
            <a
              href={JOIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-crimson px-5 py-2.5 text-sm font-bold text-cream transition hover:bg-crimson-deep"
            >
              Become a Member
            </a>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="min-h-11 rounded-full border-[1.5px] border-ink px-5 text-[15px] font-bold text-ink md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <ul className="flex flex-col border-t border-line bg-cream px-6 pb-6 pt-2 md:hidden">
          {links.map((link) => (
            <li key={link.href} className="border-b border-line">
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-4 font-display text-2xl font-bold tracking-tight text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="flex flex-col gap-3 pt-5">
            <a
              href={WORKSHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-13 w-full items-center justify-center rounded-full border-[1.5px] border-crimson text-base font-bold text-crimson"
            >
              Register for Workshop
            </a>
            <a
              href={JOIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-13 w-full items-center justify-center rounded-full bg-crimson text-base font-bold text-cream"
            >
              Become a Member
            </a>
          </li>
        </ul>
      )}
    </header>
  );
}
