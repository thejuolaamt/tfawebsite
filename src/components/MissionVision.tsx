import Photo from "./Photo";

// Put a photo path here later, for example "/images/story/seminar.jpg"
const missionPhoto: string | undefined = undefined;

export default function MissionVision() {
  return (
    <section id="mission" className="bg-crimson px-6 py-14 text-cream md:py-24">
      <div
        data-stagger
        className="mx-auto grid max-w-6xl gap-7 md:grid-cols-2 md:gap-x-16 md:gap-y-12"
      >
        <div>
          <p className="eyebrow text-blush">Our mission</p>
          <h2 className="mt-3 text-[2.1rem] font-extrabold leading-none sm:text-4xl md:text-5xl">
            Make art a path every artist can walk.
          </h2>
        </div>

        <Photo
          src={missionPhoto}
          alt="Students at a seminar"
          label="Photo: students at a seminar"
          tone="dark"
          className="h-[200px] w-full rounded-[28px] md:order-3 md:col-span-2 md:h-72"
        />

        <div>
          <p className="eyebrow text-blush">Our vision</p>
          <h2 className="mt-3 text-[2.1rem] font-extrabold leading-none sm:text-4xl md:text-5xl">
            Space, tools and audience for all.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-cream/85 md:text-lg">
            Talent never wasted for lack of resources, and art seen from the
            classroom to the gallery.
          </p>
        </div>
      </div>
    </section>
  );
}
