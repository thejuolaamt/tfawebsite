"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import ShareMaterial from "@/components/ShareMaterial";
import { createClient } from "@/lib/supabase/client";
import { rememberNext } from "@/lib/next";
import {
  MATERIAL_COLUMNS,
  categoryLabel,
  conditionLabel,
  type Material,
} from "@/lib/materials";

// The safe preview the server gives to everyone, including visitors.
export type Preview = {
  title: string;
  category: string;
  item_condition: string;
  delivery_available: boolean;
  image_url: string | null;
  status: string;
} | null;

type View = "loading" | "visitor" | "member" | "error";

function Chips({
  category,
  condition,
  delivery,
}: {
  category: string;
  condition: string;
  delivery: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold">
        {categoryLabel(category)}
      </span>
      <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold">
        {conditionLabel(condition)}
      </span>
      {delivery && (
        <span className="rounded-full bg-crimson/10 px-3 py-1 text-xs font-bold text-crimson">
          Can deliver
        </span>
      )}
    </div>
  );
}

export default function ItemView({ id, preview }: { id: string; preview: Preview }) {
  const [view, setView] = useState<View>("loading");
  const [userId, setUserId] = useState("");
  const [item, setItem] = useState<Material | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!auth.user) {
        setView("visitor");
        return;
      }

      const { data, error } = await supabase
        .from("materials")
        .select(MATERIAL_COLUMNS)
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;

      if (error) {
        setView("error");
        return;
      }
      setUserId(auth.user.id);
      setItem((data ?? null) as unknown as Material | null);
      setView("member");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  async function collect() {
    setBusy(true);
    setNotice(null);
    const { error } = await createClient().rpc("collect_material", { p_id: id });
    setBusy(false);
    setConfirm(false);
    if (error) {
      setNotice({ type: "error", text: error.message });
    } else {
      setNotice({
        type: "ok",
        text: "It is yours! Open My materials to see the donor's contact and arrange pickup.",
      });
    }
    setReloadKey((k) => k + 1);
  }

  const remember = () => rememberNext(`/materials/${id}`);

  const joinButtons = (
    <div className="mt-5 flex flex-wrap gap-3">
      <Link
        href="/join"
        onClick={remember}
        className="rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream transition hover:bg-crimson-deep"
      >
        Join free to collect this
      </Link>
      <Link
        href="/login"
        onClick={remember}
        className="rounded-full border border-crimson px-6 py-3 text-sm font-bold text-crimson transition hover:bg-crimson hover:text-cream"
      >
        Log in
      </Link>
    </div>
  );

  const unavailable = (
    <div className="mt-10 max-w-lg rounded-[28px] border border-line bg-cream p-6 sm:p-8">
      <p className="text-lg font-bold">This item is not available any more.</p>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        Someone may have reserved it, or the donor may have removed it. Members share new
        materials all the time.
      </p>
      {view === "member" ? (
        <Link
          href="/materials"
          className="mt-5 inline-block rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream transition hover:bg-crimson-deep"
        >
          See other materials
        </Link>
      ) : (
        joinButtons
      )}
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-paper px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-32">
        <div className="mx-auto max-w-3xl">
          <Link href="/materials" className="text-sm font-bold text-crimson hover:underline">
            &larr; All materials
          </Link>

          {view === "loading" && <p className="mt-10 text-muted">Loading...</p>}

          {view === "error" && (
            <p className="mt-10 text-muted">
              We could not load this item right now. Please try again shortly.
            </p>
          )}

          {/* A visitor (not logged in): safe preview only */}
          {view === "visitor" &&
            (preview && preview.status === "available" ? (
              <article className="mt-6 overflow-hidden rounded-[28px] border border-line bg-cream shadow-sm">
                {preview.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview.image_url}
                    alt={preview.title}
                    className="max-h-[420px] w-full object-cover"
                  />
                )}
                <div className="p-6 sm:p-8">
                  <p className="eyebrow text-crimson">Free for TFA members</p>
                  <h1 className="mt-2 text-[1.8rem] font-extrabold leading-tight sm:text-4xl">
                    {preview.title}
                  </h1>
                  <div className="mt-4">
                    <Chips
                      category={preview.category}
                      condition={preview.item_condition}
                      delivery={preview.delivery_available}
                    />
                  </div>
                  <p className="mt-5 text-[15px] leading-relaxed text-muted">
                    This is a free donation from a member of The Fine Artist Community. Join
                    the community, it is free, to collect it and see the pickup details.
                  </p>
                  {joinButtons}
                </div>
              </article>
            ) : (
              unavailable
            ))}

          {/* A logged-in member: the full item */}
          {view === "member" &&
            (!item ? (
              unavailable
            ) : (
              <article className="mt-6 overflow-hidden rounded-[28px] border border-line bg-cream shadow-sm">
                {item.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="max-h-[420px] w-full object-cover"
                  />
                )}
                <div className="p-6 sm:p-8">
                  <Chips
                    category={item.category}
                    condition={item.item_condition}
                    delivery={item.delivery_available}
                  />
                  <h1 className="mt-4 text-[1.8rem] font-extrabold leading-tight sm:text-4xl">
                    {item.title}
                  </h1>
                  {item.description && (
                    <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-muted">
                      {item.description}
                    </p>
                  )}
                  <p className="mt-4 text-sm font-medium">Pickup: {item.location}</p>

                  <div className="mt-4 flex items-center gap-2.5 text-sm text-muted">
                    <Avatar
                      src={item.donor?.avatar_url}
                      name={item.donor?.full_name}
                      className="size-8 border border-line"
                    />
                    <span>Given by {item.donor?.full_name || "a TFA member"}</span>
                  </div>

                  {notice && (
                    <p
                      role="status"
                      className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium ${
                        notice.type === "ok"
                          ? "bg-ink text-cream"
                          : "bg-crimson/10 text-crimson-deep"
                      }`}
                    >
                      {notice.text}{" "}
                      {notice.type === "ok" && (
                        <Link href="/materials/mine" className="font-bold underline">
                          Open My materials
                        </Link>
                      )}
                    </p>
                  )}

                  <div className="mt-6">
                    {item.donor_id === userId ? (
                      <>
                        <p className="rounded-full bg-paper px-4 py-2.5 text-center text-sm font-bold text-muted">
                          Your donation
                        </p>
                        {item.status === "available" && (
                          <ShareMaterial id={item.id} title={item.title} />
                        )}
                      </>
                    ) : item.status === "collected" && item.collected_by === userId ? (
                      <p className="rounded-full bg-paper px-4 py-2.5 text-center text-sm font-bold text-muted">
                        You received this item
                      </p>
                    ) : item.status === "reserved" && item.collected_by === userId ? (
                      <Link
                        href="/materials/mine"
                        className="block rounded-full bg-ink px-4 py-2.5 text-center text-sm font-bold text-cream"
                      >
                        Reserved by you: see pickup details
                      </Link>
                    ) : item.status !== "available" ? (
                      <p className="rounded-full bg-paper px-4 py-2.5 text-center text-sm font-bold text-muted">
                        Reserved
                      </p>
                    ) : confirm ? (
                      <div className="rounded-2xl bg-paper p-4">
                        <p className="text-[13px] leading-relaxed text-muted">
                          Collecting reserves this item for you and shares your name and
                          contact details with the donor, so you can arrange pickup. You can
                          hold one item at a time.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={collect}
                            className="flex-1 rounded-full bg-crimson px-4 py-2.5 text-sm font-bold text-cream transition hover:bg-crimson-deep disabled:opacity-60"
                          >
                            {busy ? "Reserving..." : "Yes, collect it"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirm(false)}
                            className="rounded-full px-4 py-2.5 text-sm font-bold text-muted hover:text-ink"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setNotice(null);
                          setConfirm(true);
                        }}
                        className="w-full rounded-full bg-crimson px-4 py-3 text-sm font-bold text-cream transition hover:bg-crimson-deep"
                      >
                        Collect
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}

          <p className="mt-10 max-w-2xl text-xs leading-relaxed text-muted">
            TFA only connects donors and collectors. We do not inspect items, handle delivery
            or take responsibility for what is exchanged. Meet in a public, safe place when
            you can, and check the item before you take it.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}