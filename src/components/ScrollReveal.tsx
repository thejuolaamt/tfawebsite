"use client";

import { useLayoutEffect } from "react";

export default function ScrollReveal() {
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("js-reveal");

    const sections = document.querySelectorAll("section");

    sections.forEach((section) => {
      const items = section.querySelectorAll("h1, h2, p, [data-stagger] > *");
      let index = 0;
      items.forEach((el) => {
        const group = el.closest("[data-stagger]");
        const isGroupChild = el.parentElement?.hasAttribute("data-stagger");
        if (group && !isGroupChild) return;
        el.setAttribute("data-reveal", "");
        (el as HTMLElement).style.setProperty("--d", `${index * 130}ms`);
        index++;
      });
    });

    // Reveal as soon as any part of a section is on screen, so tall
    // sections (which can never be 20% visible) still appear.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          } else {
            entry.target.classList.remove("in-view");
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px" }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("js-reveal");
    };
  }, []);

  return null;
}
