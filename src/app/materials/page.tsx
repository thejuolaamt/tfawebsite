"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import { createClient } from "@/lib/supabase/client";
import {
  CATEGORIES,
  MATERIAL_COLUMNS,
  categoryLabel,
  conditionLabel,
  type Material,
} from "@/lib/materials";

type Giver = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  items_given: number;
};

type Notice = { type: "ok" | "error"; text: string };

export default function MaterialsPage() {
  const [status, setStatus] = useState<"loading" | "signedOut" | "ready" | "error">("loading");
  const [userId, setUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState<Material[]>([]);
  const [givers, setGivers] = useState<Giver[]>([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setStatus("signedOut");
        return;
      }
      setUserId(auth.user.id);

      const [list, top, admin] = await Promise.all([
        supabase
          .from("materials")
          .select(MATERIAL_COLUMNS)
          .in("status", ["available", "reserved"])
          .order("created_at", { ascending: false }),
        supabase.from("top_givers").select("id, full_name, avatar_url, items_given"),
        supabase.rpc("is_admin"),
      ]);

      if (list.error) {
        setStatus("error");
        return;
      }
      setItems((list.data ?? []) as unknown as Material[]);
      setGivers((top.data ?? []) as Giver[]);
      setIsAdmin(admin.data === true);
      if (cancelled) return;
      setStatus("ready");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((m) => {
      if (category !== "all" && m.category !== category) return false;
      if (deliveryOnly && !m.delivery_available) return false;
      if (q && !`${m.title} ${m.description ?? ""} ${m.location}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [items, category, search, deliveryOnly]);

  async function collect(id: string) {
    setBusyId(id);
    setNotice(null);
    const { error } = await createClient().rpc("collect_material", { p_id: id });
    setBusyId(null);
    setConfirmId(null);
    if (error) {
      setNotice({ type: "error", text: error.message });
    } else {
      setNotice({
        type: "ok",
        text: "It is yours! Open My materials to see the donor's contact and arrange pickup.",
      });
    }
    reload();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-paper px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-crimson">Materials sharing</p>
          <h1 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-6xl">
            Artists giving to artists.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted md:text-base">
            Got art materials you no longer need? Give them to a fellow artist. Need materials?
            Collect what others have shared. It is always free.
          </p>

          {status === "loading" && <p className="mt-10 text-muted">Loading...</p>}

          {status === "error" && (
            <p className="mt-10 text-muted">
              We could not load the materials right now. Please try again shortly.
            </p>
          )}

          {status === "signedOut" && (
            <div className="mt-10 max-w-lg rounded-[28px] border border-line bg-cream p-6 sm:p-8">
              <p className="text-lg font-bold">Materials sharing is for members.</p>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Log in or join the community for free to give and collect art materials.
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

          {status === "ready" && (
            <>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/materials/donate"
                  className="rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream transition hover:bg-crimson-deep"
                >
                  Donate materials
                </Link>
                <Link
                  href="/materials/mine"
                  className="rounded-full border-[1.5px] border-crimson px-6 py-3 text-sm font-bold text-crimson transition hover:bg-crimson hover:text-cream"
                >
                  My materials
                </Link>
                {isAdmin && (
                  <Link
                    href="/materials/review"
                    className="rounded-full border-[1.5px] border-ink px-6 py-3 text-sm font-bold text-ink transition hover:bg-ink hover:text-cream"
                  >
                    Review new donations
                  </Link>
                )}
              </div>

              {notice && (
                <p
                  role="status"
                  className={`mt-6 rounded-xl px-4 py-3 text-sm font-medium ${
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

              {givers.length > 0 && (
                <div className="mt-10 rounded-[28px] bg-crimson p-6 text-cream sm:p-8">
                  <p className="eyebrow text-cream/80">Giving wall</p>
                  <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">
                    Thank you to our most generous members.
                  </h2>
                  <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-4">
                    {givers.map((g) => (
                      <li key={g.id} className="flex items-center gap-3">
                        <Avatar
                          src={g.avatar_url}
                          name={g.full_name}
                          className="size-11 border-2 border-cream"
                        />
                        <div className="leading-tight">
                          <p className="text-sm font-bold">{g.full_name || "A TFA member"}</p>
                          <p className="text-xs text-cream/80">
                            {g.items_given} {g.items_given === 1 ? "item" : "items"} given
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Filters */}
              <div className="mt-10 flex flex-col gap-4">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search materials, e.g. acrylic, canvas, Ondo"
                  className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-[15px] focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/20 md:max-w-md"
                />
                <div className="flex flex-wrap items-center gap-2">
                  {[{ value: "all", label: "All" }, ...CATEGORIES].map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        category === c.value
                          ? "border-crimson bg-crimson text-cream"
                          : "border-line bg-cream text-ink hover:border-crimson"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={deliveryOnly}
                    onChange={(e) => setDeliveryOnly(e.target.checked)}
                    className="size-4 accent-crimson"
                  />
                  Only show items that can be delivered
                </label>
              </div>

              {visible.length === 0 && (
                <div className="mt-10 rounded-[28px] border border-line bg-cream p-8 text-center">
                  <p className="font-bold">
                    {items.length === 0 ? "No materials listed yet." : "Nothing matches your search."}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {items.length === 0
                      ? "Be the first to give something to a fellow artist."
                      : "Try a different category or search."}
                  </p>
                </div>
              )}

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((m) => {
                  const mine = m.donor_id === userId;
                  const reservedByMe = m.status === "reserved" && m.collected_by === userId;
                  const reserved = m.status === "reserved";

                  return (
                    <article
                      key={m.id}
                      className="flex flex-col overflow-hidden rounded-[28px] border border-line bg-cream shadow-sm"
                    >
                      <div className="aspect-[4/3] w-full bg-line">
                        {m.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.image_url}
                            alt={m.title}
                            loading="lazy"
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-sm text-muted">
                            No photo
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold">
                            {categoryLabel(m.category)}
                          </span>
                          <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold">
                            {conditionLabel(m.item_condition)}
                          </span>
                          {m.delivery_available && (
                            <span className="rounded-full bg-crimson/10 px-3 py-1 text-xs font-bold text-crimson">
                              Can deliver
                            </span>
                          )}
                        </div>

                        <h2 className="mt-3 text-xl font-bold leading-tight">{m.title}</h2>
                        {m.description && (
                          <p className="mt-2 text-[15px] leading-relaxed text-muted">
                            {m.description}
                          </p>
                        )}
                        <p className="mt-3 text-sm font-medium">Pickup: {m.location}</p>

                        <div className="mt-4 flex items-center gap-2.5 text-sm text-muted">
                          <Avatar
                            src={m.donor?.avatar_url}
                            name={m.donor?.full_name}
                            className="size-8 border border-line"
                          />
                          <span>Given by {m.donor?.full_name || "a TFA member"}</span>
                        </div>

                        <div className="mt-5 flex-1" />

                        {mine ? (
                          <p className="rounded-full bg-paper px-4 py-2.5 text-center text-sm font-bold text-muted">
                            Your donation
                          </p>
                        ) : reservedByMe ? (
                          <Link
                            href="/materials/mine"
                            className="rounded-full bg-ink px-4 py-2.5 text-center text-sm font-bold text-cream"
                          >
                            Reserved by you: see pickup details
                          </Link>
                        ) : reserved ? (
                          <p className="rounded-full bg-paper px-4 py-2.5 text-center text-sm font-bold text-muted">
                            Reserved
                          </p>
                        ) : confirmId === m.id ? (
                          <div className="rounded-2xl bg-paper p-4">
                            <p className="text-[13px] leading-relaxed text-muted">
                              Collecting reserves this item for you and shares your name and
                              contact details with the donor, so you can arrange pickup. You can
                              hold one item at a time.
                            </p>
                            <div className="mt-3 flex gap-2">
                              <button
                                type="button"
                                disabled={busyId === m.id}
                                onClick={() => collect(m.id)}
                                className="flex-1 rounded-full bg-crimson px-4 py-2.5 text-sm font-bold text-cream transition hover:bg-crimson-deep disabled:opacity-60"
                              >
                                {busyId === m.id ? "Reserving..." : "Yes, collect it"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmId(null)}
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
                              setConfirmId(m.id);
                            }}
                            className="rounded-full bg-crimson px-4 py-2.5 text-sm font-bold text-cream transition hover:bg-crimson-deep"
                          >
                            Collect
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              <p className="mt-12 max-w-2xl text-xs leading-relaxed text-muted">
                TFA only connects donors and collectors. We do not inspect items, handle delivery
                or take responsibility for what is exchanged. Meet in a public, safe place when
                you can, and check the item before you take it.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
