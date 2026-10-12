// Where "Join TFA" should lead (a WhatsApp group, Facebook group, sign-up form...)
const JOIN_URL = "#";

export default function JoinCta() {
  return (
    <section id="join" className="bg-cream px-4 py-16 text-center text-ink sm:px-6 md:py-28">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-[2.3rem] font-extrabold leading-none text-crimson sm:text-[44px] md:text-7xl">
          Your seat at the table is ready.
        </h2>
        <a
          href={JOIN_URL}
          className="mt-7 inline-flex min-h-13 items-center justify-center rounded-full bg-crimson px-7 text-base font-bold text-cream transition hover:bg-crimson-deep"
        >
          Join TFA
        </a>
        <p className="mt-8 text-sm text-muted">
          The Fine Artist Community. Home of creative inclusiveness.
        </p>
      </div>
    </section>
  );
}
