import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { conditionLabel } from "@/lib/materials";
import ItemView, { type Preview } from "./ItemView";

type Props = { params: Promise<{ id: string }> };

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Asks the database for the safe preview (title, photo, condition only).
// "cache" means the page and its sharing card share one answer.
const getPreview = cache(async (id: string): Promise<Preview> => {
  const supabase = await createClient();
  const { data } = await supabase.rpc("material_preview", { p_id: id });
  const rows = (data ?? []) as NonNullable<Preview>[];
  return rows[0] ?? null;
});

// This builds the card people see in WhatsApp, Telegram, Facebook and so on.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = ID_PATTERN.test(id) ? await getPreview(id) : null;

  if (!item || item.status !== "available") {
    return { title: "Materials Sharing", robots: { index: false, follow: false } };
  }

  const title = `Free: ${item.title}`;
  const description = `${conditionLabel(item.item_condition)}. ${
    item.delivery_available ? "Can deliver. " : ""
  }Collect it free on The Fine Artist Community.`;
  const images = item.image_url ? [{ url: item.image_url, alt: item.title }] : undefined;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      title: `${title} | The Fine Artist Community`,
      description,
      url: `/materials/${id}`,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: images?.map((image) => image.url),
    },
  };
}

export default async function MaterialPage({ params }: Props) {
  const { id } = await params;
  if (!ID_PATTERN.test(id)) notFound();

  const preview = await getPreview(id);
  return <ItemView id={id} preview={preview} />;
}