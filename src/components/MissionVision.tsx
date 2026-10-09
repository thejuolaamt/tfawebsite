export default function MissionVision() {
  return (
    <section id="mission" className="bg-crimson px-6 py-16 text-cream md:py-24">
      <div
        data-stagger
        className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:gap-16"
      >
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-cream/70 md:mb-4 md:text-sm">
            Our Mission
          </p>
          <h2 className="text-2xl font-bold md:text-4xl">
            To make art a path every artist can walk.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-cream/85 md:mt-6 md:text-lg">
            We give artists inclusion and belonging, a free studio to work in,
            and cheaper materials. We give their work a public stage through
            exhibitions, and we guide art-inclined secondary school students
            toward careers in the arts.
          </p>
        </div>

        <div className="border-t border-cream/25 pt-8 md:border-l md:border-t-0 md:pl-16 md:pt-0">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-cream/70 md:mb-4 md:text-sm">
            Our Vision
          </p>
          <h2 className="text-2xl font-bold md:text-4xl">
            A world where every artist has the space, tools, and audience to
            thrive.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-cream/85 md:mt-6 md:text-lg">
            We see a community where talent is never wasted for lack of
            resources, and where art is valued, seen, and supported from the
            classroom to the gallery.
          </p>
        </div>
      </div>
    </section>
  );
}
