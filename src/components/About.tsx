// About section: the studio video plays on its own (silent, looping).
// To change the video, replace the file in public/videos and keep the same name.

export default function About() {
  return (
    <section id="about" className="bg-paper py-14 text-ink md:py-24">
      {/* Who we are */}
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 md:grid-cols-2 md:gap-16">
        <video
          src="/videos/tfa_community_about_us_video.mp4"
          aria-label="Artists at work in a busy art studio"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="aspect-square w-full rounded-[28px] bg-ink object-cover"
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
    </section>
  );
}
