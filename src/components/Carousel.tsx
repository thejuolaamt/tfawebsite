"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";

/* ---- Tuning knobs ---- */
const SPEED = 45; // auto-scroll speed, pixels per second
const IDLE_MS = 3000; // resume auto-scroll after this long with no hand/mouse activity
const SETTLE_MS = 140; // how long a swipe must be still before we snap to a card

const noopSubscribe = () => () => {};

type Props = {
  children: ReactNode;
  /** Screen-reader name for the carousel, e.g. "Community leaders" */
  label: string;
  /** Gap between cards, as Tailwind classes */
  gapClass?: string;
};

export default function Carousel({
  children,
  label,
  gapClass = "gap-4 md:gap-5",
}: Props) {
  const items = Children.toArray(children);
  const n = items.length;

  // The first render (server) has ONE set of cards so search engines see
  // each card once. After the page loads in the browser we use THREE sets so
  // the carousel can loop forever in both directions.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const copies = mounted ? 3 : 1;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  // Everything the animation loop needs lives in refs (no re-renders)
  const s = useRef({
    pos: 0, // exact (fractional) scroll position
    lastInput: 0, // time of the last hand/mouse activity
    touching: false, // finger is down
    dragging: false, // mouse button is down
    moved: false, // pointer moved far enough to count as a drag, not a tap
    startX: 0,
    startScroll: 0,
    userMove: false, // the user (not autoplay) moved the carousel
    inView: true,
    wasBusy: false, // true while the user was recently active
    settleTimer: 0 as number | undefined,
  });

  const cards = () =>
    Array.from(
      scrollerRef.current?.querySelectorAll<HTMLElement>("[data-card]") ?? []
    );

  // Width of one full set of cards
  const period = useCallback(() => {
    const c = cards();
    return c.length > n ? c[n].offsetLeft - c[0].offsetLeft : 0;
  }, [n]);

  // Keep scroll position inside the middle set so it never runs out
  const wrap = useCallback(() => {
    const el = scrollerRef.current;
    const p = period();
    if (!el || !p) return 0;
    let shift = 0;
    if (el.scrollLeft >= p * 1.5) shift = -p;
    else if (el.scrollLeft < p * 0.5) shift = p;
    if (shift) {
      el.scrollLeft += shift;
      s.current.pos = el.scrollLeft;
      // keep the focused card focused (same card, one set over)
      setActive((a) => (a === null ? a : a + (shift / p) * n));
    }
    return shift;
  }, [period, n]);

  const nearestIndex = useCallback(() => {
    const el = scrollerRef.current;
    const c = cards();
    if (!el || !c.length) return 0;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    c.forEach((card, i) => {
      const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }, []);

  const centerOn = useCallback((i: number, smooth = true) => {
    const el = scrollerRef.current;
    const card = cards()[i];
    if (!el || !card) return;
    const target = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    el.scrollTo({ left: target, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const touch = () => {
    s.current.lastInput = performance.now();
  };

  /* ---------- Start in the middle set once cards are cloned ---------- */
  useEffect(() => {
    if (copies !== 3) return;
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollLeft = period();
    s.current.pos = el.scrollLeft;
  }, [copies, period]);

  /* ---------- Automatic movement ---------- */
  useEffect(() => {
    if (copies !== 3) return;
    const el = scrollerRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        s.current.inView = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    io.observe(el);

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      const st = s.current;
      const busy =
        st.touching || st.dragging || now - st.lastInput < IDLE_MS;

      if (busy) {
        st.wasBusy = true;
      } else if (st.inView && !document.hidden) {
        if (st.wasBusy) {
          // Idle long enough: unfocus the card and carry on from where we are
          st.wasBusy = false;
          st.userMove = false;
          st.pos = el.scrollLeft;
          setActive(null);
        }
        st.pos += SPEED * dt;
        el.scrollLeft = st.pos;
        wrap();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [copies, wrap]);

  /* ---------- When a swipe/drag stops: snap to the nearest card and focus it ---------- */
  const onScroll = () => {
    const st = s.current;
    window.clearTimeout(st.settleTimer);
    st.settleTimer = window.setTimeout(() => {
      if (!st.userMove || st.touching || st.dragging) return;
      wrap();
      const i = nearestIndex();
      const card = cards()[i];
      const el = scrollerRef.current;
      if (!card || !el) return;
      const target = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
      setActive(i);
      if (Math.abs(el.scrollLeft - target) > 2) {
        centerOn(i);
      } else {
        st.userMove = false;
        st.pos = el.scrollLeft;
      }
      touch();
    }, SETTLE_MS);
  };

  /* ---------- Finger (phones/tablets) ---------- */
  const onTouchStart = () => {
    const st = s.current;
    st.touching = true;
    st.userMove = true;
    st.pos = scrollerRef.current?.scrollLeft ?? st.pos;
    touch();
  };
  const onTouchEnd = () => {
    s.current.touching = false;
    touch();
  };

  /* ---------- Mouse: hover pauses, drag scrolls, click focuses ---------- */
  const onPointerDown = (e: React.PointerEvent) => {
    touch();
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const st = s.current;
    st.dragging = true;
    st.moved = false;
    st.startX = e.clientX;
    st.startScroll = scrollerRef.current?.scrollLeft ?? 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    touch();
    const st = s.current;
    if (!st.dragging || !scrollerRef.current) return;
    const dx = e.clientX - st.startX;
    if (Math.abs(dx) > 5) {
      st.moved = true;
      st.userMove = true;
    }
    if (st.moved) scrollerRef.current.scrollLeft = st.startScroll - dx;
  };
  const endDrag = () => {
    const st = s.current;
    if (!st.dragging) return;
    st.dragging = false;
    touch();
    // a drag finished: trigger the same "snap + focus" as a swipe
    if (st.moved) onScroll();
  };

  /* ---------- Tap / click on a card ---------- */
  const onCardClick = (i: number) => {
    const st = s.current;
    if (st.moved) {
      st.moved = false; // this click was the end of a drag, not a tap
      return;
    }
    touch();
    st.userMove = true;
    setActive(i);
    centerOn(i);
  };

  /* ---------- Trackpad / wheel, keyboard, arrows ---------- */
  const onWheel = (e: React.WheelEvent) => {
    touch();
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      s.current.userMove = true;
      s.current.pos = scrollerRef.current?.scrollLeft ?? s.current.pos;
    }
  };

  const step = (dir: 1 | -1) => {
    const st = s.current;
    touch();
    st.userMove = true;
    wrap();
    const base = active ?? nearestIndex();
    const next = base + dir;
    setActive(next);
    centerOn(next);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  return (
    <div className="relative mt-7 sm:mt-8 md:mt-12">
      <div
        ref={scrollerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onScroll={onScroll}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        className="relative cursor-grab select-none overflow-x-auto overscroll-x-contain py-6 [scrollbar-width:none] [-ms-overflow-style:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden [&_img]:pointer-events-none"
      >
        <div className={`flex w-max ${gapClass}`}>
          {Array.from({ length: copies }, (_, copy) =>
            items.map((item, j) => {
              const i = copy * n + j;
              const isActive = active === i;
              const dimOthers = active !== null && !isActive;
              return (
                <div
                  key={`${copy}-${j}`}
                  data-card
                  aria-hidden={copy === 0 && copies === 1 ? undefined : copy !== 1}
                  onClick={() => onCardClick(i)}
                  className={`flex shrink-0 origin-center transition-[transform,opacity] duration-500 ease-out ${
                    isActive
                      ? "z-10 scale-[1.07] opacity-100"
                      : dimOthers
                        ? "scale-[0.95] opacity-70"
                        : ""
                  }`}
                >
                  {item}
                </div>
              );
            })
          )}
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
