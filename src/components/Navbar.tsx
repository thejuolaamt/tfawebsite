"use client";

import { useState } from "react";

const links = [
  { label: "About", href: "#about" },
  { label: "Mission", href: "#mission" },
  { label: "Our Story", href: "#story" },
  { label: "Team", href: "#team" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-line bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="text-lg font-bold tracking-wide text-crimson">
          TFA
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-muted transition hover:text-crimson"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#join"
              className="rounded-full bg-crimson px-5 py-2 text-sm font-medium text-cream transition hover:bg-crimson-deep"
            >
              Become a Member
            </a>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="text-sm font-medium text-ink md:hidden"
          aria-label="Toggle menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <ul className="flex flex-col gap-4 border-t border-line bg-cream px-6 py-4 md:hidden">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-ink hover:text-crimson"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#join"
              onClick={() => setOpen(false)}
              className="font-medium text-crimson"
            >
              Become a Member
            </a>
          </li>
        </ul>
      )}
    </header>
  );
}

