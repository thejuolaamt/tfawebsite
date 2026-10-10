import Image from "next/image";

const CREAM = "#F8F6DF";

// Put a photo path here later, for example "/images/story/founder.jpg"
const storyPhoto: string | undefined = undefined;

const shapes = [
  <g>
    <circle cx="150" cy="40" r="50" fill="none" stroke={CREAM} strokeOpacity="0.25" strokeWidth="1.5" />
    <circle cx="110" cy="75" r="24" fill={CREAM} fillOpacity="0.14" />
    <circle cx="55" cy="90" r="6" fill={CREAM} fillOpacity="0.5" />
  </g>,
  <g>
    <circle cx="60" cy="70" r="40" fill={CREAM} fillOpacity="0.12" />
    <circle cx="100" cy="55" r="46" fill="none" stroke={CREAM} strokeOpacity="0.25" strokeWidth="1.5" />
    <circle cx="160" cy="95" r="7" fill={CREAM} fillOpacity="0.5" />
  </g>,
  <g>
    <circle cx="30" cy="80" r="8" fill={CREAM} fillOpacity="0.5" />
    <circle cx="70" cy="68" r="14" fill={CREAM} fillOpacity="0.3" />
    <circle cx="120" cy="52" r="22" fill={CREAM} fillOpacity="0.16" />
    <circle cx="175" cy="36" r="32" fill="none" stroke={CREAM} strokeOpacity="0.25" strokeWidth="1.5" />
  </g>,
  <g>
    <circle cx="82" cy="65" r="34" fill="none" stroke={CREAM} strokeOpacity="0.25" strokeWidth="1.5" />
    <circle cx="118" cy="65" r="34" fill="none" stroke={CREAM} strokeOpacity="0.25" strokeWidth="1.5" />
    <circle cx="100" cy="42" r="34" fill={CREAM} fillOpacity="0.1" />
    <circle cx="100" cy="96" r="6" fill={CREAM} fillOpacity="0.5" />
  </g>,
];

function Photo({
  src,
  alt,
  variant = 0,
  className = "",
}: {
  src?: string;
  alt: string;
  variant?: number;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-crimson ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 40vw, 80vw"
          className="object-cover"
        />
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 200 120"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          {shapes[variant % shapes.length]}
        </svg>
      )}
    </div>
  );
}

const stats = [
  { value: "235+", label: "Online members" },
  { value: "8K+", label: "Facebook followers" },
  { value: "5", label: "Seminars and art talks" },
  { value: "6", label: "Community leaders" },
];

// To add a real photo to a card, add:  image: "/images/story/your-file.jpg"
const milestones: { tag: string; title: string; text: string; image?: string }[] = [
  {
    tag: "23 July 2026",
    title: "Career guidance seminar",
    text: "At Saint Louis Secondary School, Ondo, guiding art-inclined students toward careers in the arts.",
  },
  {
    tag: "2025",
    title: "Online practical workshop",
    text: "A hands-on practical session for artists, held entirely online.",
  },
  {
    tag: "Every week",
    title: "Weekly drawing tasks",
    text: "Creative challenges with up to 15 artists taking part.",
  },
  {
    tag: "Series",
    title: "Artist interviews",
    text: "Conversations with artists, starting with Kenny Daniel Art. More to come.",
  },
  {
    tag: "In person",
    title: "Meet-ups",
    text: "Our first physical meet, and members connecting face to face at exhibitions.",
  },
  {
    tag: "Registered",
    title: "TFA Art Store",
    text: "Our art store is now registered with CAC, bringing art materials within reach.",
  },
];

const upcoming = [
  { tag: "2026", title: "Online practical workshop", text: "Another hands-on session for our members." },
  { tag: "Planned", title: "Free art studio", text: "A free place to work for artists in Ondo." },
  { tag: "Members", title: "Cheaper art materials", text: "Art materials at lower prices for TFA members." },
  { tag: "2027", title: "Artist meets", text: "In-person gatherings for artists to connect." },
  { tag: "2027", title: "TFA exhibition", text: "A public showcase of our members work." },
];

export default function OurStory() {
  return (
    <>
      {/* Screen 1: the story */}
      <section id="story" className="bg-cream px-6 py-16 text-ink md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2 md:gap-16">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-crimson md:mb-4 md:text-sm">
              Our Story
            </p>
            <h2 className="text-2xl font-bold sm:text-3xl md:text-5xl">
              Every artist deserves a seat at the table.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:mt-6 md:text-lg">
              TFA began around 2020 and 2021, just after our founder left
              secondary school and the question of a career in art became real.
              Online, he found other artists, but also a circle where art
              seemed to belong only to the professionals. Beginners felt left
              out.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted md:mt-4 md:text-lg">
              So he imagined a home where every artist is welcome,
              professionals are within reach, and parents can learn to
              understand a child who wants to study art. He went on to study
              Fine Art, met more artists, and found others ready to build it
              with him.
            </p>

            <div data-stagger className="mt-6 grid grid-cols-4 gap-3 md:mt-8 md:gap-6">
              {stats.map((s) => (
                <div key={s.label} className="border-l-2 border-crimson pl-2 md:pl-3">
                  <p className="text-xl font-bold text-crimson md:text-4xl">{s.value}</p>
                  <p className="mt-1 text-[10px] leading-tight text-muted md:text-sm">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Photo
            src={storyPhoto}
            alt="A TFA community moment"
            variant={0}
            className="hidden aspect-[4/5] rounded-3xl md:block"
          />
        </div>
      </section>

      {/* Screen 2: what we have done */}
      <section id="milestones" className="bg-paper px-6 py-16 text-ink md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-crimson md:mb-4 md:text-sm">
            What we have done
          </p>
          <h2 className="max-w-3xl text-2xl font-bold sm:text-3xl md:text-4xl">
            Built by artists, one step at a time.
          </h2>

          <div
            data-stagger
            className="-mx-6 mt-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:mt-8 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0"
          >
            {milestones.map((m, i) => (
              <div
                key={m.title}
                className="w-[78%] shrink-0 snap-center overflow-hidden rounded-2xl border border-line bg-cream md:w-auto"
              >
                <Photo src={m.image} alt={m.title} variant={i} className="h-40 md:h-24" />
                <div className="p-4">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-crimson">
                    {m.tag}
                  </p>
                  <h3 className="mt-1 text-base font-semibold">{m.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screen 3: where we are headed */}
      <section id="next" className="bg-crimson px-6 py-16 text-cream md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-cream/70 md:mb-4 md:text-sm">
            What comes next
          </p>
          <h2 className="max-w-3xl text-2xl font-bold sm:text-3xl md:text-4xl">
            Where we are headed.
          </h2>

          <ul data-stagger className="mt-6 md:mt-10 md:grid md:grid-cols-2 md:gap-x-16">
            {upcoming.map((u) => (
              <li
                key={u.title}
                className="flex gap-4 border-b border-cream/20 py-3 md:py-5"
              >
                <span className="w-16 shrink-0 pt-1 text-[11px] font-medium uppercase tracking-widest text-cream/70">
                  {u.tag}
                </span>
                <span>
                  <span className="block text-base font-semibold md:text-lg">{u.title}</span>
                  <span className="mt-1 block text-sm text-cream/80">{u.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
