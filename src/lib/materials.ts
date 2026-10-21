export const CATEGORIES = [
  { value: "paint", label: "Paints and colours" },
  { value: "brushes", label: "Brushes" },
  { value: "canvas", label: "Canvas and boards" },
  { value: "paper", label: "Paper and sketchbooks" },
  { value: "drawing", label: "Pencils, charcoal and pastels" },
  { value: "tools", label: "Tools and equipment" },
  { value: "other", label: "Other" },
] as const;

export const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like new" },
  { value: "used", label: "Used" },
] as const;

export const INPUT_CLASS =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/20";

export function categoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function conditionLabel(value: string) {
  return CONDITIONS.find((c) => c.value === value)?.label ?? value;
}

export type Material = {
  id: string;
  donor_id: string;
  title: string;
  description: string | null;
  category: string;
  item_condition: string;
  location: string;
  delivery_available: boolean;
  image_url: string | null;
  status: "pending" | "available" | "reserved" | "collected" | "rejected";
  collected_by: string | null;
  created_at: string;
  donor: { full_name: string | null; avatar_url: string | null } | null;
};

export type Contact = {
  relation: "donor" | "collector";
  full_name: string | null;
  phone: string | null;
  instagram: string | null;
  email: string | null;
};

// What we ask the database for on every listing
export const MATERIAL_COLUMNS =
  "id, donor_id, title, description, category, item_condition, location, delivery_available, image_url, status, collected_by, created_at, donor:profiles!donor_id(full_name, avatar_url)";

// Turns 0801 234 5678 or +234 801 234 5678 into a WhatsApp link
export function whatsappLink(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) digits = "234" + digits.slice(1);
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}`;
}

// Finds the file path inside a public storage link, so a file can be deleted
export function storagePathFromUrl(url: string, bucket: string) {
  const marker = `/${bucket}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
}
