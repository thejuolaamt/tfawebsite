"use client";

import { Children, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Screen-reader name for the carousel, e.g. "Community leaders" */
  label: string;
  /** Gap between cards, as Tailwind classes */
  gapClass?: string;
};

/**
 * Native, browser-driven carousel.
 * - No autoplay, no requestAnimationFrame loop, no JS touch/wheel handlers.
 *   The browser handles every swipe on its own thread, so vertical page
 *   scrolling over the carousel stays smooth on phones.
 * - CSS scroll-snap gives the "lands on a card" feel.
 * - Each card renders once (good for SEO and fewer DOM nodes).
 */
export default function Carousel({
  children,
  label,
  gapClass = "gap-4 md:gap-5",
}: Props) {
  const items = Children.toArray(children);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const step = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const width = card ? card.offsetWidth : el.clientWidth * 0.8;
    const gap = parseFloat(getComputedStyle(el.firstElementChild!).columnGap) || 16;
    el.scrollBy({ left: dir * (width + gap), behavior: "smooth" });
  };

  return (
    <div className="relative mt-7 sm:mt-8 md:mt-12">
      <div
        ref={scrollerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
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
          onClick={() => step(-1)}
          aria-label="Previous card"
          className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-current text-lg font-bold transition hover:opacity-70"
        >
          &larr;
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next card"
          className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-current text-lg font-bold transition hover:opacity-70"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
}
