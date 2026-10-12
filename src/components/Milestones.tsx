import Photo from "./Photo";

// To add a real photo to a card, add:  image: "/images/story/your-file.jpg"
const milestones: {
  tag: string;
  title: string;
  text: string;
  label: string;
  image?: string;
}[] = [
  {
    tag: "23 July 2026",
    title: "Career guidance seminar",
    text: "At Saint Louis Secondary School, Ondo, guiding art-inclined students toward careers in the arts.",
    label: "Photo: career seminar",
  },
  {
    tag: "2025",
    title: "Online practical workshop",
    text: "A hands-on practical session for artists, held entirely online.",
    label: "Photo: online workshop",
  },
  {
    tag: "Every week",
    title: "Weekly drawing tasks",
    text: "Creative challenges with up to 15 artists taking part.",
    label: "Photo: drawing task",
  },
  {
    tag: "Series",
    title: "Artist interviews",
    text: "Conversations with artists, starting with Kenny Daniel Art. More to come.",
    label: "Photo: artist interview",
  },
  {
    tag: "In person",
    title: "Meet-ups",
    text: "Our first physical meet, and members connecting face to face at exhibitions.",
    label: "Photo: members meeting",
  },
  {
    tag: "Registered",
    title: "TFA Art Store",
    text: "Our art store is now registered with CAC, bringing art materials within reach.",
    label: "Photo: art store",
  },
];

const tones = ["bg-crimson", "bg-ink", "bg-crimson-deep"];

export default function Milestones() {
  return (
    <section id="milestones" className="bg-cream py-14 text-ink md:py-24">
      <div className="mx-auto max-w-6xl px-0 sm:px-6">
        <p className="eyebrow text-crimson">What we have done</p>
        <h2 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-6xl">
          Built by artists, one step at a time.
        </h2>

        <div className="milestone-carousel mt-7 overflow-hidden sm:mt-8 md:mt-12">
          <div className="milestone-track flex min-w-max gap-4 md:gap-5">
            {[...milestones, ...milestones].map((m, i) => (
              <div
                key={`${m.title}-${i}`}
                className={`w-[280px] shrink-0 overflow-hidden rounded-[24px] text-cream shadow-sm sm:w-[320px] md:w-[340px] md:rounded-[28px] ${tones[i % tones.length]}`}
              >
                <Photo
                  src={m.image}
                  alt={m.title}
                  label={m.label}
                  tone="dark"
                  className="h-[260px] w-full !rounded-none !border-0 sm:h-[280px] md:h-56"
                />
                <div className="p-5">
                  <p className="eyebrow text-blush">{m.tag}</p>
                  <h3 className="mt-2 text-xl font-bold leading-tight sm:text-2xl">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-cream/80 sm:text-[15px]">
                    {m.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
