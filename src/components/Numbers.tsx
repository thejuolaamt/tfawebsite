import Photo from "./Photo";

export default function Numbers() {
  return (
    <section id="numbers" className="bg-cream px-4 py-14 text-ink sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow text-crimson">TFA in numbers</p>
        <h2 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-6xl">
          A community that keeps growing.
        </h2>

        <div
          data-stagger
          className="mt-7 grid gap-3 md:mt-12 md:grid-cols-4 md:gap-4"
        >
          {/* Big number */}
          <div className="rounded-[32px] bg-crimson p-6 text-cream md:col-span-2 md:row-span-2 md:flex md:flex-col md:justify-between md:p-10">
            <div>
              <div className="font-display text-[clamp(88px,30vw,128px)] font-extrabold leading-[0.9] tracking-[-0.03em] md:text-[clamp(128px,14vw,200px)]">
                235+
              </div>
              <div className="mt-2 font-bold md:text-xl">artists online</div>
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

          <div className="flex items-center gap-5 rounded-[32px] bg-crimson-deep p-6 text-cream md:col-span-2 md:p-8">
            <div className="font-display text-[96px] font-extrabold leading-[0.9] tracking-[-0.03em] md:text-[120px]">
              6
            </div>
            <div className="font-bold md:text-xl">
              community leaders keeping TFA moving
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
