"use client";

import { useLayoutEffect } from "react";

export default function ScrollReveal() {
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("js-reveal");

    const sections = document.querySelectorAll("section");

    sections.forEach((section) => {
      const items = section.querySelectorAll("h1, h2, p, .grid > *");
      let index = 0;
      items.forEach((el) => {
        const insideGrid = el.closest(".grid");
        const isGridChild = el.parentElement?.classList.contains("grid");
        if (insideGrid && !isGridChild) return;
        el.setAttribute("data-reveal", "");
        (el as HTMLElement).style.setProperty("--d", `${index * 130}ms`);
        index++;
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.2) {
            entry.target.classList.add("in-view");
          } else if (!entry.isIntersecting) {
            entry.target.classList.remove("in-view");
          }
        });
      },
      { threshold: [0, 0.2] }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("js-reveal");
    };
  }, []);

  return null;
}
