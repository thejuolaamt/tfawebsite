import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artist",
  description: "An artist from The Fine Artist Community.",
  robots: { index: false, follow: false },
};

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
  return children;
}