"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { resizeImage } from "@/lib/image";
import { CATEGORIES, CONDITIONS, INPUT_CLASS } from "@/lib/materials";

type Form = {
  title: string;
  category: string;
  condition: string;
  description: string;
  location: string;
  delivery: boolean;
  agree: boolean;
};

const EMPTY: Form = {
  title: "",
  category: "",
  condition: "",
  description: "",
  location: "",
  delivery: false,
  agree: false,
};

export default function DonatePage() {
  const [auth, setAuth] = useState<"loading" | "in" | "out">("loading");
  const [userId, setUserId] = useState("");
  const [form, setForm] = useState<Form>(EMPTY);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) {
          setUserId(data.user.id);
          setAuth("in");
        } else {
          setAuth("out");
        }
      });
  }, []);

  function set(patch: Partial<Form>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please choose a photo (JPG or PNG).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("That photo is too large. Please choose one under 20 MB.");
      return;
    }

    try {
      const blob = await resizeImage(file, 1400);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoBlob(blob);
      setPhotoPreview(URL.createObjectURL(blob));
    } catch {
      setError("We could not read that photo. Please try a JPG or PNG image.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.title.trim().length < 3) return setError("Please give the item a short title.");
    if (!form.category) return setError("Please choose a category.");
    if (!form.condition) return setError("Please choose the condition.");
    if (form.location.trim().length < 2)
      return setError("Please tell us where the item can be collected from.");
    if (!photoBlob) return setError("Please add a photo of the item.");
    if (!form.agree) return setError("Please tick the box to confirm.");

    setSubmitting(true);
    const supabase = createClient();
    const path = `${userId}/${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("materials")
      .upload(path, photoBlob, { contentType: "image/jpeg" });

    if (uploadError) {
      setSubmitting(false);
      return setError("We could not upload your photo. Please try again.");
    }

    const { data: pub } = supabase.storage.from("materials").getPublicUrl(path);

    const { error: insertError } = await supabase.from("materials").insert({
      donor_id: userId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      item_condition: form.condition,
      location: form.location.trim(),
      delivery_available: form.delivery,
      image_url: pub.publicUrl,
    });

    if (insertError) {
      await supabase.storage.from("materials").remove([path]);
      setSubmitting(false);
      return setError(
        insertError.code === "42501"
          ? "You already have 5 donations waiting for approval, or your profile is not finished yet. Please wait for approval and try again."
          : "We could not save your donation. Please try again."
      );
    }

    setSubmitting(false);
    setDone(true);
  }

  function another() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setForm(EMPTY);
    setPhotoBlob(null);
    setPhotoPreview("");
    setError("");
    setDone(false);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-paper px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-32">
        <div className="mx-auto max-w-2xl">
          <Link href="/materials" className="text-sm font-bold text-crimson hover:underline">
            &larr; Back to materials
          </Link>
          <p className="eyebrow mt-6 text-crimson">Donate materials</p>
          <h1 className="mt-3 text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
            Give something to a fellow artist.
          </h1>

          {auth === "loading" && <p className="mt-10 text-muted">Loading...</p>}

          {auth === "out" && (
            <div className="mt-10 rounded-[28px] border border-line bg-cream p-6 sm:p-8">
              <p className="text-lg font-bold">Please log in to donate.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream"
                >
                  Log in
                </Link>
                <Link
                  href="/join"
                  className="rounded-full border border-crimson px-6 py-3 text-sm font-bold text-crimson"
                >
                  Become a member
                </Link>
              </div>
            </div>
          )}

          {auth === "in" && done && (
            <div className="mt-10 rounded-[28px] bg-crimson p-8 text-cream">
              <h2 className="text-2xl font-extrabold">Thank you for giving.</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-cream/90">
                Your donation is waiting for a quick review by the TFA team. Once it is approved,
                it appears on the materials page and members can collect it.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={another}
                  className="rounded-full bg-cream px-6 py-3 text-sm font-bold text-crimson"
                >
                  Donate another item
                </button>
                <Link
                  href="/materials/mine"
                  className="rounded-full border-[1.5px] border-cream px-6 py-3 text-sm font-bold text-cream"
                >
                  See my materials
                </Link>
              </div>
            </div>
          )}

          {auth === "in" && !done && (
            <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-bold">
                  What are you giving?
                </label>
                <input
                  id="title"
                  value={form.title}
                  maxLength={80}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder="e.g. Set of 12 acrylic paints"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className="mb-1.5 block text-sm font-bold">
                    Category
                  </label>
                  <select
                    id="category"
                    value={form.category}
                    onChange={(e) => set({ category: e.target.value })}
                    className={INPUT_CLASS}
                  >
                    <option value="">Choose one</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="condition" className="mb-1.5 block text-sm font-bold">
                    Condition
                  </label>
                  <select
                    id="condition"
                    value={form.condition}
                    onChange={(e) => set({ condition: e.target.value })}
                    className={INPUT_CLASS}
                  >
                    <option value="">Choose one</option>
                    {CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-bold">
                  Details <span className="font-normal text-muted">(optional)</span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  maxLength={500}
                  value={form.description}
                  onChange={(e) => set({ description: e.target.value })}
                  placeholder="Brand, quantity, anything worth knowing."
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="location" className="mb-1.5 block text-sm font-bold">
                  Where can it be collected from?
                </label>
                <input
                  id="location"
                  value={form.location}
                  maxLength={100}
                  onChange={(e) => set({ location: e.target.value })}
                  placeholder="Area or town, e.g. Ondo City"
                  className={INPUT_CLASS}
                />
                <p className="mt-1.5 text-xs text-muted">
                  Only share the general area. Exact pickup details are arranged privately later.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.delivery}
                  onChange={(e) => set({ delivery: e.target.checked })}
                  className="size-4 accent-crimson"
                />
                I can deliver this item (arranged between us)
              </label>

              <div className="rounded-[24px] border border-line bg-cream p-5">
                <p className="text-sm font-bold">Photo</p>
                {photoPreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt="Your item"
                    className="mt-3 max-h-64 w-full rounded-2xl object-cover"
                  />
                )}
                <label className="mt-3 inline-block cursor-pointer rounded-full border-[1.5px] border-crimson px-5 py-2 text-sm font-bold text-crimson transition hover:bg-crimson hover:text-cream">
                  {photoPreview ? "Change photo" : "Choose photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPhotoChange}
                    className="sr-only"
                  />
                </label>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-cream p-4 text-[13px] leading-relaxed text-muted">
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={(e) => set({ agree: e.target.checked })}
                  className="mt-0.5 size-4 shrink-0 accent-crimson"
                />
                <span>
                  This item is mine to give and is safe to use. When someone collects it, they will
                  see my name and contact details so we can arrange pickup. TFA only connects donors
                  and collectors and is not responsible for the item or the handover.
                </span>
              </label>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-crimson/10 px-4 py-3 text-sm font-medium text-crimson-deep"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-crimson px-8 py-3.5 text-[15px] font-bold text-cream transition hover:bg-crimson-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Submit donation"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
