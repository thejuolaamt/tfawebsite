"use client";

import { useLayoutEffect } from "react";

export default function ScrollReveal() {
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("js-reveal");

    const sections = Array.from(document.querySelectorAll("main > section"));

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

    let isAnimating = false;
    let touchStartY = 0;

    const findCurrentSectionIndex = () => {
      if (!sections.length) return 0;

      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      sections.forEach((section, index) => {
        const distance = Math.abs(section.getBoundingClientRect().top);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      return nearestIndex;
    };

    const goToSection = (index: number) => {
      if (!sections[index] || isAnimating) return;
      isAnimating = true;
      sections[index].scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        isAnimating = false;
      }, 700);
    };

    const handleWheel = (event: WheelEvent) => {
      if (!sections.length || isAnimating) return;
      if (Math.abs(event.deltaY) < 10) return;

      event.preventDefault();

      const currentIndex = findCurrentSectionIndex();
      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = Math.min(
        Math.max(currentIndex + direction, 0),
        sections.length - 1
      );

      if (nextIndex !== currentIndex) {
        goToSection(nextIndex);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches[0]) {
        touchStartY = event.touches[0].clientY;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!event.touches[0] || isAnimating) return;

      const deltaY = event.touches[0].clientY - touchStartY;
      if (Math.abs(deltaY) < 30) return;

      event.preventDefault();

      const currentIndex = findCurrentSectionIndex();
      const direction = deltaY < 0 ? 1 : -1;
      const nextIndex = Math.min(
        Math.max(currentIndex + direction, 0),
        sections.length - 1
      );

      if (nextIndex !== currentIndex) {
        touchStartY = event.touches[0].clientY;
        goToSection(nextIndex);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("js-reveal");
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return null;
}
