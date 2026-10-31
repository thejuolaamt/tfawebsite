"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { JOIN_URL } from "@/lib/links";
import { useMember } from "@/lib/useMember";
import Avatar from "./Avatar";

// What visitors (not logged in) see
const visitorLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Team", href: "/#team" },
  { label: "Events", href: "/events" },
];

// What logged-in members see
const memberLinks = [
  { label: "Home", href: "/" },
  { label: "Feed", href: "/feed" },
  { label: "Events", href: "/events" },
  { label: "Materials", href: "/materials" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  // true = the header is slid out of view (after scrolling down)
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const member = useMember();

  const loading = member.status === "loading";
  const loggedIn = member.status === "in";
  const links = loggedIn ? memberLinks : visitorLinks;

  // Hide when scrolling down, show again when scrolling up
  useEffect(() => {
    lastY.current = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      const diff = y - lastY.current;

      if (y < 80) {
        setHidden(false);
        lastY.current = y;
        return;
      }
      // Ignore tiny movements so it does not flicker
      if (Math.abs(diff) < 8) return;

      setHidden(diff > 0);
      lastY.current = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Never hide while the menu is open
  const slideAway = hidden && !open;

  return (
    <header
      onFocusCapture={() => setHidden(false)}
      className={`fixed top-0 left-0 z-50 w-full border-b border-line bg-cream/95 transition-transform duration-300 motion-reduce:transition-none lg:backdrop-blur ${
        slideAway ? "-translate-y-full" : "translate-y-0"
      }`}
    >
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

        {/* Mobile and tablet toggle: three lines that turn into an X */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-ink text-ink lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span aria-hidden="true" className="relative block h-4 w-6">
            <span
              className={`absolute left-0 h-0.5 w-6 rounded-full bg-ink transition-all duration-300 motion-reduce:transition-none ${
                open ? "top-[7px] rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] h-0.5 w-6 rounded-full bg-ink transition-all duration-300 motion-reduce:transition-none ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-0.5 w-6 rounded-full bg-ink transition-all duration-300 motion-reduce:transition-none ${
                open ? "top-[7px] -rotate-45" : "top-[14px]"
              }`}
            />
          </span>
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
