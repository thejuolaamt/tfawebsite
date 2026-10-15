"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WHATSAPP_URL } from "@/lib/links";

type Artwork = {
  id: string;
  title: string;
  medium: string;
  image: string;
};

type Member = {
  id: string;
  name: string;
  email: string;
  birthdate: string;
  role: string;
  bio: string;
  avatar: string;
  artworks: Artwork[];
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function formatBirthdayDisplay(birthdate: string, includeYear: boolean) {
  if (!birthdate) return "";
  const parts = birthdate.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (MONTHS[monthIndex] && !isNaN(day)) {
      return includeYear
        ? `${MONTHS[monthIndex]} ${day}, ${year}`
        : `${MONTHS[monthIndex]} ${day}`;
    }
  }
  return birthdate;
}

export default function AccountPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [showBirthYear, setShowBirthYear] = useState(false);
  const [title, setTitle] = useState("");
  const [medium, setMedium] = useState("");
  const [artImage, setArtImage] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("tfa_member");
    if (raw) {
      try {
        setMember(JSON.parse(raw));
      } catch {}
    }
  }, []);

  function handleArtSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 700;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const min = Math.min(img.width, img.height);
          ctx.drawImage(
            img,
            (img.width - min) / 2,
            (img.height - min) / 2,
            min,
            min,
            0,
            0,
            size,
            size
          );
          setArtImage(canvas.toDataURL("image/jpeg", 0.85));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function handlePostArtwork(e: React.FormEvent) {
    e.preventDefault();
    if (!member || !artImage || !title) return;
    setUploading(true);
    const res = await fetch("/api/artwork", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: member.id,
        title,
        medium,
        image: artImage,
      }),
    });
    const data = await res.json();
    setUploading(false);
    if (res.ok && data.member) {
      setMember(data.member);
      localStorage.setItem("tfa_member", JSON.stringify(data.member));
      setTitle("");
      setMedium("");
      setArtImage("");
      setShowUpload(false);
    }
  }

  if (!member) {
    return (
      <>
        <Navbar />
        <main className="bg-cream px-4 pb-24 pt-32 text-center text-ink sm:px-6">
          <div className="mx-auto max-w-lg rounded-[28px] border border-line bg-paper p-8">
            <p className="eyebrow text-crimson">Member Portfolio</p>
            <h1 className="mt-2 text-3xl font-extrabold">Sign in to your account</h1>
            <p className="mt-3 text-sm text-muted">
              Create your official TFA member account or log in to post your artwork in your portfolio grid.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/join"
                className="rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream"
              >
                Become a Member / Log In
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-cream px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-32">
        <div className="mx-auto max-w-4xl">
          {/* Instagram-style Profile Top */}
          <div className="rounded-[32px] border border-line bg-paper p-6 sm:p-10">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="size-20 rounded-full border-2 border-crimson object-cover sm:size-24"
                />
                <div>
                  <p className="eyebrow text-crimson">{member.role}</p>
                  <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                    {member.name}
                  </h1>
                  {member.bio && (
                    <p className="mt-1 max-w-md text-sm text-muted">{member.bio}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span>
                      🎂 Birthday:{" "}
                      <strong className="text-ink">
                        {formatBirthdayDisplay(member.birthdate, showBirthYear)}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowBirthYear(!showBirthYear)}
                      className="rounded-full border border-line bg-cream px-2.5 py-0.5 text-[11px] font-bold text-crimson hover:bg-crimson/10"
                      title="Your birth year is private and only visible to you as the account owner"
                    >
                      {showBirthYear ? "Hide year" : "Show birth year (Only you)"}
                    </button>
                    <span>•</span>
                    <span>{member.artworks?.length || 0} artworks</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowUpload(!showUpload)}
                  className="rounded-full bg-crimson px-5 py-2.5 text-sm font-bold text-cream transition hover:bg-crimson-deep"
                >
                  {showUpload ? "Cancel" : "+ Post Artwork"}
                </button>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border-[1.5px] border-crimson px-5 py-2.5 text-sm font-bold text-crimson transition hover:bg-crimson hover:text-cream"
                >
                  WhatsApp Group
                </a>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("tfa_member");
                    setMember(null);
                  }}
                  className="rounded-full border border-line px-4 py-2.5 text-xs font-bold text-muted hover:text-ink"
                >
                  Log out
                </button>
              </div>
            </div>

            {showUpload && (
              <form
                onSubmit={handlePostArtwork}
                className="mt-6 border-t border-line pt-6"
              >
                <h2 className="text-lg font-bold">Add Artwork to Portfolio Grid</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleArtSelect}
                    className="block w-full text-xs text-ink file:mr-3 file:rounded-full file:border-0 file:bg-crimson file:px-4 file:py-2 file:text-xs file:font-bold file:text-cream"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Artwork title *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-2xl border border-line bg-cream px-4 py-2.5 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Medium (e.g. Oil on canvas)"
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    className="rounded-2xl border border-line bg-cream px-4 py-2.5 text-sm"
                  />
                </div>
                {artImage && (
                  <button
                    type="submit"
                    disabled={uploading}
                    className="mt-4 rounded-full bg-crimson px-6 py-2.5 text-sm font-bold text-cream"
                  >
                    {uploading ? "Posting..." : "Publish to Grid"}
                  </button>
                )}
              </form>
            )}
          </div>

          {/* IG-Style 3-Column Square Portfolio Grid */}
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-crimson">
                Portfolio Grid
              </span>
              <Link href="/blog" className="text-xs font-bold text-ink underline">
                Read Community Blogposts →
              </Link>
            </div>

            {!member.artworks || member.artworks.length === 0 ? (
              <div className="rounded-[28px] border border-line bg-paper p-12 text-center">
                <p className="font-bold">No artworks posted yet</p>
                <p className="mt-1 text-sm text-muted">
                  Use &ldquo;+ Post Artwork&rdquo; above to display your works in a clean square portfolio grid.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {member.artworks.map((art) => (
                  <div
                    key={art.id}
                    className="group relative aspect-square overflow-hidden rounded-2xl bg-ink"
                  >
                    <img
                      src={art.image}
                      alt={art.title}
                      className="size-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end bg-ink/70 p-3 opacity-0 transition group-hover:opacity-100">
                      <p className="text-sm font-bold text-cream">{art.title}</p>
                      <p className="text-xs text-cream/75">{art.medium}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
