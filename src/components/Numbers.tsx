import Photo from "./Photo";

export default function Numbers() {
  return (
    <section id="numbers" className="bg-cream px-4 py-14 text-ink sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow text-crimson">TFA in numbers</p>
        <h2 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-6xl">
          Artists we have reached.
        </h2>

        <div
          data-stagger
          className="mt-7 grid gap-3 md:mt-12 md:grid-cols-4 md:gap-4"
        >
          {/* Big number */}
          <div className="rounded-[32px] bg-crimson p-6 text-cream md:col-span-2 md:row-span-2 md:flex md:flex-col md:justify-between md:p-10">
            <div>
              <div className="font-display text-[clamp(88px,30vw,128px)] font-extrabold leading-[0.9] tracking-[-0.03em] md:text-[clamp(128px,14vw,200px)]">
                230+
              </div>
              <div className="mt-2 font-bold md:text-xl">Members in our group</div>
            </div>
            <div className="mt-5 flex md:mt-10" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <Photo
                  key={i}
                  alt=""
                  tone="dark"
                  className={`size-12 rounded-full !p-0 ${i > 0 ? "-ml-3" : ""}`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:col-span-2 md:gap-4">
            <div className="rounded-[28px] bg-ink p-5 text-cream md:p-7">
              <div className="font-display text-[68px] font-extrabold leading-[0.9] tracking-[-0.03em] md:text-8xl">
                8K+
              </div>
              <div className="mt-2 text-sm md:text-base">Facebook followers</div>
            </div>
            <div className="rounded-[28px] border border-line bg-paper p-5 md:p-7">
              <div className="font-display text-[68px] font-extrabold leading-[0.9] tracking-[-0.03em] text-crimson md:text-8xl">
                5
              </div>
              <div className="mt-2 text-sm md:text-base">seminars and art talks</div>
            </div>
          </div>

          {/* Community leaders */}
          <div className="flex items-center justify-between gap-5 rounded-[32px] bg-crimson-deep p-6 text-cream md:col-span-2 md:gap-8 md:p-10">
            <div className="font-display text-[clamp(88px,30vw,128px)] font-extrabold leading-[0.9] tracking-[-0.03em] md:text-[clamp(128px,12vw,176px)]">
              7
            </div>
            <div className="flex flex-col items-end text-right md:items-start md:text-left">
              <div className="text-lg font-bold leading-tight md:text-2xl">
                community
                <br />
                leaders
              </div>
              <div className="mt-4 flex md:mt-5" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <Photo
                    key={i}
                    alt=""
                    tone="dark"
                    className={`size-9 rounded-full !p-0 md:size-11 ${i > 0 ? "-ml-2.5" : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}