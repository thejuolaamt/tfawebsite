"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ---------- Types and helpers ---------- */

type Member = {
  fullName: string;
  avatarUrl: string;
  memberType: string;
  state: string;
  country: string;
  disciplines: string[];
  bio: string;
  instagram: string;
  birthDate: string;
};

const MEMBER_LABELS: Record<string, string> = {
  student: "Student",
  hobbyist: "Hobbyist",
  emerging: "Emerging artist",
  professional: "Professional artist",
  educator: "Art educator",
  enthusiast: "Art enthusiast",
};

function formatBirthday(value: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}

/* ---------- Page ---------- */

export default function AccountPage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();

      if (!auth.user) {
        router.replace("/login");
        return;
      }

      const user = auth.user;
      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;

      const { data: row, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setFailed(true);
        setLoading(false);
        return;
      }

      const p = (row ?? {}) as Record<string, unknown>;
      const text = (a: unknown, b: unknown) =>
        (typeof a === "string" && a) || (typeof b === "string" && b) || "";
      const list = (a: unknown, b: unknown): string[] =>
        Array.isArray(a) ? (a as string[]) : Array.isArray(b) ? (b as string[]) : [];

      setMember({
        fullName: text(p.full_name, meta.full_name),
        avatarUrl: text(p.avatar_url, ""),
        memberType: text(p.member_type, meta.member_type),
        state: text(p.state, meta.state),
        country: text(p.country, meta.country),
        disciplines: list(p.disciplines, meta.disciplines),
        bio: text(p.bio, ""),
        instagram: text(p.instagram, meta.instagram),
        birthDate: text(meta.birth_date, ""),
      });
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function logOut() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  const location = member
    ? [member.state, member.country].filter(Boolean).join(", ")
    : "";
  const birthday = member ? formatBirthday(member.birthDate) : "";

  return (
    <div className="min-h-dvh bg-cream text-ink">
      {/* Top bar */}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/" aria-label="The Fine Artist Community, home">
            <Image
              src="/images/tfa-logo-mark.png"
              alt="The Fine Artist Community logo"
              width={240}
              height={133}
              priority
              className="h-8 w-auto"
            />
          </Link>
          <button
            type="button"
            onClick={logOut}
            disabled={loggingOut || loading}
            className="rounded-full border-[1.5px] border-crimson px-5 py-2 text-sm font-bold text-crimson transition hover:bg-crimson hover:text-cream disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        {loading && <p className="text-center text-muted">Loading your profile...</p>}

        {failed && (
          <p role="alert" className="rounded-xl bg-crimson/10 px-4 py-3 text-sm font-medium text-crimson-deep">
            We could not load your profile. Please refresh the page, or log out and back in.
          </p>
        )}

        {member && (
          <>
            {/* Profile header */}
            <section className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="size-32 shrink-0 overflow-hidden rounded-full border-4 border-crimson bg-paper sm:size-40">
                {member.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.avatarUrl}
                    alt={`${member.fullName || "Your"} profile photo`}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center px-3 text-xs text-muted">
                    No photo
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                  {member.fullName || "Your profile"}
                </h1>

                <p className="mt-1.5 text-[15px] text-muted">
                  {[MEMBER_LABELS[member.memberType] ?? member.memberType, location]
                    .filter(Boolean)
                    .join(" · ")}
                </p>

                {member.bio && (
                  <p className="mt-4 max-w-xl text-[15px] leading-relaxed">{member.bio}</p>
                )}

                {member.instagram && (
                  <a
                    href={`https://instagram.com/${member.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-bold text-crimson hover:underline"
                  >
                    @{member.instagram}
                  </a>
                )}

                {member.disciplines.length > 0 && (
                  <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                    {member.disciplines.map((d) => (
                      <span
                        key={d}
                        className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-xs font-medium"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                {birthday && (
                  <p className="mt-5 text-xs text-muted">
                    Birthday: {birthday}{" "}
                    <span className="rounded-full bg-paper px-2 py-0.5 font-bold">
                      Private, only you see this
                    </span>
                  </p>
                )}
              </div>
            </section>

            {/* Artwork grid */}
            <section className="mt-14 border-t border-line pt-8">
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-extrabold">Your artwork</h2>
                <span className="text-xs text-muted">Uploads arrive in the next step</span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-1.5 sm:gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg border border-dashed border-line bg-paper"
                  />
                ))}
              </div>
              <p className="mt-5 text-center text-sm text-muted">
                No artwork yet. Soon you will be able to add your first piece here.
              </p>
            </section>

            {/* Blog link */}
            <section className="mt-14 rounded-[24px] bg-crimson p-8 text-cream">
              <p className="eyebrow text-cream/80">Community blog</p>
              <h2 className="mt-2 text-2xl font-extrabold">Stories from our artists.</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-cream/80">
                Read and share what the TFA community is making and thinking about.
              </p>
              <Link
                href="/blog"
                className="mt-5 inline-block rounded-full bg-cream px-6 py-3 text-sm font-bold text-crimson transition hover:bg-paper"
              >
                Visit the blog
              </Link>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
