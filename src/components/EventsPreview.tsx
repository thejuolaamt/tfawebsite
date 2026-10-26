import Link from "next/link";
import { ACTIVITIES, WORKSHOP, type EventItem } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";

// Shown when no flyers have been posted. The full list lives on /events.
const cards: EventItem[] = [
  {
    tag: "Workshop",
    title: WORKSHOP.title,
    text: WORKSHOP.summary || "Hands-on sessions for artists. See the details and how to register.",
  },
  ACTIVITIES[0],
  ACTIVITIES[2],
];

type Flyer = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  flyer_url: string;
};

function shortDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function EventsPreview() {
  // The next three flyers posted from /events/manage
  const supabase = await createClient();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
  const { data } = await supabase
    .from("events")
    .select("id, title, event_date, event_time, flyer_url")
    .eq("published", true)
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(3);
  const flyers = (data ?? []) as Flyer[];

  return (
    <section id="events" className="bg-crimson-deep px-6 py-14 text-cream md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow text-blush">
          {flyers.length > 0 ? "Upcoming events" : "Events & activities"}
        </p>
        <h2 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.05] md:text-6xl">
          {flyers.length > 0 ? "Grow with us." : "Learn and grow with us."}
        </h2>

        {flyers.length > 0 ? (
          <div
            data-stagger
            className="mt-7 grid items-start gap-3 md:mt-12 md:grid-cols-3 md:gap-4"
          >
            {flyers.map((f) => (
              <Link
                key={f.id}
                href="/events#upcoming"
                className="block overflow-hidden rounded-[28px] bg-cream text-ink transition hover:-translate-y-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.flyer_url}
                  alt={`Flyer for ${f.title}`}
                  loading="lazy"
                  className="h-auto w-full"
                />
                <div className="p-5">
                  <p className="eyebrow text-crimson">
                    {shortDate(f.event_date)}
                    {f.event_time ? `, ${f.event_time}` : ""}
                  </p>
                  <h3 className="mt-2 text-xl font-bold leading-tight">{f.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div data-stagger className="mt-7 grid gap-3 md:mt-12 md:grid-cols-3 md:gap-4">
            {cards.map((c) => (
              <div key={c.title} className="rounded-[28px] border border-paper/25 p-6">
                <p className="eyebrow text-blush">{c.tag}</p>
                <h3 className="mt-2 text-xl font-bold leading-tight md:text-2xl">{c.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-cream/80">{c.text}</p>
              </div>
            ))}
          </div>
        )}

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
