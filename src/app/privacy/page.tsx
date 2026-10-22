import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How The Fine Artist Community (TFA) collects, uses and protects your information.",
  alternates: { canonical: "/privacy" },
};

const EMAIL = "officialthefineartist@gmail.com";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-extrabold md:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted md:text-base">
        {children}
      </div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-cream px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-36">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-crimson">Privacy Policy</p>
          <h1 className="mt-3 text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
            How we look after your information.
          </h1>
          <p className="mt-4 text-sm text-muted">Last updated: 22 October 2026</p>

          <Section title="Who we are">
            <p>
              The Fine Artist Community (TFA) is an art community in Nigeria. This page
              explains what information we collect when you use this website, why we collect
              it, and the choices you have. You can reach us any time at{" "}
              <a href={`mailto:${EMAIL}`} className="font-bold text-crimson underline underline-offset-2">
                {EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="What we collect">
            <p>When you join, we ask for:</p>
            <List
              items={[
                "Your name, email address and password. Your password is handled securely by our login provider, and we cannot see it.",
                "Your date of birth, phone number, city, state and country.",
                "Your member type, art interests, goals and how you heard about us.",
                "Your bio, Instagram handle and profile photo, if you add them.",
              ]}
            />
            <p>As you use the site, you may also add:</p>
            <List
              items={[
                "Artwork photos, with titles and captions.",
                "Details and photos of art materials you donate, and the materials you collect.",
              ]}
            />
            <p>
              We also use simple visit and speed statistics to see how many people visit
              the site and how well it runs. We use a login session to keep you signed in.
            </p>
          </Section>

          <Section title="Why we use it">
            <List
              items={[
                "To manage your membership and let you log in.",
                "To run community features: the feed, your portfolio, the blog and materials sharing.",
                "To send you community emails and to celebrate your birthday.",
                "To keep the community safe, including removing content that breaks our rules.",
                "To understand and improve the website.",
              ]}
            />
          </Section>

          <Section title="Who can see what">
            <List
              items={[
                "Anyone visiting the website: only the profile photos of our newest members, shown on the homepage.",
                "Logged-in members: your profile (name, photo, bio, art interests, state, country and Instagram), your artwork, and the materials you list.",
                "Only you and TFA admins: your email address, date of birth, phone number, city, goals and how you heard about us.",
                "Materials sharing: when a member collects an item, the donor and the collector see each other's name, phone number, Instagram and email so they can arrange pickup. No one else sees these details.",
              ]}
            />
          </Section>

          <Section title="Who we share it with">
            <p>
              We do not sell your information. We use trusted services to run the website:
              Supabase for our database, login and file storage, and Vercel for hosting and
              site statistics. These services may store information on servers outside
              Nigeria. They process it only to run the website for us.
            </p>
          </Section>

          <Section title="How long we keep it">
            <p>
              We keep your information for as long as you are a member. If you ask us to
              delete your account, we will promptly delete your details and your artwork.
            </p>
          </Section>

          <Section title="Your choices and rights">
            <p>You can ask us at any time to:</p>
            <List
              items={[
                "Show you the information we hold about you.",
                "Correct anything that is wrong.",
                "Delete your account and your information.",
                "Stop sending you community emails.",
              ]}
            />
            <p>
              You can also remove your own artwork yourself from your account page. If you
              are not happy with how we handle your information, you have the right to
              complain to the Nigeria Data Protection Commission.
            </p>
          </Section>

          <Section title="Keeping it safe">
            <p>
              We limit who can see private details and use access rules in our database so
              members can only change their own information. No website can promise perfect
              security, so please choose a strong password and keep it private.
            </p>
          </Section>

          <Section title="Changes to this page">
            <p>
              If we change how we use your information, we will update this page and the
              date at the top.
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}
