import Photo from "./Photo";

// The first item is the featured card (big). The other five fill the grid.
// To add a real photo to a card, add:  image: "/images/story/your-file.jpg"
const milestones: {
  tag: string;
  title: string;
  text: string;
  image?: string;
}[] = [
  {
    tag: "23 July 2026",
    title: "Career guidance seminar",
    text: "At Saint Louis Secondary School, Ondo, guiding art-inclined students toward careers in the arts.",
  },
  {
    tag: "Registered",
    title: "TFA Art Store",
    text: "Our art store is now registered with CAC, bringing art materials within reach.",
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
];

// Style for each of the five smaller cards, in order.
const small = [
  "bg-ink text-cream",
  "border border-line bg-paper text-ink",
  "border border-line bg-paper text-ink",
  "bg-crimson-deep text-cream",
  "border border-line bg-paper text-ink",
];

export default function Milestones() {
  const [featured, ...rest] = milestones;

  return (
    <section id="milestones" className="bg-cream px-4 py-14 text-ink sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow text-crimson">What we have done</p>
        <h2 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-6xl">
          Built by artists, one step at a time.
        </h2>

        <div
          data-stagger
          className="mt-7 grid gap-3 md:mt-12 md:grid-cols-3 md:gap-4"
        >
          {/* Featured */}
          <div className="flex flex-col justify-between overflow-hidden rounded-[32px] bg-crimson text-cream md:col-span-2 md:row-span-2">
            {featured.image && (
              <Photo
                src={featured.image}
                alt={featured.title}
                tone="dark"
                sizes="(min-width: 768px) 700px, 100vw"
                className="h-56 w-full !rounded-none !border-0 md:h-72"
              />
            )}
            <div className="p-6 md:p-10">
              <p className="eyebrow text-blush">{featured.tag}</p>
              <h3 className="mt-3 text-[2rem] font-extrabold leading-[1.05] md:text-5xl">
                {featured.title}
              </h3>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-cream/85 md:text-lg">
                {featured.text}
              </p>
            </div>
          </div>

          {/* Smaller cards */}
          {rest.map((m, i) => {
            const dark = small[i].includes("text-cream");
            return (
              <div
                key={m.title}
                className={`overflow-hidden rounded-[28px] ${small[i]}`}
              >
                {m.image && (
                  <Photo
                    src={m.image}
                    alt={m.title}
                    tone={dark ? "dark" : "light"}
                    sizes="(min-width: 768px) 340px, 100vw"
                    className="h-44 w-full !rounded-none !border-0"
                  />
                )}
                <div className="p-5 md:p-6">
                  <p className={`eyebrow ${dark ? "text-blush" : "text-crimson"}`}>
                    {m.tag}
                  </p>
                  <h3 className="mt-2 text-xl font-bold leading-tight md:text-2xl">
                    {m.title}
                  </h3>
                  <p
                    className={`mt-2 text-[14px] leading-relaxed md:text-[15px] ${dark ? "text-cream/80" : "text-muted"}`}
                  >
                    {m.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
