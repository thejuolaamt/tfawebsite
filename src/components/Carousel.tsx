"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

type Props = {
  children: ReactNode;
  /** Screen-reader name for the carousel, e.g. "Community leaders" */
  label: string;
  /** Gap between cards, as Tailwind classes */
  gapClass?: string;
  /** Drift speed in pixels per second. Use 0 to turn the drift off. */
  speed?: number;
};

// After the visitor stops touching, the drift waits this long, then restarts
const RESUME_MS = 2500;

/**
 * Carousel that drifts left slowly and smoothly, in an endless loop.
 * - Still works by hand: swipe, trackpad, mouse drag, arrow buttons, keyboard.
 * - Pauses on mouse hover, keyboard focus, touch and any manual scroll,
 *   then restarts a moment later.
 * - Only runs while the carousel is on screen and the tab is visible.
 * - Stays still for people who turned on "reduce motion".
 */
export default function Carousel({
  children,
  label,
  gapClass = "gap-4 md:gap-5",
  speed = 45,
}: Props) {
  const items = Children.toArray(children);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cloneStartRef = useRef<HTMLDivElement>(null);

  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const downRef = useRef(false);
  const visibleRef = useRef(false);
  const resumeAtRef = useRef(0);
  const posRef = useRef(0);
  const loopWRef = useRef(0);

  const dragRef = useRef<{ x: number; left: number } | null>(null);
  const movedRef = useRef(false);

  // A second copy of the cards is added after the page loads, to make the endless loop
  const [looping, setLooping] = useState(false);

  const holdAutoplay = () => {
    resumeAtRef.current = performance.now() + RESUME_MS;
  };

  // Turn the drift on, unless the visitor asked for less motion
  useEffect(() => {
    if (!speed) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setLooping(!mq.matches);
    const first = setTimeout(sync, 0);
    mq.addEventListener("change", sync);
    return () => {
      clearTimeout(first);
      mq.removeEventListener("change", sync);
    };
  }, [speed]);

  // The drift itself
  useEffect(() => {
    if (!looping) {
      loopWRef.current = 0;
      return;
    }
    const el = scrollerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    // Width of one full set of cards (including the gap)
    const measure = () => {
      const first = track.querySelector<HTMLElement>("[data-card]");
      const clone = cloneStartRef.current;
      loopWRef.current = first && clone ? clone.offsetLeft - first.offsetLeft : 0;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    io.observe(el);

    posRef.current = el.scrollLeft;
    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      const w = loopWRef.current;

      if (visibleRef.current && !document.hidden && w > 0) {
        const cur = el.scrollLeft;

        // If the position is not where we left it, the visitor moved it by hand
        if (Math.abs(cur - posRef.current) > 1.5) {
          posRef.current = cur;
          resumeAtRef.current = now + RESUME_MS;
        }

        const paused =
          hoverRef.current ||
          focusRef.current ||
          downRef.current ||
          now < resumeAtRef.current;

        if (paused) {
          posRef.current = cur;
          // Visitor went past the first set: jump back (the cards look identical)
          if (cur >= w && !downRef.current) {
            el.scrollLeft = cur - w;
            posRef.current = cur - w;
          }
        } else {
          let next = posRef.current + (speed * dt) / 1000;
          if (next >= w) next -= w;
          posRef.current = next;
          el.scrollLeft = next;
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [looping, speed]);

  // Arrow buttons: one card at a time
  const step = useCallback((dir: 1 | -1) => {
    const el = scrollerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const width = card ? card.offsetWidth : el.clientWidth * 0.8;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
    const loopW = loopWRef.current;
    const atStart = el.scrollLeft <= 8;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;

    if (loopW > 0) {
      if (dir === -1 && atStart) el.scrollLeft = loopW;
      el.scrollBy({ left: dir * (width + gap), behavior: "smooth" });
    } else if (dir === 1 && atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (dir === -1 && atStart) {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    } else {
      el.scrollBy({ left: dir * (width + gap), behavior: "smooth" });
    }
  }, []);

  // Mouse drag (touch swipe already works by itself)
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    downRef.current = true;
    if (e.pointerType === "mouse" && e.button === 0) {
      dragRef.current = { x: e.clientX, left: e.currentTarget.scrollLeft };
      movedRef.current = false;
    }
  };

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || e.buttons !== 1) return;
    const dx = e.clientX - d.x;
    if (!movedRef.current && Math.abs(dx) > 5) {
      movedRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (movedRef.current) e.currentTarget.scrollLeft = d.left - dx;
  };

  const onUp = () => {
    downRef.current = false;
    dragRef.current = null;
    holdAutoplay();
  };

  // After a drag, do not open the link under the mouse
  const onClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      movedRef.current = false;
    }
  };

  return (
    <div
      className="relative mt-7 sm:mt-8 md:mt-12"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") hoverRef.current = true;
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") hoverRef.current = false;
      }}
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
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className="overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 py-6 sm:px-0 md:cursor-grab [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div ref={trackRef} className={`flex w-max ${gapClass}`}>
          {items.map((item, i) => (
            <div key={i} data-card className="flex shrink-0">
              {item}
            </div>
          ))}

          {/* Second copy for the endless loop. Hidden from screen readers and the keyboard. */}
          {looping &&
            items.map((item, i) => (
              <div
                key={`copy-${i}`}
                ref={i === 0 ? cloneStartRef : undefined}
                aria-hidden="true"
                inert
                className="flex shrink-0"
              >
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
