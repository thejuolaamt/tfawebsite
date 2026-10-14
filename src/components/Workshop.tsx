import { WORKSHOP_URL } from "@/lib/links";

// Fill these in. Anything left empty ("" or []) is hidden automatically.
const WORKSHOP = {
  title: "The Fine Artist Workshop",
  summary: "",
  details: [
    { label: "Date", value: "" },
    { label: "Time", value: "" },
    { label: "Format", value: "" },
    { label: "Price", value: "" },
  ],
  learn: [] as string[],
};

export default function Workshop() {
  const details = WORKSHOP.details.filter((detail) => detail.value);

  return (
    <section id="workshop" className="bg-crimson-deep px-6 py-14 text-cream md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow text-blush">Workshop</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.05] md:text-6xl">
          {WORKSHOP.title}
        </h2>
        {WORKSHOP.summary && (
          <p className="mt-4 max-w-2xl text-base text-cream/85 md:text-lg">
            {WORKSHOP.summary}
          </p>
        )}
        {details.length > 0 && (
          <div data-stagger className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {details.map((detail) => (
              <div key={detail.label} className="rounded-[28px] border border-paper/25 p-5">
                <p className="eyebrow text-blush">{detail.label}</p>
                <p className="mt-2 font-display text-xl font-bold leading-tight">
                  {detail.value}
                </p>
              </div>
            ))}
          </div>
        )}
        {WORKSHOP.learn.length > 0 && (
          <>
            <p className="mt-8 eyebrow text-blush">What you will learn</p>
            <ul className="mt-2 space-y-2 text-cream/85">
              {WORKSHOP.learn.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </>
        )}
        <a href={WORKSHOP_URL} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-13 items-center justify-center rounded-full bg-cream px-7 text-base font-bold text-crimson transition hover:bg-paper">Register for Workshop</a>
      </div>
    </section>
  );
}