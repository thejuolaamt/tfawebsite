import Photo from "./Photo";
import Carousel from "./Carousel";

// PLACEHOLDERS: replace names, roles, and bios with the real team.
// To add a real photo to a card, add:  image: "/images/story/your-file.jpg"
const team: {
  role: string;
  name: string;
  text: string;
  label: string;
  image?: string;
  loading?: "lazy" | "eager";
}[] = [
  {
    role: "Founder",
    name: "Olayinka Judah",
    text: "Art historian, curator and founder of TFA. He is passionate about making art accessible to all.",
    label: "Photo: founder",
    image: "/images/team/olayinka-judah.jpeg",
    loading: "eager",
  },
  {
    role: "Team Lead II",
    name: "Oyinloluwa Akindele",
    text: "Professional Sculptor, design expert and Teacher",
    label: "Photo: co-founder",
    image: "/images/team/oyinloluwa-akindele.jpeg",
  },
  {
    role: "Workshop facilitator",
    name: "Emmanuel Okolieze",
    text: "Professional Pencil portrait artist, and workshop facilitator",
    label: "Photo: creative lead",
    image: "/images/team/emmanuel-okolieze.jpeg",
  },
  {
    role: "Moderator Lead II",
    name: "Promise Oloruntobi",
    text: "Professional artist and moderator.",
    label: "Photo: community manager",
    image: "/images/team/promise-oloruntobi.jpeg",
  },
  {
    role: "Content Editor",
    name: "Taiwo Oladele",
    text: "Community storyteller and editorial lead, shaping the voice and message behind TFA.",
    label: "Photo: content editor",
    image: "/images/team/taiwo-oladele.jpeg",
  },
  {
    role: "Content Manager II",
    name: "Pamilerin Oluwasanmi",
    text: "Creative content manager and social media expert",
    label: "Photo: art store",
    image: "/images/team/pamilerin-oluwasanmi.jpeg",
  },
];

const tones = ["bg-crimson", "bg-ink", "bg-crimson-deep"];

export default function Team() {
  return (
    <section id="team" className="bg-paper py-14 text-ink md:py-24">
      <div className="mx-auto max-w-6xl px-0 sm:px-6">
        <p className="eyebrow text-crimson">Our team</p>
        <h2 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-6xl">
          Community Leaders.
        </h2>

        <Carousel label="Community leaders">
          {team.map((m, i) => (
            <div
              key={m.name}
              className={`w-[280px] shrink-0 overflow-hidden rounded-[24px] text-cream shadow-sm sm:w-[320px] md:w-[340px] md:rounded-[28px] ${tones[i % tones.length]}`}
            >
              <Photo
                src={m.image}
                alt={`${m.name}, ${m.role}`}
                label={m.label}
                tone="dark"
                sizes="(min-width: 768px) 340px, 320px"
                loading={m.loading ?? "lazy"}
                className="h-[260px] w-full !rounded-none !border-0 sm:h-[280px] md:h-56"
              />
              <div className="p-5">
                <p className="eyebrow text-blush">{m.role}</p>
                <h3 className="mt-2 text-xl font-bold leading-tight sm:text-2xl">
                  {m.name}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-cream/80 sm:text-[15px]">
                  {m.text}
                </p>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}