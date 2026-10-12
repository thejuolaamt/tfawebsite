import Photo from "./Photo";

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

        <div
          data-stagger
          className="mt-7 grid gap-4 sm:-mx-0 sm:mt-8 md:-mx-6 md:mt-12 md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4"
        >
          {pillars.map((item) => (
            <div
              key={item.title}
              className="overflow-hidden rounded-[24px] border border-line bg-paper shadow-sm md:w-auto md:rounded-[28px]"
            >
              <Photo
                src={item.image}
                alt={item.title}
                label={item.label}
                className="h-[200px] w-full !rounded-none !border-0 border-b-[1.5px] !border-b-crimson/40"
              />
              <div className="p-5">
                <h3 className="text-[22px] font-bold leading-tight">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
