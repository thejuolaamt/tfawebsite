"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { resizeImage } from "@/lib/image";
import { storagePathFromUrl } from "@/lib/materials";

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

type Artwork = {
  id: string;
  image_url: string;
  title: string | null;
  caption: string | null;
  created_at: string;
};

const MEMBER_LABELS: Record<string, string> = {
  student: "Student",
  hobbyist: "Hobbyist",
  emerging: "Emerging artist",
  professional: "Professional artist",
  educator: "Art educator",
  enthusiast: "Art enthusiast",
};

const FIELD =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/20";

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
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [failed, setFailed] = useState(false);

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [given, setGiven] = useState(0);
  const [received, setReceived] = useState(0);

  // Add artwork form
  const [showUpload, setShowUpload] = useState(false);
  const [artBlob, setArtBlob] = useState<Blob | null>(null);
  const [artPreview, setArtPreview] = useState("");
  const [artTitle, setArtTitle] = useState("");
  const [artCaption, setArtCaption] = useState("");
  const [artError, setArtError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Big view of one artwork
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [deleting, setDeleting] = useState(false);

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

      setUserId(user.id);
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

      // Artwork and materials numbers load after the profile shows
      const [art, gave, got] = await Promise.all([
        supabase
          .from("artworks")
          .select("id, image_url, title, caption, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("materials")
          .select("id", { count: "exact", head: true })
          .eq("donor_id", user.id)
          .eq("status", "collected"),
        supabase
          .from("materials")
          .select("id", { count: "exact", head: true })
          .eq("collected_by", user.id)
          .eq("status", "collected"),
      ]);

      if (cancelled) return;
      setArtworks((art.data ?? []) as Artwork[]);
      setGiven(gave.count ?? 0);
      setReceived(got.count ?? 0);
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

  async function onArtPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setArtError("");

    if (!file.type.startsWith("image/")) {
      setArtError("Please choose an image (JPG or PNG).");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setArtError("That image is too large. Please choose one under 25 MB.");
      return;
    }

    try {
      const blob = await resizeImage(file, 1600);
      if (artPreview) URL.revokeObjectURL(artPreview);
      setArtBlob(blob);
      setArtPreview(URL.createObjectURL(blob));
    } catch {
      setArtError("We could not read that image. Please try a JPG or PNG.");
    }
  }

  function closeUpload() {
    if (artPreview) URL.revokeObjectURL(artPreview);
    setShowUpload(false);
    setArtBlob(null);
    setArtPreview("");
    setArtTitle("");
    setArtCaption("");
    setArtError("");
  }

  async function uploadArt() {
    if (!artBlob || !userId) {
      setArtError("Please choose an image first.");
      return;
    }
    setUploading(true);
    setArtError("");

    const supabase = createClient();
    const path = `${userId}/${Date.now()}.jpg`;

    const { error: upError } = await supabase.storage
      .from("artworks")
      .upload(path, artBlob, { contentType: "image/jpeg" });

    if (upError) {
      setUploading(false);
      setArtError("We could not upload your artwork. Please try again.");
      return;
    }

    const { data: pub } = supabase.storage.from("artworks").getPublicUrl(path);

    const { data: inserted, error: insError } = await supabase
      .from("artworks")
      .insert({
        user_id: userId,
        image_url: pub.publicUrl,
        title: artTitle.trim() || null,
        caption: artCaption.trim() || null,
      })
      .select("id, image_url, title, caption, created_at")
      .single();

    if (insError || !inserted) {
      await supabase.storage.from("artworks").remove([path]);
      setUploading(false);
      setArtError("We could not save your artwork. Please try again.");
      return;
    }

    setArtworks((list) => [inserted as Artwork, ...list]);
    setUploading(false);
    closeUpload();
  }

  async function deleteArt(art: Artwork) {
    if (!window.confirm("Delete this artwork? This cannot be undone.")) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("artworks").delete().eq("id", art.id);
    if (!error) {
      const path = storagePathFromUrl(art.image_url, "artworks");
      if (path) await supabase.storage.from("artworks").remove([path]);
      setArtworks((list) => list.filter((a) => a.id !== art.id));
      setSelected(null);
    }
    setDeleting(false);
  }

  const location = member
    ? [member.state, member.country].filter(Boolean).join(", ")
    : "";
  const birthday = member ? formatBirthday(member.birthDate) : "";

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <Navbar />

      <main className="mx-auto max-w-4xl px-5 pb-14 pt-28 sm:px-8 md:pt-32">
        {loading && <p className="text-center text-muted">Loading your profile...</p>}

        {failed && (
          <p role="alert" className="rounded-xl bg-crimson/10 px-4 py-3 text-sm font-medium text-crimson-deep">
            We could not load your profile. Please refresh the page, or log out and back in.
          </p>
        )}

        {member && (
          <>
            {/* Profile header */}
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
              <Avatar
                src={member.avatarUrl}
                name={member.fullName}
                className="size-32 border-4 border-crimson text-3xl sm:size-40"
              />

              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                  {member.fullName || "Your profile"}
                </h1>

                <p className="mt-1.5 text-[15px] text-muted">
                  {[MEMBER_LABELS[member.memberType] ?? member.memberType, location]
                    .filter(Boolean)
                    .join(" \u00B7 ")}
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
            </div>

            {/* Log out */}
            <div className="mt-8 flex justify-center sm:justify-start">
              <button
                type="button"
                onClick={logOut}
                disabled={loggingOut}
                className="rounded-full border-[1.5px] border-crimson px-5 py-2 text-sm font-bold text-crimson transition hover:bg-crimson hover:text-cream disabled:opacity-50"
              >
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>

            {/* Artwork grid */}
            <div className="mt-14 border-t border-line pt-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-extrabold">Your artwork</h2>
                {!showUpload && (
                  <button
                    type="button"
                    onClick={() => setShowUpload(true)}
                    className="rounded-full bg-crimson px-5 py-2.5 text-sm font-bold text-cream transition hover:bg-crimson-deep"
                  >
                    + Add artwork
                  </button>
                )}
              </div>

              {showUpload && (
                <div className="mt-5 rounded-[24px] border border-line bg-paper p-5">
                  {artPreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={artPreview}
                      alt="Your artwork preview"
                      className="mb-4 max-h-72 w-full rounded-2xl object-contain"
                    />
                  )}

                  <label className="inline-block cursor-pointer rounded-full border-[1.5px] border-crimson px-5 py-2 text-sm font-bold text-crimson transition hover:bg-crimson hover:text-cream">
                    {artPreview ? "Change image" : "Choose image"}
                    <input type="file" accept="image/*" onChange={onArtPick} className="sr-only" />
                  </label>

                  <div className="mt-4 space-y-3">
                    <input
                      value={artTitle}
                      maxLength={80}
                      onChange={(e) => setArtTitle(e.target.value)}
                      placeholder="Title (optional)"
                      className={FIELD}
                    />
                    <textarea
                      value={artCaption}
                      maxLength={300}
                      rows={3}
                      onChange={(e) => setArtCaption(e.target.value)}
                      placeholder="Tell us about it: medium, size, story (optional)"
                      className={FIELD}
                    />
                  </div>

                  {artError && (
                    <p role="alert" className="mt-3 rounded-xl bg-crimson/10 px-4 py-3 text-sm font-medium text-crimson-deep">
                      {artError}
                    </p>
                  )}

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={uploadArt}
                      disabled={uploading || !artBlob}
                      className="rounded-full bg-crimson px-6 py-2.5 text-sm font-bold text-cream transition hover:bg-crimson-deep disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploading ? "Uploading..." : "Post artwork"}
                    </button>
                    <button
                      type="button"
                      onClick={closeUpload}
                      disabled={uploading}
                      className="rounded-full px-5 py-2.5 text-sm font-bold text-muted hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {artworks.length > 0 ? (
                <div className="mt-5 grid grid-cols-3 gap-1.5 sm:gap-3">
                  {artworks.map((art) => (
                    <button
                      key={art.id}
                      type="button"
                      onClick={() => setSelected(art)}
                      className="aspect-square overflow-hidden rounded-lg bg-paper"
                      aria-label={art.title ? `Open ${art.title}` : "Open artwork"}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={art.image_url}
                        alt={art.title ?? "Artwork"}
                        loading="lazy"
                        className="size-full object-cover transition hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                !showUpload && (
                  <p className="mt-5 rounded-2xl border border-dashed border-line bg-paper px-5 py-8 text-center text-sm text-muted">
                    No artwork yet. Tap &ldquo;Add artwork&rdquo; to post your first piece.
                  </p>
                )
              )}
            </div>

            {/* Materials sharing */}
            <div className="mt-14 rounded-[24px] border border-line bg-paper p-6 sm:p-8">
              <p className="eyebrow text-crimson">Materials sharing</p>
              <h2 className="mt-2 text-xl font-extrabold">Artists giving to artists.</h2>
              <div className="mt-4 flex gap-8">
                <div>
                  <p className="font-display text-4xl font-extrabold leading-none text-crimson">{given}</p>
                  <p className="mt-1 text-xs text-muted">{given === 1 ? "item given" : "items given"}</p>
                </div>
                <div>
                  <p className="font-display text-4xl font-extrabold leading-none text-crimson">{received}</p>
                  <p className="mt-1 text-xs text-muted">
                    {received === 1 ? "item received" : "items received"}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/materials"
                  className="rounded-full bg-crimson px-5 py-2.5 text-sm font-bold text-cream transition hover:bg-crimson-deep"
                >
                  Browse materials
                </Link>
                <Link
                  href="/materials/donate"
                  className="rounded-full border-[1.5px] border-crimson px-5 py-2.5 text-sm font-bold text-crimson transition hover:bg-crimson hover:text-cream"
                >
                  Donate materials
                </Link>
                <Link
                  href="/materials/mine"
                  className="rounded-full px-3 py-2.5 text-sm font-bold text-muted hover:text-ink"
                >
                  My materials
                </Link>
              </div>
            </div>

            {/* Blog link */}
            <div className="mt-8 rounded-[24px] bg-crimson p-8 text-cream">
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
            </div>
          </>
        )}
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
            {selected.title && <h3 className="mt-4 text-xl font-extrabold">{selected.title}</h3>}
            {selected.caption && (
              <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-muted">
                {selected.caption}
              </p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full bg-crimson px-6 py-2.5 text-sm font-bold text-cream"
              >
                Close
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => deleteArt(selected)}
                className="rounded-full border-[1.5px] border-ink px-6 py-2.5 text-sm font-bold text-ink transition hover:bg-ink hover:text-cream disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
