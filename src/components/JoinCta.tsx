import { JOIN_URL, WORKSHOP_URL } from "@/lib/links";

export default function JoinCta() {
  return (
    <section id="join" className="bg-cream px-4 py-16 text-center text-ink sm:px-6 md:py-28">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-[2.3rem] font-extrabold leading-none text-crimson sm:text-[44px] md:text-7xl">
          Your seat is ready.
        </h2>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={JOIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-13 items-center justify-center rounded-full bg-crimson px-7 text-base font-bold text-cream transition hover:bg-crimson-deep"
          >
            Become a Member
          </a>
          <a href={WORKSHOP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-13 items-center justify-center rounded-full border-[1.5px] border-crimson px-7 text-base font-bold text-crimson transition hover:bg-crimson hover:text-cream">Register for Workshop</a>
        </div>
        <p className="mt-8 text-sm text-muted">
          The Fine Artist Community. 
          Home of creative inclusiveness.
        </p>
      </div>
    </section>
  );
}

