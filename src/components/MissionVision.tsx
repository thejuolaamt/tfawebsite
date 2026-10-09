export default function MissionVision() {
  return (
    <section id="mission" className="bg-crimson px-6 py-24 text-cream">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2">
        <div>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-cream/70">
            Our Mission
          </p>
          <h2 className="text-3xl font-bold md:text-4xl">
            To make art a path every artist can walk.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-cream/85">
            We give artists inclusion and belonging, a free studio to work in,
            and cheaper materials. We give their work a public stage through
            exhibitions, and we guide art-inclined secondary school students
            toward careers in the arts.
          </p>
        </div>

        <div className="md:border-l md:border-cream/25 md:pl-16">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-cream/70">
            Our Vision
          </p>
          <h2 className="text-3xl font-bold md:text-4xl">
            A world where every artist has the space, tools, and audience to
            thrive.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-cream/85">
            We see a community where talent is never wasted for lack of
            resources, and where art is valued, seen, and supported from the
            classroom to the gallery.
          </p>
        </div>
      </div>
    </section>
  );
}
