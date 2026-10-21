import Link from "next/link";
import { ACTIVITIES, WORKSHOP, type EventItem } from "@/lib/events";

// Three short cards on the homepage. The full list lives on /events.
const cards: EventItem[] = [
  {
    tag: "Workshop",
    title: WORKSHOP.title,
    text: WORKSHOP.summary || "Hands-on sessions for artists. See the details and how to register.",
  },
  ACTIVITIES[0],
  ACTIVITIES[2],
];

export default function EventsPreview() {
  return (
    <section id="events" className="bg-crimson-deep px-6 py-14 text-cream md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow text-blush">Events &amp; activities</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.05] md:text-6xl">
          Learn, make and meet with us.
        </h2>

        <div data-stagger className="mt-7 grid gap-3 md:mt-12 md:grid-cols-3 md:gap-4">
          {cards.map((c) => (
            <div key={c.title} className="rounded-[28px] border border-paper/25 p-6">
              <p className="eyebrow text-blush">{c.tag}</p>
              <h3 className="mt-2 text-xl font-bold leading-tight md:text-2xl">{c.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-cream/80">{c.text}</p>
            </div>
          ))}
        </div>

        <Link
          href="/events"
          className="mt-8 inline-flex min-h-13 items-center justify-center rounded-full bg-cream px-7 text-base font-bold text-crimson transition hover:bg-paper"
        >
          See all events
        </Link>
      </div>
    </section>
  );
}
