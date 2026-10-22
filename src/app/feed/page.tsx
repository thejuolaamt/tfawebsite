"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import { createClient } from "@/lib/supabase/client";
import { storagePathFromUrl } from "@/lib/materials";

const PAGE_SIZE = 18;
const REPORT_EMAIL = "officialthefineartist@gmail.com";

const COLUMNS =
  "id, image_url, title, caption, created_at, user_id, profile:profiles!user_id(full_name, avatar_url)";

type FeedArtwork = {
  id: string;
  image_url: string;
  title: string | null;
  caption: string | null;
  created_at: string;
  user_id: string;
  profile: { full_name: string | null; avatar_url: string | null } | null;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function artistName(art: FeedArtwork) {
  return art.profile?.full_name?.trim() || "TFA member";
}

export default function FeedPage() {
  const [status, setStatus] = useState<"loading" | "signedOut" | "ready" | "error">("loading");
  const [items, setItems] = useState<FeedArtwork[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState<FeedArtwork | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!auth.user) {
        setStatus("signedOut");
        return;
      }

      const { data, error } = await supabase
        .from("artworks")
        .select(COLUMNS)
        .order("created_at", { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (cancelled) return;
      if (error) {
        setStatus("error");
        return;
      }
      const rows = (data ?? []) as unknown as FeedArtwork[];
      setItems(rows);
      setHasMore(rows.length === PAGE_SIZE);
      setUserId(auth.user?.id ?? null);
      const admin = await supabase.rpc("is_admin");
      if (cancelled) return;
      setIsAdmin(admin.data === true);
      setStatus("ready");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Close the big view with the Esc key
  useEffect(() => {
    if (!selected) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  async function removeArt(art: FeedArtwork) {
    if (!window.confirm("Remove this artwork from TFA? This cannot be undone.")) return;
    setRemoving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("artworks")
      .delete()
      .eq("id", art.id)
      .select("id");
    if (error || !data || data.length === 0) {
      setRemoving(false);
      window.alert("We could not remove this artwork. Please try again.");
      return;
    }
    const path = storagePathFromUrl(art.image_url, "artworks");
    if (path) await supabase.storage.from("artworks").remove([path]);
    setItems((prev) => prev.filter((p) => p.id !== art.id));
    setSelected(null);
    setRemoving(false);
  }

  async function loadMore() {
    setLoadingMore(true);
    const { data, error } = await createClient()
      .from("artworks")
      .select(COLUMNS)
      .order("created_at", { ascending: false })
      .range(items.length, items.length + PAGE_SIZE - 1);
    setLoadingMore(false);
    if (error) return;

    const rows = (data ?? []) as unknown as FeedArtwork[];
    setItems((prev) => {
      const seen = new Set(prev.map((p) => p.id));
      return [...prev, ...rows.filter((r) => !seen.has(r.id))];
    });
    setHasMore(rows.length === PAGE_SIZE);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-paper px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-crimson">Community feed</p>
              <h1 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-6xl">
                Fresh from our artists.
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted md:text-base">
                New artwork from TFA members, newest first.
              </p>
            </div>
            {status === "ready" && (
              <Link
                href="/account"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream transition hover:bg-crimson-deep"
              >
                Add your artwork
              </Link>
            )}
          </div>

          {status === "loading" && <p className="mt-10 text-muted">Loading...</p>}

          {status === "error" && (
            <p className="mt-10 text-muted">
              We could not load the feed right now. Please try again shortly.
            </p>
          )}

          {status === "signedOut" && (
            <div className="mt-10 max-w-lg rounded-[28px] border border-line bg-cream p-6 sm:p-8">
              <p className="text-lg font-bold">The feed is for members.</p>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Log in or join the community for free to see what our artists are making.
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

          {status === "ready" && items.length === 0 && (
            <p className="mt-10 rounded-2xl border border-dashed border-line bg-cream px-5 py-10 text-center text-sm text-muted">
              No artwork has been shared yet. Be the first: add a piece from your account.
            </p>
          )}

          {status === "ready" && items.length > 0 && (
            <>
              <div className="mt-10 columns-2 gap-3 sm:columns-3 md:gap-4 lg:columns-4">
                {items.map((art) => (
                  <article key={art.id} className="mb-3 break-inside-avoid md:mb-4">
                    <button
                      type="button"
                      onClick={() => setSelected(art)}
                      className="block w-full overflow-hidden rounded-2xl bg-cream"
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
                    <Link href={"/artist/" + art.user_id} className="mt-2 flex items-center gap-2 px-1 hover:text-crimson">
                      <Avatar
                        src={art.profile?.avatar_url}
                        name={artistName(art)}
                        className="size-6 text-[11px]"
                      />
                      <span className="truncate text-[13px] font-semibold">{artistName(art)}</span>
                    </Link>
                  </article>
                ))}
              </div>

              {hasMore && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-full border-[1.5px] border-crimson px-7 py-3 text-sm font-bold text-crimson transition hover:bg-crimson hover:text-cream disabled:opacity-60"
                  >
                    {loadingMore ? "Loading..." : "Load more"}
                  </button>
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
            <Link href={"/artist/" + selected.user_id} className="mt-4 flex items-center gap-3 hover:text-crimson">
              <Avatar
                src={selected.profile?.avatar_url}
                name={artistName(selected)}
                className="size-9"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{artistName(selected)}</p>
                <p className="text-xs text-muted">{formatDate(selected.created_at)}</p>
              </div>
            </Link>
            {selected.title && (
              <h3 className="mt-4 text-xl font-extrabold">{selected.title}</h3>
            )}
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
              {selected.user_id !== userId && (
                <a
                  href={`mailto:${REPORT_EMAIL}?subject=${encodeURIComponent("Report a TFA artwork")}&body=${encodeURIComponent(`I would like to report this artwork (ID: ${selected.id}) by ${artistName(selected)}. Reason: `)}`}
                  className="text-sm font-bold text-muted underline underline-offset-4 hover:text-crimson"
                >
                  Report
                </a>
              )}
              {isAdmin && (
                <button
                  type="button"
                  disabled={removing}
                  onClick={() => removeArt(selected)}
                  className="rounded-full border-[1.5px] border-ink px-6 py-2.5 text-sm font-bold text-ink transition hover:bg-ink hover:text-cream disabled:opacity-60"
                >
                  {removing ? "Removing..." : "Remove (admin)"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
