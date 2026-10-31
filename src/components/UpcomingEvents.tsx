import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JOIN_URL } from "@/lib/links";
import { VisitorOnly } from "@/components/AuthGate";
import { WORKSHOP } from "@/lib/events";

type UpcomingEvent = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  details: string | null;
  flyer_url: string;
  register_url: string | null;
};

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Shows the flyers posted from /events/manage. Past events hide themselves.
// If there is nothing to show, a quiet "no events" message appears instead.
// An event with "workshop" in its title and no register link of its own
// gets a button that opens the /workshop page.
export default async function UpcomingEvents() {
  const supabase = await createClient();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });

  const { data } = await supabase
    .from("events")
    .select("id, title, event_date, event_time, details, flyer_url, register_url")
    .eq("published", true)
    .gte("event_date", today)
    .order("event_date", { ascending: true });

  const events = (data ?? []) as UpcomingEvent[];

  if (events.length === 0) {
    return (
      <div id="upcoming" className="bg-cream px-6 py-14 text-ink md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-crimson">Upcoming</p>
          <h2 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
            Coming up.
          </h2>

          <div className="mt-7 rounded-[28px] border border-line bg-paper p-6 md:mt-12 md:p-8">
            <p className="text-base leading-relaxed text-muted md:text-lg">
              No events are scheduled right now. New events are posted here first.
            </p>
            <VisitorOnly>
              <Link
                href={JOIN_URL}
                className="mt-4 inline-block text-sm font-bold text-crimson underline underline-offset-4 transition hover:text-crimson-deep"
              >
                Become a member to hear first
              </Link>
            </VisitorOnly>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="upcoming" className="bg-cream px-6 py-14 text-ink md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow text-crimson">Upcoming</p>
        <h2 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
          Join us at our next event.
        </h2>

        <div className="mt-7 grid gap-5 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
          {events.map((ev) => (
            <article
              key={ev.id}
              className="flex flex-col overflow-hidden rounded-[28px] border border-line bg-paper"
            >
              <a
                href={ev.flyer_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open the ${ev.title} flyer`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ev.flyer_url}
                  alt={`Flyer for ${ev.title}`}
                  loading="lazy"
                  className="h-auto w-full"
                />
              </a>
              <div className="flex flex-1 flex-col p-5">
                <p className="eyebrow text-crimson">
                  {formatDate(ev.event_date)}
                  {ev.event_time ? `, ${ev.event_time}` : ""}
                </p>
                <h3 className="mt-2 text-xl font-bold leading-tight md:text-2xl">{ev.title}</h3>
                {ev.details && (
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{ev.details}</p>
                )}
                {ev.register_url ? (
                  <a
                    href={ev.register_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex min-h-11 items-center justify-center self-start rounded-full bg-crimson px-6 text-sm font-bold text-cream transition hover:bg-crimson-deep"
                  >
                    Register
                  </a>
                ) : /workshop/i.test(ev.title) ? (
                  <Link
                    href="/workshop"
                    className="mt-5 inline-flex min-h-11 items-center justify-center self-start rounded-full bg-crimson px-6 text-sm font-bold text-cream transition hover:bg-crimson-deep"
                  >
                    {WORKSHOP.open ? "Register for Workshop" : "Workshop details"}
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
