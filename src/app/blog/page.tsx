"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";

type BlogPost = {
  id: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  body: string;
  published_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function readTime(body: string) {
  const words = body.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selected, setSelected] = useState<BlogPost | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState<"loading" | "signedOut" | "ready" | "error">("loading");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setStatus("signedOut");
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("id, title, excerpt, cover_url, body, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (error) {
        setStatus("error");
        return;
      }
      setPosts((data ?? []) as BlogPost[]);
      const admin = await supabase.rpc("is_admin");
      setIsAdmin(admin.data === true);
      setStatus("ready");
    }
    load();
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-paper px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-crimson">Community Blog</p>
          <h1 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-6xl">
            Stories &amp; reflections from our community.
          </h1>

          {isAdmin && (
            <Link
              href="/blog/manage"
              className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-cream transition hover:bg-crimson"
            >
              Write or manage posts
            </Link>
          )}

          {status === "loading" && (
            <p className="mt-10 text-muted">Loading...</p>
          )}

          {status === "error" && (
            <p className="mt-10 text-muted">
              We could not load the blog right now. Please try again shortly.
            </p>
          )}

          {status === "signedOut" && (
            <div className="mt-10 max-w-lg rounded-[28px] border border-line bg-cream p-6 sm:p-8">
              <p className="text-lg font-bold">The blog is for members.</p>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Log in or join the community for free to read our stories.
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

          {status === "ready" && posts.length === 0 && (
            <p className="mt-10 text-muted">No posts yet. Check back soon.</p>
          )}

          {status === "ready" && selected && (
            <article className="mt-10 rounded-[28px] border border-line bg-cream p-6 sm:p-10">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-sm font-bold text-crimson hover:underline"
              >
                ← Back to Blogposts
              </button>
              <h2 className="mt-4 text-2xl font-extrabold sm:text-4xl">
                {selected.title}
              </h2>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted">
                {formatDate(selected.published_at)} • {readTime(selected.body)}
              </p>
              {selected.cover_url && (
                <img
                  src={selected.cover_url}
                  alt={selected.title}
                  className="mt-6 max-h-[420px] w-full rounded-[24px] object-cover"
                />
              )}
              <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-ink/90">
                {selected.body}
              </p>
            </article>
          )}

          {status === "ready" && !selected && posts.length > 0 && (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-[28px] border border-line bg-cream shadow-sm"
                >
                  {post.cover_url && (
                    <img
                      src={post.cover_url}
                      alt={post.title}
                      className="h-56 w-full object-cover"
                    />
                  )}
                  <div className="p-6">
                    <p className="eyebrow text-crimson">
                      {formatDate(post.published_at)} • {readTime(post.body)}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold leading-tight">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 text-[15px] leading-relaxed text-muted">
                        {post.excerpt}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelected(post)}
                      className="mt-5 rounded-full bg-crimson px-5 py-2.5 text-xs font-bold text-cream transition hover:bg-crimson-deep"
                    >
                      Read Blogpost
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
