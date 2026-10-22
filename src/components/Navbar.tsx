"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { JOIN_URL } from "@/lib/links";
import { useMember } from "@/lib/useMember";
import Avatar from "./Avatar";

// What visitors (not logged in) see
const visitorLinks = [
  { label: "About", href: "/#about" },
  { label: "Team", href: "/#team" },
  { label: "Events", href: "/events" },
];

// What logged-in members see. The Feed link joins this list when the feed is built.
const memberLinks = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Materials", href: "/materials" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const member = useMember();

  const loading = member.status === "loading";
  const loggedIn = member.status === "in";
  const links = loggedIn ? memberLinks : visitorLinks;

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-line bg-cream/95 lg:backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="The Fine Artist Community, home" className="flex items-center">
          <Image
            src="/images/tfa-logo-mark.png"
            alt="The Fine Artist Community logo"
            width={240}
            height={133}
            priority
            className="h-9 w-auto"
          />
        </Link>

        {/* Desktop links (hidden for a moment while we check who is logged in) */}
        <ul
          className={`hidden items-center gap-7 transition-opacity lg:flex ${
            loading ? "invisible opacity-0" : "opacity-100"
          }`}
        >
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

          {loggedIn ? (
            <li>
              <Link
                href="/account"
                aria-label="My account"
                title="My account"
                className="block rounded-full ring-2 ring-transparent transition hover:ring-crimson"
              >
                <Avatar src={member.avatar} name={member.name} className="size-10 border border-line" />
              </Link>
            </li>
          ) : (
            <>
              <li>
                <Link
                  href="/login"
                  className="text-sm font-bold text-ink transition hover:text-crimson"
                >
                  Log in
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
            </>
          )}
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
          {links.map((link) => (
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

          {loggedIn ? (
            <li className="border-b border-line">
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-4 font-display text-2xl font-bold tracking-tight text-ink"
              >
                <Avatar src={member.avatar} name={member.name} className="size-9 border border-line" />
                My account
              </Link>
            </li>
          ) : (
            <>
              <li className="border-b border-line">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block py-4 font-display text-2xl font-bold tracking-tight text-ink"
                >
                  Log in
                </Link>
              </li>
              <li className="flex flex-col gap-3 pt-5">
                <Link
                  href={JOIN_URL}
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-13 w-full items-center justify-center rounded-full bg-crimson text-base font-bold text-cream"
                >
                  Become a Member
                </Link>
              </li>
            </>
          )}
        </ul>
      )}
    </header>
  );
}
