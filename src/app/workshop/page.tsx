import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WorkshopCountdown from "@/components/WorkshopCountdown";
import { VisitorOnly, MemberOnly } from "@/components/AuthGate";
import { JOIN_URL } from "@/lib/links";
import { WORKSHOP } from "@/lib/events";

export const metadata: Metadata = {
  title: "Workshop Registration",
  description:
    "Registration for The Fine Artist Workshop opens Monday 26 October 2026. Join the countdown with The Fine Artist Community.",
  alternates: { canonical: "/workshop" },
};

export default function WorkshopPage() {
  return (
    <>
      <Navbar />
      <main className="text-ink">
        <div className="relative overflow-hidden bg-crimson-deep px-6 pb-16 pt-28 text-cream md:pb-28 md:pt-40">
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border border-cream/15" />
          <div className="pointer-events-none absolute -right-8 -top-8 size-48 rounded-full border border-cream/15" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full border border-cream/10" />

          <div className="relative mx-auto max-w-4xl">
            <p className="eyebrow text-blush">Workshop</p>
            <h1 className="mt-3 text-[2.4rem] font-extrabold leading-[1.02] md:text-7xl">
              {WORKSHOP.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-cream/85 md:text-xl">
              Registration is almost here. Come back when the clock hits zero and your
              seat will be waiting.
            </p>

            <WorkshopCountdown />

            <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px]">
              <Link
                href="/events"
                className="font-bold text-cream underline underline-offset-4 hover:text-paper"
              >
                See all events
              </Link>
              <VisitorOnly>
                <Link
                  href={JOIN_URL}
                  className="font-bold text-cream underline underline-offset-4 hover:text-paper"
                >
                  Become a member to hear first
                </Link>
              </VisitorOnly>
              <MemberOnly>
                <Link
                  href="/feed"
                  className="font-bold text-cream underline underline-offset-4 hover:text-paper"
                >
                  Back to the community feed
                </Link>
              </MemberOnly>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
