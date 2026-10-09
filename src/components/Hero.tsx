import type { CSSProperties } from "react";

const CREAM = "#F8F6DF";

function ring(cx: number, cy: number, r: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return {
      x: Math.round((cx + r * Math.cos(a)) * 10) / 10,
      y: Math.round((cy + r * Math.sin(a)) * 10) / 10,
    };
  });
}

function Gathering({
  cx,
  cy,
  r,
  n,
}: {
  cx: number;
  cy: number;
  r: number;
  n: number;
}) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={CREAM}
        strokeOpacity="0.2"
      />
      {ring(cx, cy, r, n).map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i % 4 === 0 ? 6 : 3.5}
          fill={CREAM}
          fillOpacity={i % 4 === 0 ? 0.6 : 0.35}
        />
      ))}
    </g>
  );
}

function Shapes() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Wide screens */}
      <svg
        className="hidden h-full w-full md:block"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g className="float-slow">
          <circle cx="1040" cy="150" r="150" fill="none" stroke={CREAM} strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="950" cy="230" r="70" fill={CREAM} fillOpacity="0.12" />
          <circle cx="1120" cy="300" r="12" fill={CREAM} fillOpacity="0.5" />
        </g>
        <g className="float-slow float-delay">
          <circle cx="140" cy="660" r="130" fill="none" stroke={CREAM} strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="235" cy="590" r="60" fill={CREAM} fillOpacity="0.12" />
          <circle cx="75" cy="540" r="12" fill={CREAM} fillOpacity="0.5" />
        </g>
        <Gathering cx={200} cy={170} r={44} n={10} />
        <Gathering cx={1010} cy={640} r={44} n={10} />
      </svg>

      {/* Phones */}
      <svg
        className="h-full w-full md:hidden"
        viewBox="0 0 400 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g className="float-slow">
          <circle cx="340" cy="120" r="80" fill="none" stroke={CREAM} strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="290" cy="170" r="40" fill={CREAM} fillOpacity="0.12" />
          <circle cx="372" cy="215" r="8" fill={CREAM} fillOpacity="0.5" />
        </g>
        <g className="float-slow float-delay">
          <circle cx="60" cy="700" r="80" fill="none" stroke={CREAM} strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="112" cy="650" r="40" fill={CREAM} fillOpacity="0.12" />
          <circle cx="28" cy="600" r="8" fill={CREAM} fillOpacity="0.5" />
        </g>
        <Gathering cx={70} cy={175} r={30} n={8} />
        <Gathering cx={330} cy={690} r={30} n={8} />
      </svg>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-crimson px-6 text-center text-cream"
    >
      <Shapes />

      <div className="relative z-10 mx-auto max-w-4xl">
        <p className="mb-5 text-xs uppercase tracking-[0.35em] text-cream/70 md:text-sm">
          Welcome to
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl">
          The Fine Artist Community
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-cream/85 md:mt-8 md:text-xl">
          A home for artists to create, exhibit, and grow together.
        </p>
        <div
          data-reveal
          style={{ "--d": "520ms" } as CSSProperties}
          className="mt-10"
        >
          <a
            href="#about"
            className="inline-block rounded-full bg-cream px-7 py-3 text-sm font-medium text-crimson transition hover:bg-paper"
          >
            Discover TFA
          </a>
        </div>
      </div>
    </section>
  );
}
