import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Photo from "@/components/Photo";
import UpcomingEvents from "@/components/UpcomingEvents";
import { JOIN_URL } from "@/lib/links";
import { VisitorOnly } from "@/components/AuthGate";
import { PAST, type EventItem } from "@/lib/events";

export const metadata: Metadata = {
  title: "Events & Activities",
  description:
    "Workshops, weekly drawing tasks, artist interviews, meet-ups and more from The Fine Artist Community, an art community in Nigeria.",
  alternates: { canonical: "/events" },
};

function Card({ item }: { item: EventItem }) {
  return (
    <div className="flex flex-col rounded-[28px] border border-line bg-paper p-5 text-ink md:p-6">
      <p className="eyebrow text-crimson">{item.tag}</p>
      <h3 className="mt-2 text-xl font-bold leading-tight md:text-2xl">{item.title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-muted md:text-[15px]">{item.text}</p>
      {item.href && (
        <Link
          href={item.href}
          className="mt-4 inline-block text-sm font-bold text-crimson underline underline-offset-4 hover:text-crimson-deep"
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
        {/* Page title (hidden, for search engines and screen readers) */}
        <h1 className="sr-only">Events and activities</h1>

        {/* Flyers posted from /events/manage. First thing on the page.
            The workshop shows here as a flyer, with its own register button. */}
        <div id="workshop" className="bg-cream pt-14 md:pt-12">
          <UpcomingEvents />
        </div>

        {/* Other events, past and present */}
        <div id="past" className="bg-cream px-6 py-14 md:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow text-crimson">Other events, past and present</p>
            <h2 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-6xl">
              Learn and grow with us.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
              Workshops, weekly challenges, interviews and meet-ups. Everything TFA is doing,
              in one place.
            </p>

            {featured && (
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
            )}

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
