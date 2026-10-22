"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import { createClient } from "@/lib/supabase/client";

const REPORT_EMAIL = "officialthefineartist@gmail.com";
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MEMBER_LABELS: Record<string, string> = {
  student: "Student",
  hobbyist: "Hobbyist",
  emerging: "Emerging artist",
  professional: "Professional artist",
  educator: "Art educator",
  enthusiast: "Art enthusiast",
};

// Only public details. Birthday, phone, email and city are never loaded here.
type Artist = {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  country: string | null;
  state: string | null;
  disciplines: string[] | null;
  member_type: string | null;
  instagram: string | null;
};

type Artwork = {
  id: string;
  image_url: string;
  title: string | null;
  caption: string | null;
  created_at: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ArtistPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";

  const [status, setStatus] = useState<"loading" | "signedOut" | "ready" | "missing" | "error">(
    "loading"
  );
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isMe, setIsMe] = useState(false);
  const [selected, setSelected] = useState<Artwork | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!ID_PATTERN.test(id)) {
        setStatus("missing");
        return;
      }

      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!auth.user) {
        setStatus("signedOut");
        return;
      }

      const [profile, art] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, bio, avatar_url, country, state, disciplines, member_type, instagram")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("artworks")
          .select("id, image_url, title, caption, created_at")
          .eq("user_id", id)
          .order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;

      if (profile.error || art.error) {
        setStatus("error");
        return;
      }
      if (!profile.data) {
        setStatus("missing");
        return;
      }

      setArtist(profile.data as Artist);
      setArtworks((art.data ?? []) as Artwork[]);
      setIsMe(auth.user.id === id);
      setStatus("ready");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Close the big view with the Esc key
  useEffect(() => {
    if (!selected) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const name = artist?.full_name?.trim() || "TFA member";
  const place = [artist?.state, artist?.country].filter(Boolean).join(", ");
  const handle =
    artist?.instagram && /^[A-Za-z0-9._]{1,30}$/.test(artist.instagram) ? artist.instagram : "";

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-paper px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <Link href="/feed" className="text-sm font-bold text-crimson hover:underline">
            &larr; Back to the feed
          </Link>

          {status === "loading" && <p className="mt-10 text-muted">Loading...</p>}

          {status === "error" && (
            <p className="mt-10 text-muted">
              We could not load this profile right now. Please try again shortly.
            </p>
          )}

          {status === "missing" && (
            <div className="mt-10 max-w-lg rounded-[28px] border border-line bg-cream p-6 sm:p-8">
              <p className="text-lg font-bold">We could not find this artist.</p>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                The profile may not be finished yet, or the link may be wrong.
              </p>
              <Link
                href="/feed"
                className="mt-5 inline-block rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream transition hover:bg-crimson-deep"
              >
                Go to the feed
              </Link>
            </div>
          )}

          {status === "signedOut" && (
            <div className="mt-10 max-w-lg rounded-[28px] border border-line bg-cream p-6 sm:p-8">
              <p className="text-lg font-bold">Artist profiles are for members.</p>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Log in or join the community for free to see our artists and their work.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream transition hover:bg-crimson-deep"
                >
                  Log in
                </Link>
                <Link
                  href="/join"
                  className="rounded-full border border-crimson px-6 py-3 text-sm font-bold text-crimson transition hover:bg-crimson hover:text-cream"
                >
                  Become a member
                </Link>
              </div>
            </div>
          )}

          {status === "ready" && artist && (
            <>
              {/* Artist details */}
              <section className="mt-6 flex flex-col items-center gap-6 rounded-[28px] border border-line bg-cream p-6 text-center sm:flex-row sm:items-start sm:p-8 sm:text-left">
                <Avatar
                  src={artist.avatar_url}
                  name={name}
                  className="size-28 border-4 border-crimson text-3xl sm:size-32"
                />
                <div className="min-w-0 flex-1">
                  {artist.member_type && MEMBER_LABELS[artist.member_type] && (
                    <p className="eyebrow text-crimson">{MEMBER_LABELS[artist.member_type]}</p>
                  )}
                  <h1 className="mt-1 text-[2rem] font-extrabold leading-tight sm:text-4xl">
                    {name}
                  </h1>
                  {place && <p className="mt-1 text-sm text-muted">{place}</p>}

                  {artist.bio && (
                    <p className="mt-4 max-w-2xl whitespace-pre-line text-[15px] leading-relaxed">
                      {artist.bio}
                    </p>
                  )}

                  {artist.disciplines && artist.disciplines.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                      {artist.disciplines.map((d) => (
                        <span
                          key={d}
                          className="rounded-full bg-paper px-3 py-1 text-xs font-bold"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                    {handle && (
                      <a
                        href={`https://instagram.com/${handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-crimson underline underline-offset-4 hover:text-crimson-deep"
                      >
                        @{handle} on Instagram
                      </a>
                    )}
                    {isMe && (
                      <Link
                        href="/account"
                        className="rounded-full border-[1.5px] border-crimson px-5 py-2 text-xs font-bold text-crimson transition hover:bg-crimson hover:text-cream"
                      >
                        This is you. Edit on your account
                      </Link>
                    )}
                  </div>
                </div>
              </section>

              {/* Portfolio */}
              <h2 className="mt-12 text-2xl font-extrabold">
                Portfolio{artworks.length > 0 ? ` (${artworks.length})` : ""}
              </h2>

              {artworks.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed border-line bg-cream px-5 py-10 text-center text-sm text-muted">
                  {name} has not shared any artwork yet.
                </p>
              ) : (
                <div className="mt-6 columns-2 gap-3 sm:columns-3 md:gap-4 lg:columns-4">
                  {artworks.map((art) => (
                    <button
                      key={art.id}
                      type="button"
                      onClick={() => setSelected(art)}
                      className="mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-cream md:mb-4"
                      aria-label={art.title ? `Open ${art.title}` : "Open artwork"}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={art.image_url}
                        alt={art.title ?? "Artwork"}
                        loading="lazy"
                        className="w-full transition duration-300 hover:scale-[1.03]"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Big view of one artwork */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/85 p-4"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="max-h-full w-full max-w-2xl overflow-y-auto rounded-[24px] bg-cream p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.image_url}
              alt={selected.title ?? "Artwork"}
              className="max-h-[60vh] w-full rounded-2xl object-contain"
            />
            <p className="mt-4 text-xs text-muted">
              {name} &middot; {formatDate(selected.created_at)}
            </p>
            {selected.title && <h3 className="mt-2 text-xl font-extrabold">{selected.title}</h3>}
            {selected.caption && (
              <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-muted">
                {selected.caption}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full bg-crimson px-6 py-2.5 text-sm font-bold text-cream"
              >
                Close
              </button>
              {!isMe && (
                <a
                  href={`mailto:${REPORT_EMAIL}?subject=${encodeURIComponent("Report a TFA artwork")}&body=${encodeURIComponent(`I would like to report this artwork (ID: ${selected.id}) by ${name}. Reason: `)}`}
                  className="text-sm font-bold text-muted underline underline-offset-4 hover:text-crimson"
                >
                  Report
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}