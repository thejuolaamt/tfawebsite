"use client";

import { useLayoutEffect } from "react";

/**
 * Free, native scrolling. This component only does two things:
 *  1. Soft fade-and-rise reveal when a section first comes into view
 *  2. Smooth jump when a menu link (#story, #about, ...) is tapped
 * It does NOT touch wheel, touch or keyboard scrolling.
 */
export default function ScrollReveal() {
  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main > section")
    );
    if (!sections.length) return;

    /* ---------- 1. Reveal animations (play once) ---------- */
    let observer: IntersectionObserver | null = null;

    if (!reduceMotion) {
      document.documentElement.classList.add("js-reveal");

      sections.forEach((section) => {
        const items = section.querySelectorAll("h1, h2, p, [data-stagger] > *");
        let index = 0;
        items.forEach((el) => {
          const group = el.closest("[data-stagger]");
          const isGroupChild = el.parentElement?.hasAttribute("data-stagger");
          if (group && !isGroupChild) return;
          el.setAttribute("data-reveal", "");
          (el as HTMLElement).style.setProperty(
            "--d",
            `${Math.min(index, 5) * 60}ms`
          );
          index++;
        });
      });

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              observer?.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px 20% 0px" }
      );
      sections.forEach((section) => observer!.observe(section));
    }

    /* ---------- 2. Smooth jump for menu links ---------- */
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]'
      );
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      const el = id ? document.getElementById(id) : null;
      if (id && !el) return;
      e.preventDefault();
      const top = el ? el.getBoundingClientRect().top + window.scrollY : 0;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    };

    document.addEventListener("click", onClick);

    return () => {
      observer?.disconnect();
      document.documentElement.classList.remove("js-reveal");
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
