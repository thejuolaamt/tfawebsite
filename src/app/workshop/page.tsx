import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Photo from "@/components/Photo";
import WorkshopCountdown from "@/components/WorkshopCountdown";
import { VisitorOnly, MemberOnly } from "@/components/AuthGate";
import { JOIN_URL } from "@/lib/links";
import { WORKSHOP } from "@/lib/events";

export const metadata: Metadata = {
  title: "Workshop Registration",
  description:
    "Details and registration for the TFA Community Workshop, a hands-on drawing session from The Fine Artist Community.",
  alternates: { canonical: "/workshop" },
};

export default function WorkshopPage() {
  return (
    <>
      <Navbar />
      <main className="bg-cream text-ink">
        {/* 1. Title and first picture */}
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 pb-10 pt-28 md:grid-cols-2 md:gap-14 md:pb-16 md:pt-36">
          <div>
            <p className="eyebrow text-crimson">Workshop</p>
            <h1 className="mt-3 text-[2.4rem] font-extrabold leading-[1.02] md:text-6xl">
              {WORKSHOP.title}
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted md:text-lg">
              A hands-on drawing session where we slow down and learn to see.
              Every drawing starts with the eye.
            </p>
          </div>

          <Photo
            src="/images/workshop/eye-in-progress.jpeg"
            alt="A charcoal portrait in progress. One eye is finished and the rest of the face is still in outline."
            sizes="(min-width: 768px) 50vw, 100vw"
            loading="eager"
            className="aspect-[3/2] rounded-[28px]"
          />
        </div>

        {/* 2. Registration (countdown, then the register button) */}
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-[28px] bg-crimson-deep p-6 text-cream md:p-10">
            <p className="eyebrow text-blush">Registration</p>
            <div className="[&>div]:mt-4">
              <WorkshopCountdown />
            </div>
          </div>
        </div>

        {/* 3. Details and second picture */}
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-2 md:gap-14 md:py-24">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
              The details
            </h2>

            <dl className="mt-6 divide-y divide-line border-y border-line">
              {WORKSHOP.details.map((d) => (
                <div
                  key={d.label}
                  className="flex items-baseline justify-between gap-6 py-4"
                >
                  <dt className="eyebrow text-muted">{d.label}</dt>
                  <dd className="text-right text-[15px] md:text-base">
                    <span className={d.value ? "font-bold text-ink" : "text-muted"}>
                      {d.value || "To be announced"}
                    </span>
                    {d.label === "Price" && (
                      <span className="mt-1 flex flex-col items-end gap-2">
                        <span className="font-bold text-crimson">
                          {WORKSHOP.memberNote}
                        </span>
                        <VisitorOnly>
                          <Link
                            href={JOIN_URL}
                            className="inline-flex min-h-10 items-center justify-center rounded-full bg-crimson px-5 text-sm font-bold text-cream transition hover:bg-crimson-deep"
                          >
                            Become a member
                          </Link>
                        </VisitorOnly>
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex items-center gap-4">
              <Photo
                src={WORKSHOP.tutor.image}
                alt={WORKSHOP.tutor.name}
                sizes="64px"
                className="size-16 shrink-0 rounded-full"
              />
              <div>
                <p className="eyebrow text-muted">Your tutor</p>
                <p className="mt-1 text-lg font-bold leading-tight">
                  {WORKSHOP.tutor.name}
                </p>
                <p className="text-sm text-muted">{WORKSHOP.tutor.bio}</p>
              </div>
            </div>

            {WORKSHOP.learn.length > 0 && (
              <>
                <h3 className="mt-10 text-xl font-bold md:text-2xl">
                  What you will learn
                </h3>
                <ul className="mt-4 space-y-3 text-[15px] leading-relaxed md:text-base">
                  {WORKSHOP.learn.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-crimson"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <figure>
            <Photo
              src="/images/workshop/closed-eye.jpeg"
              alt="A close-up graphite drawing of a closed eye with finely drawn lashes and skin texture."
              sizes="(min-width: 768px) 50vw, 100vw"
              className="aspect-[4/3] rounded-[28px]"
            />
            <figcaption className="mt-3 text-sm text-muted">
              Sample artwork from the workshop.
            </figcaption>
          </figure>
        </div>

        {/* 4. Quiet links */}
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 pb-16 text-[15px] md:pb-24">
          <Link
            href="/events"
            className="font-bold text-crimson underline underline-offset-4 hover:text-crimson-deep"
          >
            See all events
          </Link>
          <MemberOnly>
            <Link
              href="/feed"
              className="font-bold text-crimson underline underline-offset-4 hover:text-crimson-deep"
            >
              Back to the community feed
            </Link>
          </MemberOnly>
        </div>
      </main>
      <Footer />
    </>
  );
}
