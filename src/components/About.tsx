const pillars = [
  {
    title: "Belonging & a Free Studio",
    text: "A place for every artist to feel included, with a studio to work in so creativity never depends on what you can afford.",
  },
  {
    title: "Affordable Materials",
    text: "Art materials made cheaper, and sometimes free, so artists can focus on making the work.",
  },
  {
    title: "Public Exhibitions",
    text: "The TFA Art Presentation Exhibition: a launch-style showcase for artwork, open to the public and art lovers.",
  },
  {
    title: "School Outreach",
    text: "Career guidance and counselling for art-inclined secondary school students, through annual workshops and an art convention.",
  },
];

export default function About() {
  return (
    <section id="about" className="bg-cream px-6 py-16 text-ink md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-crimson md:mb-4 md:text-sm">
          About TFA
        </p>
        <h2 className="max-w-3xl text-2xl font-bold sm:text-3xl md:text-5xl">
          A community that gives artists a place to belong, work, and grow.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:mt-6 md:text-lg">
          The Fine Artist Community (TFA) exists so that talent is never held
          back by a lack of space, materials, or exposure. We bring artists
          together, support them practically, and show their work to the world.
        </p>

        <div
          data-stagger
          className="-mx-6 mt-8 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:mt-14 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4"
        >
          {pillars.map((item) => (
            <div
              key={item.title}
              className="min-w-[78%] shrink-0 snap-center rounded-2xl border border-line bg-paper p-5 transition hover:border-crimson md:min-w-0 md:p-6 md:hover:-translate-y-1"
            >
              <div className="mb-3 h-1 w-10 bg-crimson md:mb-4" />
              <h3 className="text-base font-semibold md:text-lg">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted md:mt-3">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
