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
    <section id="about" className="bg-cream px-6 py-24 text-ink">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-crimson">
          About TFA
        </p>
        <h2 className="max-w-3xl text-3xl font-bold md:text-5xl">
          A community that gives artists a place to belong, work, and grow.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          The Fine Artist Community (TFA) exists so that talent is never held
          back by a lack of space, materials, or exposure. We bring artists
          together, support them practically, and show their work to the world.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-line bg-paper p-6 transition hover:-translate-y-1 hover:border-crimson"
            >
              <div className="mb-4 h-1 w-10 bg-crimson" />
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
