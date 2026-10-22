import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage blog",
  robots: { index: false, follow: false },
};

export default function ManageBlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}