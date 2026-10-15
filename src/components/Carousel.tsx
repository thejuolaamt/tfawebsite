"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

type Props = {
  children: ReactNode;
  /** Screen-reader name for the carousel, e.g. "Community leaders" */
  label: string;
  /** Gap between cards, as Tailwind classes */
  gapClass?: string;
  /** Milliseconds between automatic moves. Use 0 to turn autoplay off. */
  interval?: number;
};

/**
 * Native scroll-snap carousel with gentle autoplay.
 * - Moves one card every `interval` ms, then loops back to the start.
 * - Only runs while the carousel is on screen and the tab is visible.
 * - Pauses on mouse hover, keyboard focus, touch, swipe or wheel,
 *   then resumes a few seconds later.
 * - Respects "reduce motion" system settings.
 */
export default function Carousel({
  children,
  label,
  gapClass = "gap-4 md:gap-5",
  interval = 3500,
}: Props) {
  const items = Children.toArray(children);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const visibleRef = useRef(false);
  const resumeAtRef = useRef(0);

  const holdAutoplay = () => {
    resumeAtRef.current = Date.now() + 6000;
  };

  const step = useCallback((dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const width = card ? card.offsetWidth : el.clientWidth * 0.8;
    const gap =
      parseFloat(getComputedStyle(el.firstElementChild!).columnGap) || 16;

    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    const atStart = el.scrollLeft <= 8;

    if (dir === 1 && atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (dir === -1 && atStart) {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    } else {
      el.scrollBy({ left: dir * (width + gap), behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !interval) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.3 }
    );
    io.observe(el);

    const id = window.setInterval(() => {
      if (document.hidden) return;
      if (!visibleRef.current) return;
      if (hoverRef.current || focusRef.current) return;
      if (Date.now() < resumeAtRef.current) return;
      step(1);
    }, interval);

    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [interval, step]);

  return (
    <div
      className="relative mt-7 sm:mt-8 md:mt-12"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") hoverRef.current = true;
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") hoverRef.current = false;
      }}
      onPointerDown={holdAutoplay}
      onTouchStart={holdAutoplay}
      onWheel={holdAutoplay}
    >
      <div
        ref={scrollerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onFocus={(e) => {
          if (e.currentTarget.matches(":focus-visible")) focusRef.current = true;
        }}
        onBlur={() => {
          focusRef.current = false;
        }}
        className="snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-px-4 px-4 py-6 [scrollbar-width:none] [-ms-overflow-style:none] sm:scroll-px-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        <div className={`flex w-max ${gapClass}`}>
          {items.map((item, i) => (
            <div key={i} data-card className="flex shrink-0 snap-start">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Arrow buttons for mouse users */}
      <div className="mt-2 hidden justify-end gap-2 md:flex">
        <button
          type="button"
          onClick={() => {
            holdAutoplay();
            step(-1);
          }}
          aria-label="Previous card"
          className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-current text-lg font-bold transition hover:opacity-70"
        >
          &larr;
        </button>
        <button
          type="button"
          onClick={() => {
            holdAutoplay();
            step(1);
          }}
          aria-label="Next card"
          className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-current text-lg font-bold transition hover:opacity-70"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
}
