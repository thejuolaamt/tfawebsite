"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  role: string;
  date: string;
  readTime: string;
  image: string;
  content: string;
};

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [selected, setSelected] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => {
        if (data.blogs) setBlogs(data.blogs);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main className="bg-paper px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-crimson">Community Blog</p>
          <h1 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-6xl">
            Stories &amp; reflections from our community.
          </h1>

          {selected ? (
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
                {selected.author} ({selected.role}) • {selected.date} • {selected.readTime}
              </p>
              <img
                src={selected.image}
                alt={selected.title}
                className="mt-6 max-h-[420px] w-full rounded-[24px] object-cover"
              />
              <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-ink/90">
                {selected.content}
              </p>
            </article>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {blogs.map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-[28px] border border-line bg-cream shadow-sm"
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-56 w-full object-cover"
                  />
                  <div className="p-6">
                    <p className="eyebrow text-crimson">
                      {post.date} • {post.readTime}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold leading-tight">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">
                      {post.excerpt}
                    </p>
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
