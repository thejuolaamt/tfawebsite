import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage events",
  robots: { index: false, follow: false },
};

export default function ManageEventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
