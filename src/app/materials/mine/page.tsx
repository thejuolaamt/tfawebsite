"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShareMaterial from "@/components/ShareMaterial";
import { createClient } from "@/lib/supabase/client";
import {
  MATERIAL_COLUMNS,
  categoryLabel,
  storagePathFromUrl,
  whatsappLink,
  type Contact,
  type Material,
} from "@/lib/materials";

const STATUS_LABELS: Record<Material["status"], string> = {
  pending: "Waiting for approval",
  available: "Live on the materials page",
  reserved: "Reserved: arrange pickup",
  collected: "Given",
  rejected: "Not approved",
};

function ContactBox({ contact, heading }: { contact: Contact | undefined; heading: string }) {
  if (!contact) return null;
  const wa = contact.phone ? whatsappLink(contact.phone) : null;

  return (
    <div className="mt-4 rounded-2xl bg-paper p-4 text-sm">
      <p className="font-bold">{heading}</p>
      <p className="mt-1">{contact.full_name || "TFA member"}</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="font-bold text-crimson hover:underline">
            Call {contact.phone}
          </a>
        )}
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-crimson hover:underline"
          >
            WhatsApp
          </a>
        )}
        {contact.instagram && (
          <a
            href={`https://instagram.com/${contact.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-crimson hover:underline"
          >
            @{contact.instagram}
          </a>
        )}
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="font-bold text-crimson hover:underline">
            {contact.email}
          </a>
        )}
      </div>
    </div>
  );
}

export default function MyMaterialsPage() {
  const [state, setState] = useState<"loading" | "signedOut" | "ready" | "error">("loading");
  const [userId, setUserId] = useState("");
  const [items, setItems] = useState<Material[]>([]);
  const [contacts, setContacts] = useState<Record<string, Contact>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setState("signedOut");
        return;
      }
      const uid = auth.user.id;
      setUserId(uid);

      const { data, error: listError } = await supabase
        .from("materials")
        .select(MATERIAL_COLUMNS)
        .or(`donor_id.eq.${uid},collected_by.eq.${uid}`)
        .order("created_at", { ascending: false });

      if (listError) {
        setState("error");
        return;
      }

      const list = (data ?? []) as unknown as Material[];

      // Contact details only exist for items that are reserved
      const reserved = list.filter((m) => m.status === "reserved" && m.collected_by);
      const found = await Promise.all(
        reserved.map(async (m) => {
          const { data: rows } = await supabase.rpc("material_contact", { p_id: m.id });
          return [m.id, (rows as Contact[] | null)?.[0]] as const;
        })
      );
      const map: Record<string, Contact> = {};
      for (const [id, contact] of found) if (contact) map[id] = contact;

      setItems(list);
      setContacts(map);
      if (cancelled) return;
      setState("ready");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function run(id: string, fn: "complete_handover" | "release_material") {
    setBusyId(id);
    setError("");
    const { error: rpcError } = await createClient().rpc(fn, { p_id: id });
    setBusyId(null);
    if (rpcError) setError(rpcError.message);
    reload();
  }

  async function remove(m: Material) {
    if (!window.confirm(`Remove "${m.title}"? This cannot be undone.`)) return;
    setBusyId(m.id);
    setError("");
    const supabase = createClient();
    const { error: delError } = await supabase.from("materials").delete().eq("id", m.id);
    if (delError) {
      setError("We could not remove that item.");
    } else if (m.image_url) {
      const path = storagePathFromUrl(m.image_url, "materials");
      if (path) await supabase.storage.from("materials").remove([path]);
    }
    setBusyId(null);
    reload();
  }

  const collecting = items.filter((m) => m.collected_by === userId && m.status === "reserved");
  const received = items.filter((m) => m.collected_by === userId && m.status === "collected");
  const donating = items.filter((m) => m.donor_id === userId);
  const givenCount = donating.filter((m) => m.status === "collected").length;

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-paper px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-32">
        <div className="mx-auto max-w-4xl">
          <Link href="/materials" className="text-sm font-bold text-crimson hover:underline">
            &larr; Back to materials
          </Link>
          <p className="eyebrow mt-6 text-crimson">My materials</p>
          <h1 className="mt-3 text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
            What you give and collect.
          </h1>

          {state === "loading" && <p className="mt-10 text-muted">Loading...</p>}
          {state === "error" && <p className="mt-10 text-muted">Could not load your materials.</p>}
          {state === "signedOut" && (
            <p className="mt-10 text-muted">
              Please{" "}
              <Link href="/login" className="font-bold text-crimson underline">
                log in
              </Link>{" "}
              to see your materials.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-xl bg-crimson/10 px-4 py-3 text-sm font-medium text-crimson-deep"
            >
              {error}
            </p>
          )}

          {state === "ready" && (
            <>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-[24px] bg-crimson p-5 text-cream">
                  <p className="font-display text-5xl font-extrabold leading-none">{givenCount}</p>
                  <p className="mt-2 text-sm">{givenCount === 1 ? "item given" : "items given"}</p>
                </div>
                <div className="rounded-[24px] border border-line bg-cream p-5">
                  <p className="font-display text-5xl font-extrabold leading-none text-crimson">
                    {received.length}
                  </p>
                  <p className="mt-2 text-sm">
                    {received.length === 1 ? "item received" : "items received"}
                  </p>
                </div>
              </div>

              {/* Items I am collecting */}
              {collecting.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-xl font-extrabold">Waiting for you to collect</h2>
                  {collecting.map((m) => (
                    <article
                      key={m.id}
                      className="mt-4 rounded-[24px] border-2 border-crimson bg-cream p-5"
                    >
                      <p className="text-lg font-bold">{m.title}</p>
                      <p className="mt-1 text-sm text-muted">Pickup: {m.location}</p>
                      <ContactBox contact={contacts[m.id]} heading="Contact the donor to arrange pickup" />
                      <p className="mt-3 text-xs text-muted">
                        Not collected within 7 days? The item goes back on the list for others.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={busyId === m.id}
                          onClick={() => run(m.id, "complete_handover")}
                          className="rounded-full bg-crimson px-6 py-2.5 text-sm font-bold text-cream transition hover:bg-crimson-deep disabled:opacity-60"
                        >
                          I have received it
                        </button>
                        <button
                          type="button"
                          disabled={busyId === m.id}
                          onClick={() => run(m.id, "release_material")}
                          className="rounded-full border-[1.5px] border-ink px-6 py-2.5 text-sm font-bold text-ink transition hover:bg-ink hover:text-cream disabled:opacity-60"
                        >
                          Cancel collection
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* My donations */}
              <div className="mt-12">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-xl font-extrabold">My donations</h2>
                  <Link
                    href="/materials/donate"
                    className="text-sm font-bold text-crimson hover:underline"
                  >
                    + Donate something
                  </Link>
                </div>

                {donating.length === 0 && (
                  <p className="mt-4 text-sm text-muted">You have not donated anything yet.</p>
                )}

                <div className="mt-4 space-y-4">
                  {donating.map((m) => (
                    <article
                      key={m.id}
                      className="flex gap-4 rounded-[24px] border border-line bg-cream p-4"
                    >
                      {m.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.image_url}
                          alt={m.title}
                          className="size-20 shrink-0 rounded-2xl object-cover sm:size-24"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold leading-tight">{m.title}</p>
                        <p className="mt-0.5 text-xs text-muted">{categoryLabel(m.category)}</p>
                        <p
                          className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                            m.status === "rejected"
                              ? "bg-crimson/10 text-crimson-deep"
                              : m.status === "collected"
                                ? "bg-ink text-cream"
                                : "bg-paper"
                          }`}
                        >
                          {STATUS_LABELS[m.status]}
                        </p>

                        {m.status === "reserved" && (
                          <>
                            <ContactBox
                              contact={contacts[m.id]}
                              heading="Someone is coming for this"
                            />
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={busyId === m.id}
                                onClick={() => run(m.id, "complete_handover")}
                                className="rounded-full bg-crimson px-4 py-2 text-xs font-bold text-cream disabled:opacity-60"
                              >
                                Mark as given
                              </button>
                              <button
                                type="button"
                                disabled={busyId === m.id}
                                onClick={() => run(m.id, "release_material")}
                                className="rounded-full border border-ink px-4 py-2 text-xs font-bold disabled:opacity-60"
                              >
                                Put back on the list
                              </button>
                            </div>
                          </>
                        )}

                        {m.status === "available" && <ShareMaterial id={m.id} title={m.title} />}

                        {["pending", "available", "rejected"].includes(m.status) && (
                          <button
                            type="button"
                            disabled={busyId === m.id}
                            onClick={() => remove(m)}
                            className="mt-3 text-xs font-bold text-muted underline hover:text-crimson disabled:opacity-60"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Received */}
              {received.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-xl font-extrabold">Items I have received</h2>
                  <ul className="mt-4 space-y-2 text-sm">
                    {received.map((m) => (
                      <li key={m.id} className="rounded-2xl border border-line bg-cream px-4 py-3">
                        <span className="font-bold">{m.title}</span>
                        <span className="text-muted">
                          {" "}
                          &middot; from {m.donor?.full_name || "a TFA member"}
                        </span>
                      </li>
                    ))}
                  </ul>
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
