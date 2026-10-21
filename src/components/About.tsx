import Photo from "./Photo";
import Carousel from "./Carousel";

// Put a photo path here later, for example "/images/story/founder.jpg"
const storyPhoto: string | undefined = "/images/story/our-story.png";

// To add a real photo to a card, add:  image: "/images/about/your-file.jpg"
const pillars: { title: string; text: string; label: string; image?: string }[] = [
  {
    title: "Belonging & a free studio",
    text: "A place for every artist to feel included, with a studio to work in so creativity never depends on what you can afford.",
    label: "Photo: shared studio",
  },
  {
    title: "Artists giving to artists",
    text: "Give art materials you no longer need, or collect what other members share. Always free, member to member.",
    label: "Photo: shared art materials",
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
      {/* Who we are */}
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 md:grid-cols-2 md:gap-16">
        <Photo
          src={storyPhoto}
          alt="TFA admins and team leaders"
          className="aspect-square w-full rounded-[28px]"
        />

        <div>
          <p className="eyebrow text-crimson">About us</p>
          <h2 className="mt-3 text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
            We wanted a space for all artists.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted md:mt-6 md:text-lg">
            The community was founded by Olayinka Judah, a Nigerian artist and art educator,
            who wanted to create a safe space for artists to connect, learn, and grow
            together. The Fine Artist Community is a place where artists of all levels can
            come together to share their work, learn from each other, and support one
            another in their creative journeys.
          </p>
        </div>
      </div>

      {/* Mission and vision */}
      <div
        data-stagger
        className="mx-auto mt-8 grid max-w-6xl gap-3 px-6 sm:grid-cols-2 md:mt-12 md:gap-4"
      >
        <div className="rounded-[28px] bg-crimson p-6 text-cream md:p-8">
          <p className="eyebrow text-blush">Our mission</p>
          <h3 className="mt-2 text-2xl font-extrabold leading-tight md:text-3xl">
            Make art a path every artist can walk.
          </h3>
        </div>
        <div className="rounded-[28px] bg-ink p-6 text-cream md:p-8">
          <p className="eyebrow text-blush">Our vision</p>
          <h3 className="mt-2 text-2xl font-extrabold leading-tight md:text-3xl">
            Space, tools and audience for all.
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-cream/80 md:text-[15px]">
            Talent never wasted for lack of resources, and art seen from the classroom to the
            gallery.
          </p>
        </div>
      </div>

      {/* What we give */}
      <div className="mx-auto mt-14 max-w-6xl px-0 sm:px-6 md:mt-24">
        <div className="px-4 sm:px-0">
          <p className="eyebrow text-crimson">What we give</p>
          <h2 className="mt-3 text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-6xl">
            Your creative safe space.
          </h2>
        </div>

        <Carousel label="What TFA gives its members" gapClass="gap-4 md:gap-6">
          {pillars.map((item) => (
            <div
              key={item.title}
              className="w-[280px] shrink-0 overflow-hidden rounded-[24px] border border-line bg-cream shadow-sm sm:w-[320px] md:w-[360px] md:rounded-[28px]"
            >
              {item.image && (
                <Photo
                  src={item.image}
                  alt={item.title}
                  label={item.label}
                  sizes="(min-width: 768px) 360px, 320px"
                  className="h-[200px] w-full !rounded-none !border-0 border-b-[1.5px] !border-b-crimson/40 sm:h-[220px] md:h-[220px]"
                />
              )}
              <div className="p-5">
                <h3 className="text-[22px] font-bold leading-tight">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{item.text}</p>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
