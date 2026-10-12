import Image from "next/image";

const JOIN_URL = "https://chat.whatsapp.com/FXquwaYSgCXLQDmqYPYl8q";

// Fill in a link to show it in the footer. Leave "" to hide it.
const SOCIALS = [
  { label: "WhatsApp", href: JOIN_URL },
  { label: "Instagram", href: "https://instagram.com/thefineartistig" },
  { label: "Facebook", href: "https://facebook.com/thefineartistfacebook" },
  { label: "Email", href: "mailto:officialthefineartist@gmail.com" },
];

const LINKS = [
  { label: "Our Story", href: "#story" },
  { label: "About", href: "#about" },
  { label: "Mission", href: "#mission" },
  { label: "Team", href: "#team" },
];

export default function Footer() {
  const socials = SOCIALS.filter((s) => s.href);

  return (
    <footer className="bg-ink px-6 pb-8 pt-14 text-cream md:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="inline-flex rounded-2xl bg-cream px-4 py-3">
              <Image
                src="/images/tfa-logo-mark.png"
                alt="The Fine Artist Community logo"
                width={240}
                height={133}
                className="h-10 w-auto"
              />
            </div>
            <p className="mt-3 max-w-xs text-sm text-cream/70">
              The Fine Artist Community. Home of creative inclusiveness.
            </p>
            <a
              href={JOIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-crimson px-6 text-sm font-bold text-cream transition hover:bg-crimson-deep"
            >
              Become a member
            </a>
          </div>

          <div>
            <div className="eyebrow text-cream/50">Explore</div>
            <ul className="mt-4 space-y-3">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-cream/80 transition hover:text-cream"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="eyebrow text-cream/50">Connect</div>
            <ul className="mt-4 space-y-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="text-sm text-cream/80 transition hover:text-cream"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-cream/15 pt-6 text-xs text-cream/50">
          &copy; {new Date().getFullYear()} The Fine Artist Community (TFA). All
          rights reserved.
        </div>
      </div>
    </footer>
  );
}


