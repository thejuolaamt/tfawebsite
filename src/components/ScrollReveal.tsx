"use client";

import { useLayoutEffect } from "react";

const DURATION = 800; // ms for one section change
const GESTURE_GAP = 120; // ms of "silence" that marks a new wheel gesture
const EDGE = 2; // px tolerance for "at the edge of a section"

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export default function ScrollReveal() {
  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main > section")
    );
    if (!sections.length) return;

    /* ---------- 1. Reveal animations ---------- */
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
          (el as HTMLElement).style.setProperty("--d", `${index * 130}ms`);
          index++;
        });
      });

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle("in-view", entry.isIntersecting);
          });
        },
        { rootMargin: "0px 0px -12% 0px" }
      );
      sections.forEach((section) => observer!.observe(section));
    }

    /* ---------- 2. Controlled one-section-per-scroll ---------- */
    let animating = false;
    let rafId = 0;
    let lastWheelTime = 0;

    const topOf = (s: HTMLElement) => s.getBoundingClientRect().top + window.scrollY;

    // Section that currently fills the middle of the screen
    const currentIndex = () => {
      const mid = window.scrollY + window.innerHeight / 2;
      for (let i = 0; i < sections.length; i++) {
        const t = topOf(sections[i]);
        if (mid >= t && mid < t + sections[i].offsetHeight) return i;
      }
      return mid < topOf(sections[0]) ? 0 : sections.length - 1;
    };

    // Sections taller than the screen scroll normally until you hit their edge.
    const atBottomEdge = (s: HTMLElement) =>
      s.getBoundingClientRect().bottom <= window.innerHeight + EDGE;
    const atTopEdge = (s: HTMLElement) => s.getBoundingClientRect().top >= -EDGE;

    const canAdvance = (dir: 1 | -1) => {
      const i = currentIndex();
      const s = sections[i];
      if (dir === 1) return i < sections.length - 1 && atBottomEdge(s);
      return i > 0 && atTopEdge(s);
    };

    const animateTo = (target: number) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = Math.max(0, Math.min(target, max));
      cancelAnimationFrame(rafId);

      if (reduceMotion) {
        window.scrollTo(0, target);
        return;
      }

      animating = true;
      const start = window.scrollY;
      const dist = target - start;
      const t0 = performance.now();

      const step = (now: number) => {
        const p = Math.min((now - t0) / DURATION, 1);
        window.scrollTo(0, start + dist * easeInOut(p));
        if (p < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          animating = false;
        }
      };
      rafId = requestAnimationFrame(step);
    };

    const step = (dir: 1 | -1) => {
      const i = currentIndex();
      const next = sections[i + dir];
      if (!next) return;
      if (dir === 1) {
        animateTo(topOf(next));
      } else {
        // Going up into a tall section: land on its bottom, not its top
        const bottomAligned = topOf(next) + next.offsetHeight - window.innerHeight;
        animateTo(Math.max(topOf(next), bottomAligned));
      }
    };

    const goToId = (id: string) => {
      const el = id ? document.getElementById(id) : sections[0];
      if (el) animateTo(topOf(el));
    };

    /* Mouse wheel / trackpad */
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      const now = performance.now();
      const gap = now - lastWheelTime;
      lastWheelTime = now;

      if (animating) {
        e.preventDefault();
        return;
      }
      if (Math.abs(e.deltaY) < 4) return;

      const dir: 1 | -1 = e.deltaY > 0 ? 1 : -1;

      // Still inside a tall section (or at page start/end) -> normal scrolling
      if (!canAdvance(dir)) return;

      e.preventDefault();

      // Same gesture still going (trackpad inertia) -> ignore, wait for a fresh one
      if (gap < GESTURE_GAP) return;

      step(dir);
    };

    /* Touch swipes */
    let touchY = 0;
    let startedAtEdge = { down: false, up: false };

    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      touchY = e.touches[0].clientY;
      const s = sections[currentIndex()];
      startedAtEdge = { down: atBottomEdge(s), up: atTopEdge(s) };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      if (animating) {
        e.preventDefault();
        return;
      }
      const dy = e.touches[0].clientY - touchY;
      const dir: 1 | -1 = dy < 0 ? 1 : -1;
      if (canAdvance(dir)) e.preventDefault(); // we'll page; don't drag the page
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (animating || !e.changedTouches[0]) return;
      const dy = e.changedTouches[0].clientY - touchY;
      if (Math.abs(dy) < 50) return;
      const dir: 1 | -1 = dy < 0 ? 1 : -1;
      const wasAtEdge = dir === 1 ? startedAtEdge.down : startedAtEdge.up;
      if (wasAtEdge && canAdvance(dir)) step(dir);
    };

    /* Keyboard */
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(el.tagName)) return;
      if (el?.isContentEditable) return;

      let dir: 1 | -1 | 0 = 0;
      if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) dir = 1;
      else if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) dir = -1;
      else if (e.key === "Home") {
        e.preventDefault();
        if (!animating) animateTo(0);
        return;
      } else if (e.key === "End") {
        e.preventDefault();
        if (!animating) animateTo(document.documentElement.scrollHeight);
        return;
      }
      if (!dir) return;
      if (animating) {
        e.preventDefault();
        return;
      }
      if (canAdvance(dir)) {
        e.preventDefault();
        step(dir);
      }
    };

    /* Nav links (#story, #about, ...) use the same animation */
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      if (id && !document.getElementById(id)) return;
      e.preventDefault();
      goToId(id);
    };

    /* Keep alignment after resize / rotation */
    const onResize = () => {
      if (animating) return;
      animateTo(topOf(sections[currentIndex()]));
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
      document.documentElement.classList.remove("js-reveal");
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}