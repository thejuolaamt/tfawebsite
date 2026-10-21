"use client";

import { useLayoutEffect } from "react";

/**
 * Reveals each heading, paragraph and card the moment it scrolls into view.
 * Anything already marked with data-reveal in the page (like the Hero buttons)
 * is revealed the same way and keeps its own delay.
 * (Menu-link jumps are handled by SmoothScroll.)
 */
export default function ScrollReveal() {
  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main > section")
    );
    if (!sections.length) return;

    const targets: HTMLElement[] = [];

    sections.forEach((section) => {
      const items = section.querySelectorAll<HTMLElement>(
        "h1, h2, p, [data-reveal], [data-stagger] > *"
      );
      const seen = new Map<Element, number>();

      items.forEach((el) => {
        const group = el.closest("[data-stagger]");
        const isGroupChild = el.parentElement?.hasAttribute("data-stagger");
        if (group && !isGroupChild) return;

        const parent = el.parentElement as Element;
        const position = seen.get(parent) ?? 0;
        seen.set(parent, position + 1);

        const hasOwnDelay = el.hasAttribute("data-reveal");
        el.setAttribute("data-reveal", "");
        if (!hasOwnDelay) {
          el.style.setProperty("--d", `${Math.min(position, 4) * 70}ms`);
        }
        targets.push(el);
      });
    });

    document.documentElement.classList.add("js-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("js-reveal");
    };
  }, []);

  return null;
}
