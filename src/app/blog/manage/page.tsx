"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { resizeImage } from "@/lib/image";
import { INPUT_CLASS, storagePathFromUrl } from "@/lib/materials";

type Post = {
  id: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  body: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
};

const COLUMNS = "id, title, excerpt, cover_url, body, published, published_at, created_at";

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Makes a web address from the title, plus 4 random letters so it is always unique.
function makeSlug(title: string) {
  const base =
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "post";
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function ManageBlogPage() {
  const [status, setStatus] = useState<"loading" | "signedOut" | "notAdmin" | "ready" | "error">(
    "loading"
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [notice, setNotice] = useState("");

  // Editor
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [wasPublished, setWasPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverBlob, setCoverBlob] = useState<Blob | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
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
        .from("posts")
        .select(COLUMNS)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (listError) {
        setStatus("error");
        return;
      }
      setPosts((data ?? []) as Post[]);
      setStatus("ready");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function resetEditor() {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setEditingId(null);
    setWasPublished(false);
    setPublishedAt(null);
    setTitle("");
    setExcerpt("");
    setBody("");
    setCoverUrl(null);
    setCoverBlob(null);
    setCoverPreview("");
    setError("");
  }

  function startNew() {
    resetEditor();
    setNotice("");
    setEditing(true);
  }

  function startEdit(post: Post) {
    resetEditor();
    setNotice("");
    setEditingId(post.id);
    setWasPublished(post.published);
    setPublishedAt(post.published_at);
    setTitle(post.title);
    setExcerpt(post.excerpt ?? "");
    setBody(post.body);
    setCoverUrl(post.cover_url);
    setEditing(true);
  }

  function closeEditor() {
    resetEditor();
    setEditing(false);
    setReloadKey((k) => k + 1);
  }

  async function onCoverPick(e: React.ChangeEvent<HTMLInputElement>) {
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
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverBlob(blob);
      setCoverPreview(URL.createObjectURL(blob));
    } catch {
      setError("We could not read that image. Please try a JPG or PNG.");
    }
  }

  function removeCover() {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverBlob(null);
    setCoverPreview("");
    setCoverUrl(null);
  }

  // publish = true: make it live. publish = false: save as a draft.
  async function save(publish: boolean) {
    setError("");
    setNotice("");

    const cleanTitle = title.trim();
    if (cleanTitle.length < 3) return setError("Please write a title (at least 3 letters).");
    if (publish && body.trim().length < 20) {
      return setError("Please write the post before publishing.");
    }

    setSaving(true);
    const supabase = createClient();

    // 1. Upload a new cover photo, if one was chosen
    let finalCover = coverUrl;
    let uploadedPath: string | null = null;
    if (coverBlob) {
      uploadedPath = `covers/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("blog")
        .upload(uploadedPath, coverBlob, { contentType: "image/jpeg" });
      if (uploadError) {
        setSaving(false);
        return setError(
          "We could not upload the cover photo. Please check that 07-blog-writer.sql was run, then try again."
        );
      }
      finalCover = supabase.storage.from("blog").getPublicUrl(uploadedPath).data.publicUrl;
    }

    // 2. Save the post
    const when = publish ? publishedAt ?? new Date().toISOString() : publishedAt;
    const fields = {
      title: cleanTitle,
      excerpt: excerpt.trim() || null,
      cover_url: finalCover,
      body: body.trim(),
      published: publish,
      published_at: when,
    };

    let savedId = editingId;
    let failed = false;

    if (editingId) {
      const { error: updateError } = await supabase.from("posts").update(fields).eq("id", editingId);
      failed = Boolean(updateError);
    } else {
      const { data, error: insertError } = await supabase
        .from("posts")
        .insert({ ...fields, slug: makeSlug(cleanTitle) })
        .select("id")
        .single();
      failed = Boolean(insertError) || !data;
      if (data) savedId = data.id;
    }

    if (failed) {
      if (uploadedPath) await supabase.storage.from("blog").remove([uploadedPath]);
      setSaving(false);
      return setError("We could not save the post. Please try again.");
    }

    // 3. Tidy up the old cover photo file if it was replaced or removed
    const oldCover = posts.find((p) => p.id === editingId)?.cover_url;
    if (oldCover && oldCover !== finalCover) {
      const oldPath = storagePathFromUrl(oldCover, "blog");
      if (oldPath) await supabase.storage.from("blog").remove([oldPath]);
    }

    // 4. Show the saved state
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverBlob(null);
    setCoverPreview("");
    setCoverUrl(finalCover);
    setEditingId(savedId);
    setWasPublished(publish);
    setPublishedAt(when);
    setPosts((prev) => {
      const saved: Post = {
        id: savedId as string,
        title: cleanTitle,
        excerpt: fields.excerpt,
        cover_url: finalCover,
        body: fields.body,
        published: publish,
        published_at: when,
        created_at: prev.find((p) => p.id === savedId)?.created_at ?? new Date().toISOString(),
      };
      return prev.some((p) => p.id === savedId)
        ? prev.map((p) => (p.id === savedId ? saved : p))
        : [saved, ...prev];
    });
    setSaving(false);
    setNotice(publish ? "Published. Members can read it now." : "Saved as a draft. Members cannot see it yet.");
  }

  async function deletePost(post: Post) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const supabase = createClient();
    const { data, error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id)
      .select("id");
    if (deleteError || !data || data.length === 0) {
      window.alert("We could not delete this post. Please try again.");
      return;
    }
    if (post.cover_url) {
      const path = storagePathFromUrl(post.cover_url, "blog");
      if (path) await supabase.storage.from("blog").remove([path]);
    }
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    setNotice("Post deleted.");
  }

  const shownCover = coverPreview || coverUrl || "";
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-paper px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-32">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow text-crimson">Admin tools</p>
          <h1 className="mt-3 text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
            Blog writer.
          </h1>

          {status === "loading" && <p className="mt-10 text-muted">Loading...</p>}

          {status === "error" && (
            <p className="mt-10 text-muted">We could not load the posts. Please try again shortly.</p>
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
                href="/blog"
                className="mt-5 inline-block rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream"
              >
                Go to the blog
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

              {/* The list of posts */}
              {!editing && (
                <>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={startNew}
                      className="rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream transition hover:bg-crimson-deep"
                    >
                      Write a new post
                    </button>
                    <Link
                      href="/blog"
                      className="rounded-full border-[1.5px] border-crimson px-6 py-3 text-sm font-bold text-crimson transition hover:bg-crimson hover:text-cream"
                    >
                      See the blog
                    </Link>
                  </div>

                  {posts.length === 0 && (
                    <p className="mt-8 rounded-2xl border border-dashed border-line bg-cream px-5 py-10 text-center text-sm text-muted">
                      No posts yet. Write the first one.
                    </p>
                  )}

                  <div className="mt-8 space-y-3">
                    {posts.map((post) => (
                      <article
                        key={post.id}
                        className="flex flex-col gap-3 rounded-[24px] border border-line bg-cream p-4 sm:flex-row sm:items-center"
                      >
                        {post.cover_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.cover_url}
                            alt=""
                            className="h-20 w-full shrink-0 rounded-2xl object-cover sm:w-28"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold leading-tight">{post.title}</p>
                          <p className="mt-1 text-xs text-muted">
                            <span
                              className={`mr-2 rounded-full px-2.5 py-0.5 font-bold ${
                                post.published ? "bg-ink text-cream" : "bg-paper"
                              }`}
                            >
                              {post.published ? "Published" : "Draft"}
                            </span>
                            {post.published
                              ? formatDate(post.published_at)
                              : `Started ${formatDate(post.created_at)}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(post)}
                            className="rounded-full bg-crimson px-4 py-2 text-xs font-bold text-cream"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePost(post)}
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
                    &larr; Back to all posts
                  </button>

                  <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted">
                    {editingId ? (wasPublished ? "Published post" : "Draft") : "New post"}
                  </p>

                  <div className="mt-4 space-y-5">
                    <div>
                      <label htmlFor="post-title" className="mb-1.5 block text-sm font-semibold">
                        Title
                      </label>
                      <input
                        id="post-title"
                        value={title}
                        maxLength={120}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What is this post about?"
                        className={INPUT_CLASS}
                      />
                    </div>

                    <div>
                      <label htmlFor="post-excerpt" className="mb-1.5 block text-sm font-semibold">
                        Short summary
                      </label>
                      <textarea
                        id="post-excerpt"
                        value={excerpt}
                        maxLength={200}
                        rows={2}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="One or two lines. This shows on the blog list."
                        className={INPUT_CLASS}
                      />
                      <p className="mt-1 text-xs text-muted">{excerpt.length} / 200</p>
                    </div>

                    <div>
                      <p className="mb-1.5 text-sm font-semibold">Cover photo (optional)</p>
                      {shownCover && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={shownCover}
                          alt="Cover preview"
                          className="mb-3 max-h-56 w-full rounded-2xl object-cover"
                        />
                      )}
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="cursor-pointer rounded-full border-[1.5px] border-crimson px-5 py-2.5 text-xs font-bold text-crimson transition hover:bg-crimson hover:text-cream">
                          {shownCover ? "Change photo" : "Choose a photo"}
                          <input type="file" accept="image/*" onChange={onCoverPick} className="sr-only" />
                        </label>
                        {shownCover && (
                          <button
                            type="button"
                            onClick={removeCover}
                            className="text-xs font-bold text-muted underline hover:text-crimson"
                          >
                            Remove photo
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="post-body" className="mb-1.5 block text-sm font-semibold">
                        The post
                      </label>
                      <textarea
                        id="post-body"
                        value={body}
                        rows={16}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write your story here. Leave one empty line to start a new paragraph."
                        className={INPUT_CLASS}
                      />
                      <p className="mt-1 text-xs text-muted">{words} words</p>
                    </div>
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
                      onClick={() => save(true)}
                      className="rounded-full bg-crimson px-7 py-3 text-sm font-bold text-cream transition hover:bg-crimson-deep disabled:opacity-60"
                    >
                      {saving ? "Saving..." : wasPublished ? "Update post" : "Publish"}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => save(false)}
                      className="rounded-full border-[1.5px] border-ink px-7 py-3 text-sm font-bold transition hover:bg-ink hover:text-cream disabled:opacity-60"
                    >
                      {wasPublished ? "Unpublish (back to draft)" : "Save draft"}
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