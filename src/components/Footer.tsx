import Link from "next/link";
import { JOIN_URL, WHATSAPP_URL } from "@/lib/links";
import { VisitorOnly, MemberOnly } from "@/components/AuthGate";

const EMAIL = "officialthefineartist@gmail.com";

// Fill in a link to show its icon. Leave "" to hide it.
const SOCIALS = [
  { label: "WhatsApp", href: WHATSAPP_URL, icon: "whatsapp" },
  { label: "Instagram", href: "https://instagram.com/thefineartistig", icon: "instagram" },
  { label: "Facebook", href: "https://facebook.com/thefineartistfacebook", icon: "facebook" },
  { label: "Email", href: `mailto:${EMAIL}`, icon: "mail" },
] as const;

const EXPLORE = [
  { label: "About", href: "/#about" },
  { label: "Team", href: "/#team" },
  { label: "Events", href: "/events" },
  { label: "Materials", href: "/materials" },
  { label: "Community Blog", href: "/blog" },
];

const VISITOR_LINKS = [
  { label: "Become a member", href: JOIN_URL },
  { label: "Member login", href: "/login" },
];

const MEMBER_LINKS = [
  { label: "My account", href: "/account" },
  { label: "Donate materials", href: "/materials/donate" },
];

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  className: "size-[18px]",
} as const;

function SocialIcon({ name }: { name: (typeof SOCIALS)[number]["icon"] }) {
  if (name === "instagram") {
    return (
      <svg {...svgProps}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    );
  }
  if (name === "facebook") {
    return (
      <svg {...svgProps}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }
  if (name === "mail") {
    return (
      <svg {...svgProps}>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    );
  }
  return (
    <svg {...svgProps}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="eyebrow text-cream/50">{title}</p>
      <ul className="mt-5 space-y-3.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[15px] text-cream/80 transition hover:text-cream">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const socials = SOCIALS.filter((s) => s.href);

  return (
    <footer className="bg-ink px-6 pb-8 pt-14 text-cream md:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-6">
            <p className="font-display text-2xl font-bold leading-tight md:text-3xl">
              Home of creative inclusiveness.
            </p>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-cream/65">
              An art community in Nigeria where artists of every level belong, learn, exhibit
              and grow together.
            </p>

            <ul className="mt-8 flex flex-wrap gap-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="inline-flex size-11 items-center justify-center rounded-full border border-cream/20 text-cream/80 transition hover:border-cream hover:bg-cream hover:text-ink"
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-5 lg:col-start-8">
            <LinkColumn title="Explore" links={EXPLORE} />
            <VisitorOnly>
              <LinkColumn title="Members" links={VISITOR_LINKS} />
            </VisitorOnly>
            <MemberOnly>
              <LinkColumn title="Members" links={MEMBER_LINKS} />
            </MemberOnly>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-3 border-t border-cream/15 pt-6 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} The Fine Artist Community (TFA). All rights
            reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="transition hover:text-cream">
              Privacy Policy
            </Link>
            <a href={`mailto:${EMAIL}`} className="transition hover:text-cream">
              {EMAIL}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
