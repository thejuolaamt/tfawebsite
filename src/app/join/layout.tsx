import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the Community",
  description:
    "Join The Fine Artist Community (TFA) for free. Create your artist profile, share your work and connect with artists across Nigeria and beyond.",
  alternates: { canonical: "/join" },
  openGraph: {
    title: "Join The Fine Artist Community (TFA)",
    description:
      "Free to join. Create your artist profile, share your work and meet fellow artists.",
    url: "/join",
  },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
