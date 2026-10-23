"use client";

import { useEffect, useState } from "react";
import { REGISTRATION_OPENS_AT } from "@/lib/workshop";
import { WORKSHOP_URL } from "@/lib/links";

const TARGET = new Date(REGISTRATION_OPENS_AT).getTime();

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function Box({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[28px] border border-paper/25 px-3 py-5 text-center md:px-6 md:py-8">
      <p className="font-display text-4xl font-extrabold leading-none tabular-nums md:text-7xl">
        {value}
      </p>
      <p className="eyebrow mt-3 text-blush">{label}</p>
    </div>
  );
}

export default function WorkshopCountdown() {
  // null until the page is in the browser, so server and browser always agree
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  // Registration is open: show the real button
  if (now !== null && now >= TARGET) {
    return (
      <div className="mt-10">
        <p className="font-display text-3xl font-extrabold leading-tight md:text-5xl">
          Registration is open.
        </p>
        <p className="mt-3 max-w-xl text-base text-cream/85 md:text-lg">
          Your seat is waiting. Tap below to register for The Fine Artist Workshop.
        </p>
        <a
          href={WORKSHOP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex min-h-13 items-center justify-center rounded-full bg-cream px-7 text-base font-bold text-crimson transition hover:bg-paper"
        >
          Register for Workshop
        </a>
      </div>
    );
  }

  const left = now === null ? null : TARGET - now;
  const days = left === null ? "--" : pad(Math.floor(left / 86400000));
  const hours = left === null ? "--" : pad(Math.floor((left % 86400000) / 3600000));
  const minutes = left === null ? "--" : pad(Math.floor((left % 3600000) / 60000));
  const seconds = left === null ? "--" : pad(Math.floor((left % 60000) / 1000));

  return (
    <div className="mt-10">
      <p className="eyebrow text-blush">Registration opens in</p>
      <div role="timer" className="mt-4 grid grid-cols-4 gap-2 md:gap-4">
        <Box value={days} label="Days" />
        <Box value={hours} label="Hours" />
        <Box value={minutes} label="Minutes" />
        <Box value={seconds} label="Seconds" />
      </div>
      <p className="mt-6 text-[15px] leading-relaxed text-cream/85">
        Opens Monday, 26 October 2026 at 12:00 AM, Nigeria time.
      </p>
    </div>
  );
}
