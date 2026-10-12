import Photo from "./Photo";

// Put a photo path here later, for example "/images/story/founder.jpg"
const storyPhoto: string | undefined = undefined;

export default function OurStory() {
  return (
    <section id="story" className="bg-cream px-6 pb-14 pt-2 text-ink md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2 md:gap-16">
        <Photo
          src={storyPhoto}
          alt="The founder with fellow artists"
          label="Photo: the founder with fellow artists"
          className="h-[400px] w-full rounded-t-[200px] rounded-b-[28px] md:h-auto md:aspect-[4/5]"
        />

        <div>
          <p className="eyebrow text-crimson">Our story</p>
          <h2 className="mt-3 text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
            It started with a question: where do beginners belong?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted md:mt-6 md:text-lg">
            Around 2020, just after secondary school, our founder found artists
            online, but also a circle where art seemed to belong only to
            professionals. So he imagined a home where every artist is welcome,
            and parents can learn to understand a child who wants to study art.
          </p>
        </div>
      </div>
    </section>
  );
}
