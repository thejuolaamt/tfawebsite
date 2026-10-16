import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member Login",
  description: "Log in to your Fine Artist Community (TFA) member account.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
