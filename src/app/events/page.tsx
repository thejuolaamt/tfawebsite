import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Photo from "@/components/Photo";
import { JOIN_URL } from "@/lib/links";
import { VisitorOnly, MemberOnly } from "@/components/AuthGate";
import { WORKSHOP, COMING_UP, ACTIVITIES, PAST, type EventItem } from "@/lib/events";

export const metadata: Metadata = {
  title: "Events & Activities",
  description:
    "Workshops, weekly drawing tasks, artist interviews, meet-ups and more from The Fine Artist Community, an art community in Nigeria.",
  alternates: { canonical: "/events" },
};

function Card({ item, dark = false }: { item: EventItem; dark?: boolean }) {
  return (
    <div
      className={`flex flex-col rounded-[28px] p-5 md:p-6 ${
        dark ? "bg-ink text-cream" : "border border-line bg-paper text-ink"
      }`}
    >
      <p className={`eyebrow ${dark ? "text-blush" : "text-crimson"}`}>{item.tag}</p>
      <h3 className="mt-2 text-xl font-bold leading-tight md:text-2xl">{item.title}</h3>
      <p
        className={`mt-2 text-[14px] leading-relaxed md:text-[15px] ${
          dark ? "text-cream/80" : "text-muted"
        }`}
      >
        {item.text}
      </p>
      {item.href && (
        <Link
          href={item.href}
          className={`mt-4 inline-block text-sm font-bold underline underline-offset-4 ${
            dark ? "text-cream hover:text-paper" : "text-crimson hover:text-crimson-deep"
          }`}
        >
          {item.linkLabel ?? "Learn more"}
        </Link>
      )}
    </div>
  );
}

export default function EventsPage() {
  const [featured, ...restPast] = PAST;

  return (
    <>
      <Navbar />
      <main className="text-ink">
        {/* Top of the page */}
        <div className="bg-cream px-6 pb-12 pt-28 md:pb-16 md:pt-36">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow text-crimson">Events &amp; activities</p>
            <h1 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-6xl">
              Where artists meet, learn and grow.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
              Workshops, weekly challenges, interviews and meet-ups. Everything TFA is doing,
              in one place.
            </p>
          </div>
        </div>

        {/* Featured workshop */}
        <div id="workshop" className="bg-crimson-deep px-6 py-14 text-cream md:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow text-blush">Workshop</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.05] md:text-6xl">
              {WORKSHOP.title}
            </h2>
            {WORKSHOP.summary && (
              <p className="mt-4 max-w-2xl text-base text-cream/85 md:text-lg">
                {WORKSHOP.summary}
              </p>
            )}

            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {WORKSHOP.details.map((detail) => (
                <div key={detail.label} className="rounded-[28px] border border-paper/25 p-5">
                  <p className="eyebrow text-blush">{detail.label}</p>
                  <p
                    className={`mt-2 font-display text-xl font-bold leading-tight ${
                      detail.value ? "" : "text-cream/60"
                    }`}
                  >
                    {detail.value || "Coming soon"}
                  </p>
                </div>
              ))}
            </div>

            {WORKSHOP.learn.length > 0 && (
              <>
                <p className="eyebrow mt-8 text-blush">What you will learn</p>
                <ul className="mt-2 space-y-2 text-cream/85">
                  {WORKSHOP.learn.map((item, index) => (
                    <li key={index}>&bull; {item}</li>
                  ))}
                </ul>
              </>
            )}

            {WORKSHOP.open ? (<a href={WORKSHOP.registerUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-13 items-center justify-center rounded-full bg-cream px-7 text-base font-bold text-crimson transition hover:bg-paper">Register for Workshop</a>) : (<p className="mt-8 max-w-xl rounded-[28px] border border-paper/25 p-5 text-[15px] leading-relaxed text-cream/85">Registration is closed for now. The workshop happens once a year. <VisitorOnly><Link href={JOIN_URL} className="font-bold text-cream underline underline-offset-4">Become a member</Link> to hear first when the next one opens.</VisitorOnly><MemberOnly>We will share the next date here.</MemberOnly></p>)}
          </div>
        </div>

        {/* Coming up */}
        <div id="coming-up" className="bg-cream px-6 py-14 md:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow text-crimson">Coming up</p>
            <h2 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
              Where we are headed.
            </h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 md:mt-12 md:gap-4 lg:grid-cols-4">
              {COMING_UP.map((item) => (
                <Card key={item.title} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Ongoing activities */}
        <div id="activities" className="bg-paper px-6 py-14 md:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow text-crimson">Always on</p>
            <h2 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
              Activities you can join today.
            </h2>
            <div className="mt-7 grid gap-3 md:mt-12 md:grid-cols-3 md:gap-4">
              {ACTIVITIES.map((item) => (
                <Card key={item.title} item={item} dark />
              ))}
            </div>
          </div>
        </div>

        {/* Past events */}
        <div id="past" className="bg-cream px-6 py-14 md:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow text-crimson">What we have done</p>
            <h2 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
              Built by artists, one step at a time.
            </h2>

            <div className="mt-7 overflow-hidden rounded-[32px] bg-crimson text-cream md:mt-12 md:grid md:grid-cols-2">
              {featured.image && (
                <Photo
                  src={featured.image}
                  alt={featured.title}
                  tone="dark"
                  sizes="(min-width: 768px) 560px, 100vw"
                  className="h-56 w-full !rounded-none !border-0 md:h-full md:min-h-72 [&_img]:object-[50%_70%]"
                />
              )}
              <div className="p-6 md:p-10">
                <p className="eyebrow text-blush">{featured.tag}</p>
                <h3 className="mt-3 text-[2rem] font-extrabold leading-[1.05] md:text-4xl">
                  {featured.title}
                </h3>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-cream/85 md:text-lg">
                  {featured.text}
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:mt-4 md:grid-cols-3 md:gap-4">
              {restPast.map((item) => (
                <Card key={item.title} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Join */}
        <VisitorOnly><div className="bg-crimson px-6 py-14 text-center text-cream md:py-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-[2rem] font-extrabold leading-tight md:text-5xl">
              Want to take part?
            </h2>
            <p className="mt-3 text-base text-cream/85">
              Free to join. Open to artists of every level.
            </p>
            <Link
              href={JOIN_URL}
              className="mt-7 inline-flex min-h-13 items-center justify-center rounded-full bg-cream px-7 text-base font-bold text-crimson transition hover:bg-paper"
            >
              Become a Member
            </Link>
          </div>
        </div></VisitorOnly>
      </main>
      <Footer />
    </>
  );
}
