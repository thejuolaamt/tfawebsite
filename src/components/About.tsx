import Photo from "./Photo";
import Carousel from "./Carousel";

// To add a real photo to a card, add:  image: "/images/about/your-file.jpg"
const pillars: { title: string; text: string; label: string; image?: string }[] = [
  {
    title: "Belonging & a free studio",
    text: "A place for every artist to feel included, with a studio to work in so creativity never depends on what you can afford.",
    label: "Photo: shared studio",
  },
  {
    title: "Affordable materials",
    text: "Art materials made cheaper, and sometimes free, so artists can focus on making the work.",
    label: "Photo: paints and brushes",
  },
  {
    title: "Public exhibitions",
    text: "The TFA Art Presentation Exhibition: a launch-style showcase for artwork, open to the public and art lovers.",
    label: "Photo: exhibition",
  },
  {
    title: "School outreach",
    text: "Career guidance and counselling for art-inclined secondary school students, through annual workshops and an art convention.",
    label: "Photo: school seminar",
  },
];

export default function About() {
  return (
    <section id="about" className="bg-paper py-14 text-ink md:py-24">
      <div className="mx-auto max-w-6xl px-0 sm:px-6">
        <p className="eyebrow text-crimson">What we give</p>
        <h2 className="mt-3 text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-6xl">
          Your creative safe space.
        </h2>

        <Carousel label="What TFA gives its members" gapClass="gap-4 md:gap-6">
          {pillars.map((item) => (
            <div
              key={item.title}
              className="w-[280px] shrink-0 overflow-hidden rounded-[24px] border border-line bg-paper shadow-sm sm:w-[320px] md:w-[360px] md:rounded-[28px]"
            >
              <Photo
                src={item.image}
                alt={item.title}
                label={item.label}
                sizes="(min-width: 768px) 360px, 320px"
                className="h-[200px] w-full !rounded-none !border-0 border-b-[1.5px] !border-b-crimson/40 sm:h-[220px] md:h-[220px]"
              />
              <div className="p-5">
                <h3 className="text-[22px] font-bold leading-tight">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}