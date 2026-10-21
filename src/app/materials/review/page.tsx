"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import { createClient } from "@/lib/supabase/client";
import {
  MATERIAL_COLUMNS,
  categoryLabel,
  conditionLabel,
  type Material,
} from "@/lib/materials";

export default function ReviewPage() {
  const [status, setStatus] = useState<"loading" | "denied" | "ready" | "error">("loading");
  const [items, setItems] = useState<Material[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data: admin } = await supabase.rpc("is_admin");
      if (admin !== true) {
        setStatus("denied");
        return;
      }
      const { data, error: listError } = await supabase
        .from("materials")
        .select(MATERIAL_COLUMNS)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (listError) {
        setStatus("error");
        return;
      }
      setItems((data ?? []) as unknown as Material[]);
      if (cancelled) return;
      setStatus("ready");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function review(id: string, approve: boolean) {
    setBusyId(id);
    setError("");
    const { error: rpcError } = await createClient().rpc("review_material", {
      p_id: id,
      p_approve: approve,
    });
    setBusyId(null);
    if (rpcError) setError(rpcError.message);
    reload();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-paper px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-32">
        <div className="mx-auto max-w-4xl">
          <Link href="/materials" className="text-sm font-bold text-crimson hover:underline">
            &larr; Back to materials
          </Link>
          <p className="eyebrow mt-6 text-crimson">TFA admins only</p>
          <h1 className="mt-3 text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
            New donations to review.
          </h1>

          {status === "loading" && <p className="mt-10 text-muted">Loading...</p>}
          {status === "error" && <p className="mt-10 text-muted">Could not load donations.</p>}
          {status === "denied" && (
            <p className="mt-10 text-muted">This page is only for TFA admins.</p>
          )}

          {error && (
            <p className="mt-6 rounded-xl bg-crimson/10 px-4 py-3 text-sm font-medium text-crimson-deep">
              {error}
            </p>
          )}

          {status === "ready" && items.length === 0 && (
            <p className="mt-10 text-muted">Nothing waiting. You are all caught up.</p>
          )}

          {status === "ready" && (
            <div className="mt-8 space-y-5">
              {items.map((m) => (
                <article
                  key={m.id}
                  className="flex flex-col gap-5 overflow-hidden rounded-[28px] border border-line bg-cream p-5 sm:flex-row"
                >
                  {m.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.image_url}
                      alt={m.title}
                      className="aspect-[4/3] w-full rounded-2xl object-cover sm:w-56"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">
                      {categoryLabel(m.category)} &middot; {conditionLabel(m.item_condition)}
                      {m.delivery_available ? " - Can deliver" : ""}
                    </p>
                    <h2 className="mt-1 text-xl font-bold">{m.title}</h2>
                    {m.description && (
                      <p className="mt-2 text-[15px] leading-relaxed text-muted">
                        {m.description}
                      </p>
                    )}
                    <p className="mt-2 text-sm font-medium">Pickup: {m.location}</p>
                    <div className="mt-3 flex items-center gap-2.5 text-sm text-muted">
                      <Avatar
                        src={m.donor?.avatar_url}
                        name={m.donor?.full_name}
                        className="size-8 border border-line"
                      />
                      <span>{m.donor?.full_name || "A TFA member"}</span>
                    </div>
                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        disabled={busyId === m.id}
                        onClick={() => review(m.id, true)}
                        className="rounded-full bg-crimson px-6 py-2.5 text-sm font-bold text-cream transition hover:bg-crimson-deep disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busyId === m.id}
                        onClick={() => review(m.id, false)}
                        className="rounded-full border-[1.5px] border-ink px-6 py-2.5 text-sm font-bold text-ink transition hover:bg-ink hover:text-cream disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
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
