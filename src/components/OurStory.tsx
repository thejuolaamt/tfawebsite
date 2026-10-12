import Photo from "./Photo";

// Put a photo path here later, for example "/images/story/founder.jpg"
const storyPhoto: string | undefined = "/images/story/our-story.png";

export default function OurStory() {
  return (
    <section id="story" className="bg-cream px-6 pb-14 pt-2 text-ink md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2 md:gap-16">
        <Photo
          src={storyPhoto}
          alt="TFA admins and team leaders"
          className="aspect-square w-full rounded-[28px]"
        />

        <div>
          <p className="eyebrow text-crimson">Our story</p>
          <h2 className="mt-3 text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
            We wanted a space for all artists.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted md:mt-6 md:text-lg">
            The community was founded by Olayinka Judah; a Nigerian artist and art educator, 
            who wanted to create a safe space for artists to connect, learn, and grow 
            together. The Fine Artist Community is a place where artists of all levels can 
            come together to share their work, learn from each other, and support one 
            another in their creative journeys. 
          </p>
        </div>
      </div>
    </section>
  );
}

