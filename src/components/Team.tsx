import Photo from "./Photo";
import Carousel from "./Carousel";

// Titles show who a person is to TFA, not a task.
// Founder: "Founder". The six Stewards share one title: "Community Steward".
// Paid roles keep their function title (e.g. Assistant Content Manager).
// To add a real photo to a card, add:  image: "/images/team/your-file.jpg"
// A card with no image shows a placeholder.
// Socials: paste the full profile link, e.g. facebook: "https://facebook.com/name".
// Left empty (""), the button is hidden and does nothing.
const team: {
  role: string;
  name: string;
  text: string;
  label: string;
  image?: string;
  facebook: string;
  instagram: string;
  loading?: "lazy" | "eager";
}[] = [
  {
    role: "Founder, TFA",
    name: "Olayinka Judah",
    text: "Artist and art educator.",
    label: "Photo: Olayinka Judah",
    image: "/images/team/olayinka-judah.jpeg",
    facebook: "",
    instagram: "",
    loading: "eager",
  },
  {
    role: "Community Steward, TFA",
    name: "Oyinloluwa Akindele",
    text: "Artist and educator.",
    label: "Photo: Oyinloluwa Akindele",
    image: "/images/team/oyinloluwa-akindele.jpeg",
    facebook: "",
    instagram: "",
  },
  {
    role: "Community Steward, TFA",
    name: "Emmanuel Okolieze",
    text: "Professional artist.",
    label: "Photo: Emmanuel Okolieze",
    image: "/images/team/emmanuel-okolieze.jpeg",
    facebook: "",
    instagram: "",
  },
  {
    role: "Community Steward, TFA",
    name: "Promise Oloruntobi",
    text: "Professional artist.",
    label: "Photo: Promise Oloruntobi",
    image: "/images/team/promise-oloruntobi.jpeg",
    facebook: "",
    instagram: "",
  },
  {
    role: "Community Steward, TFA",
    name: "Taiwo Oladele",
    text: "Community storyteller.",
    label: "Photo: Taiwo Oladele",
    image: "/images/team/taiwo-oladele.jpeg",
    facebook: "",
    instagram: "",
  },
  {
    role: "Community Steward, TFA",
    name: "Valeria Ximena Lopez",
    text: "Fine artist.",
    label: "Photo: Valeria Ximena Lopez",
    image: "/images/team/valeria-ximena-lopez.jpg",
    facebook: "",
    instagram: "",
  },
  {
    role: "Assistant Content Manager, TFA",
    name: "Pamilerin Oluwasanmi",
    text: "Creative and content specialist.",
    label: "Photo: Pamilerin Oluwasanmi",
    image: "/images/team/pamilerin-oluwasanmi.jpeg",
    facebook: "",
    instagram: "",
  },
];

const tones = ["bg-crimson", "bg-ink", "bg-crimson-deep"];

function SocialLink({
  label,
  href,
  person,
}: {
  label: string;
  href: string;
  person: string;
}) {
  const base =
    "rounded-full border border-cream/40 px-3 py-1.5 text-xs font-medium";

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${person} on ${label}`}
      className={`${base} text-cream transition hover:bg-cream hover:text-crimson`}
    >
      {label}
    </a>
  );
}

export default function Team() {
  return (
    <section id="team" className="bg-cream py-14 text-ink md:py-24">
      <div className="mx-auto max-w-6xl px-0 sm:px-6">
        <p className="eyebrow text-crimson">Our team</p>
        <h2 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-6xl">
          Community Stewards
        </h2>

        <Carousel label="TFA core leaders">
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
                <div className="mt-4 flex gap-2">
                  <SocialLink label="Facebook" href={m.facebook} person={m.name} />
                  <SocialLink label="Instagram" href={m.instagram} person={m.name} />
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
