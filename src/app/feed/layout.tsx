import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Feed",
  description: "New artwork from members of The Fine Artist Community.",
  robots: { index: false, follow: false },
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
