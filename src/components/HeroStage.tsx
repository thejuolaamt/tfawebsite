"use client";

import { useEffect, useState } from "react";

// The words that type out after "A home for". Change them here.
const WORDS = [
  "painters",
  "sculptors",
  "illustrators",
  "designers",
  "photographers",
  "art educators",
  "beginners",
  "every artist",
];

const WELCOME_MS = 4000; // how long the welcome slide stays
const TYPE_MS = 85; // speed of typing each letter
const DELETE_MS = 45; // speed of deleting each letter
const HOLD_MS = 1600; // how long a finished word stays
const GAP_MS = 350; // short pause before the next word

type Phase = "welcome" | "typing";

export default function HeroStage() {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [t, setT] = useState({ i: 0, n: 0, deleting: false });
  const [reduced, setReduced] = useState(false);

  // People who set "reduce motion" only see the welcome slide, still
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const first = setTimeout(() => setReduced(mq.matches), 0);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => {
      clearTimeout(first);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  useEffect(() => {
    if (reduced) return;
    let delay: number;
    let action: () => void;

    if (phase === "welcome") {
      delay = WELCOME_MS;
      action = () => {
        setT({ i: 0, n: 0, deleting: false });
        setPhase("typing");
      };
    } else {
      const word = WORDS[t.i];
      const isLast = t.i === WORDS.length - 1;
      if (!t.deleting && t.n < word.length) {
        delay = TYPE_MS;
        action = () => setT({ ...t, n: t.n + 1 });
      } else if (!t.deleting) {
        delay = HOLD_MS;
        action = isLast ? () => setPhase("welcome") : () => setT({ ...t, deleting: true });
      } else if (t.n > 0) {
        delay = DELETE_MS;
        action = () => setT({ ...t, n: t.n - 1 });
      } else {
        delay = GAP_MS;
        action = () => setT({ i: t.i + 1, n: 0, deleting: false });
      }
    }

    const timer = setTimeout(action, delay);
    return () => clearTimeout(timer);
  }, [phase, t, reduced]);

  const view: Phase = reduced ? "welcome" : phase;
  const shown = WORDS[t.i].slice(0, t.n);

  return (
    <div className="grid">
      {/* Slide 1: welcome */}
      <div
        className={`col-start-1 row-start-1 transition-all duration-700 ease-out ${
          view === "welcome" ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        }`}
      >
        <p className="mb-4 text-[10px] uppercase tracking-[0.32em] text-cream/70 sm:text-xs md:mb-5 md:text-sm">
          Welcome to
        </p>
        <h1 className="text-[2.5rem] font-bold leading-[0.9] tracking-[-0.06em] sm:text-5xl sm:leading-[0.94] md:text-7xl md:leading-[0.9]">
          The Fine Artist Community
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm text-cream/85 sm:text-base md:mt-8 md:text-xl">
          Home of creative inclusiveness.
        </p>
      </div>

      {/* Slide 2: "A home for" + typing word */}
      <div
        className={`col-start-1 row-start-1 flex flex-col items-center justify-center transition-all duration-700 ease-out ${
          view === "typing" ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        {/* Screen readers get the full list once, with no flicker */}
        <span className="sr-only">A home for {WORDS.join(", ")}</span>
        <p
          aria-hidden="true"
          className="text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl md:whitespace-nowrap md:text-5xl lg:text-6xl"
        >
          <span className="block text-cream/85 md:inline">A home for</span>{" "}
          <span className="block min-h-[1.25em] text-blush md:inline">
            {shown}
            <span className="ml-1 inline-block h-[0.85em] w-[3px] translate-y-[0.08em] animate-pulse bg-cream" />
          </span>
        </p>
      </div>
    </div>
  );
}
