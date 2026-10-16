"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Smooth, momentum-style scrolling for mouse and trackpad.
 * Phones keep their own native swipe, which already feels best.
 * Also publishes two CSS values the page uses for motion:
 *   --scroll-progress : 0 to 1, how far down the whole page you are
 *   --hero-p          : 0 to 1, how far you have scrolled out of the first screen
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: true,
      autoRaf: true,
    });

    const update = (scroll: number, limit: number) => {
      const height = window.innerHeight || 1;
      root.style.setProperty(
        "--scroll-progress",
        String(limit > 0 ? Math.min(1, scroll / limit) : 0)
      );
      root.style.setProperty(
        "--hero-p",
        String(Math.min(1, Math.max(0, scroll / height)))
      );
    };

    update(lenis.scroll, lenis.limit);
    lenis.on("scroll", (l: Lenis) => update(l.scroll, l.limit));

    return () => {
      lenis.destroy();
    };
  }, []);

  return <div aria-hidden="true" className="scroll-progress" />;
}
