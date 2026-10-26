"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { resizeImage } from "@/lib/image";
import { INPUT_CLASS, storagePathFromUrl } from "@/lib/materials";

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  details: string | null;
  flyer_url: string;
  register_url: string | null;
  published: boolean;
};

const COLUMNS = "id, title, event_date, event_time, details, flyer_url, register_url, published";

function formatDate(value: string) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ManageEventsPage() {
  const [status, setStatus] = useState<"loading" | "signedOut" | "notAdmin" | "ready" | "error">(
    "loading"
  );
  const [events, setEvents] = useState<EventRow[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [notice, setNotice] = useState("");

  // Editor
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [details, setDetails] = useState("");
  const [registerUrl, setRegisterUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [flyerUrl, setFlyerUrl] = useState<string | null>(null);
  const [flyerBlob, setFlyerBlob] = useState<Blob | null>(null);
  const [flyerPreview, setFlyerPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

      const admin = await supabase.rpc("is_admin");
      if (cancelled) return;
      if (admin.data !== true) {
        setStatus("notAdmin");
        return;
      }

      const { data, error: listError } = await supabase
        .from("events")
        .select(COLUMNS)
        .order("event_date", { ascending: false });
      if (cancelled) return;
      if (listError) {
        setStatus("error");
        return;
      }
      setEvents((data ?? []) as EventRow[]);
      setStatus("ready");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function resetEditor() {
    if (flyerPreview) URL.revokeObjectURL(flyerPreview);
    setEditingId(null);
    setTitle("");
    setDate("");
    setTime("");
    setDetails("");
    setRegisterUrl("");
    setPublished(true);
    setFlyerUrl(null);
    setFlyerBlob(null);
    setFlyerPreview("");
    setError("");
  }

  function startNew() {
    resetEditor();
    setNotice("");
    setEditing(true);
  }

  function startEdit(ev: EventRow) {
    resetEditor();
    setNotice("");
    setEditingId(ev.id);
    setTitle(ev.title);
    setDate(ev.event_date);
    setTime(ev.event_time ?? "");
    setDetails(ev.details ?? "");
    setRegisterUrl(ev.register_url ?? "");
    setPublished(ev.published);
    setFlyerUrl(ev.flyer_url);
    setEditing(true);
  }

  function closeEditor() {
    resetEditor();
    setEditing(false);
    setReloadKey((k) => k + 1);
  }

  async function onFlyerPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image (JPG or PNG).");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("That image is too large. Please choose one under 25 MB.");
      return;
    }

    try {
      const blob = await resizeImage(file, 1600);
      if (flyerPreview) URL.revokeObjectURL(flyerPreview);
      setFlyerBlob(blob);
      setFlyerPreview(URL.createObjectURL(blob));
    } catch {
      setError("We could not read that image. Please try a JPG or PNG.");
    }
  }

  async function save() {
    setError("");
    setNotice("");

    const cleanTitle = title.trim();
    const cleanLink = registerUrl.trim();
    if (cleanTitle.length < 2) return setError("Please write the event title.");
    if (!date) return setError("Please choose the event date.");
    if (!flyerUrl && !flyerBlob) return setError("Please add the flyer.");
    if (cleanLink && !/^https?:\/\//i.test(cleanLink)) {
      return setError("The register link must start with https://");
    }

    setSaving(true);
    const supabase = createClient();

    // 1. Upload a new flyer, if one was chosen
    let finalFlyer = flyerUrl;
    let uploadedPath: string | null = null;
    if (flyerBlob) {
      uploadedPath = `flyers/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("events")
        .upload(uploadedPath, flyerBlob, { contentType: "image/jpeg" });
      if (uploadError) {
        setSaving(false);
        return setError(
          "We could not upload the flyer. Please check that 09-events.sql was run, then try again."
        );
      }
      finalFlyer = supabase.storage.from("events").getPublicUrl(uploadedPath).data.publicUrl;
    }

    // 2. Save the event
    const fields = {
      title: cleanTitle,
      event_date: date,
      event_time: time.trim() || null,
      details: details.trim() || null,
      flyer_url: finalFlyer as string,
      register_url: cleanLink || null,
      published,
    };

    let failed = false;

    if (editingId) {
      const { error: updateError } = await supabase.from("events").update(fields).eq("id", editingId);
      failed = Boolean(updateError);
    } else {
      const { data, error: insertError } = await supabase
        .from("events")
        .insert(fields)
        .select("id")
        .single();
      failed = Boolean(insertError) || !data;
    }

    if (failed) {
      if (uploadedPath) await supabase.storage.from("events").remove([uploadedPath]);
      setSaving(false);
      return setError("We could not save the event. Please try again.");
    }

    // 3. Tidy up the old flyer file if it was replaced
    const oldFlyer = events.find((x) => x.id === editingId)?.flyer_url;
    if (oldFlyer && oldFlyer !== finalFlyer) {
      const oldPath = storagePathFromUrl(oldFlyer, "events");
      if (oldPath) await supabase.storage.from("events").remove([oldPath]);
    }

    // 4. Back to the list
    resetEditor();
    setEditing(false);
    setReloadKey((k) => k + 1);
    setSaving(false);
    setNotice(published ? "Saved. Visitors can see it on the Events page." : "Saved, but hidden from visitors.");
  }

  async function togglePublished(ev: EventRow) {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("events")
      .update({ published: !ev.published })
      .eq("id", ev.id);
    if (updateError) {
      window.alert("We could not change this event. Please try again.");
      return;
    }
    setEvents((prev) => prev.map((x) => (x.id === ev.id ? { ...x, published: !ev.published } : x)));
  }

  async function deleteEvent(ev: EventRow) {
    if (!window.confirm(`Delete "${ev.title}"? This cannot be undone.`)) return;
    const supabase = createClient();
    const { data, error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", ev.id)
      .select("id");
    if (deleteError || !data || data.length === 0) {
      window.alert("We could not delete this event. Please try again.");
      return;
    }
    const path = storagePathFromUrl(ev.flyer_url, "events");
    if (path) await supabase.storage.from("events").remove([path]);
    setEvents((prev) => prev.filter((x) => x.id !== ev.id));
    setNotice("Event deleted.");
  }

  const shownFlyer = flyerPreview || flyerUrl || "";

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-paper px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-32">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow text-crimson">Admin tools</p>
          <h1 className="mt-3 text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
            Upcoming events.
          </h1>

          {status === "loading" && <p className="mt-10 text-muted">Loading...</p>}

          {status === "error" && (
            <p className="mt-10 text-muted">
              We could not load the events. Please check that 09-events.sql was run, then try again.
            </p>
          )}

          {status === "signedOut" && (
            <div className="mt-10 max-w-lg rounded-[28px] border border-line bg-cream p-6 sm:p-8">
              <p className="text-lg font-bold">Please log in first.</p>
              <Link
                href="/login"
                className="mt-5 inline-block rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream"
              >
                Log in
              </Link>
            </div>
          )}

          {status === "notAdmin" && (
            <div className="mt-10 max-w-lg rounded-[28px] border border-line bg-cream p-6 sm:p-8">
              <p className="text-lg font-bold">This page is for TFA admins.</p>
              <Link
                href="/events"
                className="mt-5 inline-block rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream"
              >
                Go to events
              </Link>
            </div>
          )}

          {status === "ready" && (
            <>
              {notice && (
                <p role="status" className="mt-6 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-cream">
                  {notice}
                </p>
              )}

              {/* The list of events */}
              {!editing && (
                <>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={startNew}
                      className="rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream transition hover:bg-crimson-deep"
                    >
                      Add an event
                    </button>
                    <Link
                      href="/events"
                      className="rounded-full border-[1.5px] border-crimson px-6 py-3 text-sm font-bold text-crimson transition hover:bg-crimson hover:text-cream"
                    >
                      See the Events page
                    </Link>
                  </div>

                  {events.length === 0 && (
                    <p className="mt-8 rounded-2xl border border-dashed border-line bg-cream px-5 py-10 text-center text-sm text-muted">
                      No events yet. Add the first one with its flyer.
                    </p>
                  )}

                  <div className="mt-8 space-y-3">
                    {events.map((ev) => (
                      <article
                        key={ev.id}
                        className="flex flex-col gap-3 rounded-[24px] border border-line bg-cream p-4 sm:flex-row sm:items-center"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ev.flyer_url}
                          alt=""
                          className="h-28 w-20 shrink-0 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold leading-tight">{ev.title}</p>
                          <p className="mt-1 text-xs text-muted">
                            <span
                              className={`mr-2 rounded-full px-2.5 py-0.5 font-bold ${
                                ev.published ? "bg-ink text-cream" : "bg-paper"
                              }`}
                            >
                              {ev.published ? "Visible" : "Hidden"}
                            </span>
                            {formatDate(ev.event_date)}
                            {ev.event_time ? `, ${ev.event_time}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(ev)}
                            className="rounded-full bg-crimson px-4 py-2 text-xs font-bold text-cream"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePublished(ev)}
                            className="rounded-full border border-ink px-4 py-2 text-xs font-bold"
                          >
                            {ev.published ? "Hide" : "Show"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteEvent(ev)}
                            className="rounded-full border border-ink px-4 py-2 text-xs font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}

              {/* The editor */}
              {editing && (
                <div className="mt-7 rounded-[28px] border border-line bg-cream p-5 sm:p-8">
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="text-sm font-bold text-crimson hover:underline"
                  >
                    &larr; Back to all events
                  </button>

                  <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted">
                    {editingId ? "Edit event" : "New event"}
                  </p>

                  <div className="mt-4 space-y-5">
                    <div>
                      <p className="mb-1.5 text-sm font-semibold">Flyer</p>
                      {shownFlyer && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={shownFlyer}
                          alt="Flyer preview"
                          className="mb-3 max-h-80 rounded-2xl object-contain"
                        />
                      )}
                      <label className="inline-block cursor-pointer rounded-full border-[1.5px] border-crimson px-5 py-2.5 text-xs font-bold text-crimson transition hover:bg-crimson hover:text-cream">
                        {shownFlyer ? "Change flyer" : "Choose the flyer"}
                        <input type="file" accept="image/*" onChange={onFlyerPick} className="sr-only" />
                      </label>
                    </div>

                    <div>
                      <label htmlFor="ev-title" className="mb-1.5 block text-sm font-semibold">
                        Event title
                      </label>
                      <input
                        id="ev-title"
                        value={title}
                        maxLength={120}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="For example: TFA Art Exhibition"
                        className={INPUT_CLASS}
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="ev-date" className="mb-1.5 block text-sm font-semibold">
                          Date
                        </label>
                        <input
                          id="ev-date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label htmlFor="ev-time" className="mb-1.5 block text-sm font-semibold">
                          Time (optional)
                        </label>
                        <input
                          id="ev-time"
                          value={time}
                          maxLength={60}
                          onChange={(e) => setTime(e.target.value)}
                          placeholder="For example: 4:00 PM"
                          className={INPUT_CLASS}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="ev-details" className="mb-1.5 block text-sm font-semibold">
                        Short note (optional)
                      </label>
                      <textarea
                        id="ev-details"
                        value={details}
                        maxLength={500}
                        rows={3}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Venue, price, or anything people should know."
                        className={INPUT_CLASS}
                      />
                      <p className="mt-1 text-xs text-muted">{details.length} / 500</p>
                    </div>

                    <div>
                      <label htmlFor="ev-link" className="mb-1.5 block text-sm font-semibold">
                        Register link (optional)
                      </label>
                      <input
                        id="ev-link"
                        value={registerUrl}
                        onChange={(e) => setRegisterUrl(e.target.value)}
                        placeholder="https://..."
                        className={INPUT_CLASS}
                      />
                    </div>

                    <label className="flex items-center gap-3 text-sm font-semibold">
                      <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        className="size-5 accent-crimson"
                      />
                      Show this event to visitors
                    </label>
                  </div>

                  {error && (
                    <p role="alert" className="mt-5 text-sm font-medium text-crimson">
                      {error}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={save}
                      className="rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream transition hover:bg-crimson-deep disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save event"}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={closeEditor}
                      className="rounded-full border-[1.5px] border-ink px-6 py-3 text-sm font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
