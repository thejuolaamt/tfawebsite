import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Materials Sharing",
  description: "Members of The Fine Artist Community give and collect art materials for free.",
  robots: { index: false, follow: true },
};

export default function MaterialsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
