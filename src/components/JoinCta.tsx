import Link from "next/link";
import { JOIN_URL } from "@/lib/links";
import { WORKSHOP } from "@/lib/events";
import { VisitorOnly, MemberOnly } from "@/components/AuthGate";

export default function JoinCta() {
  return (
    <section id="join" className="bg-cream px-4 py-16 text-center text-ink sm:px-6 md:py-28">
      <div className="mx-auto max-w-3xl">
        {/* What visitors see */}
        <VisitorOnly>
          <h2 className="text-[2.3rem] font-extrabold leading-none text-crimson sm:text-[44px] md:text-7xl">
            Your seat is ready.
          </h2>
          <p className="mt-5 text-base text-muted md:text-lg">
            Free to join. Open to artists of every level.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={JOIN_URL}
              className="inline-flex min-h-13 items-center justify-center rounded-full bg-crimson px-7 text-base font-bold text-cream transition hover:bg-crimson-deep"
            >
              Become a Member
            </Link>
            {WORKSHOP.open ? (
              <Link href="/workshop" className="inline-flex min-h-13 items-center justify-center rounded-full border-[1.5px] border-crimson px-7 text-base font-bold text-crimson transition hover:bg-crimson hover:text-cream"
              >
                Register for Workshop</Link>
            ) : (
              <Link
                href="/events"
                className="inline-flex min-h-13 items-center justify-center rounded-full border-[1.5px] border-crimson px-7 text-base font-bold text-crimson transition hover:bg-crimson hover:text-cream"
              >
                See events
              </Link>
            )}
          </div>
        </VisitorOnly>

        {/* What logged-in members see */}
        <MemberOnly>
          <h2 className="text-[2.3rem] font-extrabold leading-none text-crimson sm:text-[44px] md:text-7xl">
            You are part of TFA.
          </h2>
          <p className="mt-5 text-base text-muted md:text-lg">
            Share art materials, read the blog, or add to your portfolio.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/materials"
              className="inline-flex min-h-13 items-center justify-center rounded-full bg-crimson px-7 text-base font-bold text-cream transition hover:bg-crimson-deep"
            >
              Materials sharing
            </Link>
            <Link
              href="/account"
              className="inline-flex min-h-13 items-center justify-center rounded-full border-[1.5px] border-crimson px-7 text-base font-bold text-crimson transition hover:bg-crimson hover:text-cream"
            >
              My account
            </Link>
          </div>
        </MemberOnly>
      </div>
    </section>
  );
}
