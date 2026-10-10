import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thefineartist.org"),
  title: "The Fine Artist Community (TFA)",
  description: "Home of creative inclusiveness. TFA gives artists a place to belong, work, and grow.",
  openGraph: {
    title: "The Fine Artist Community (TFA)",
    description: "Home of creative inclusiveness. TFA gives artists a place to belong, work, and grow.",
    url: "https://www.thefineartist.org",
    siteName: "The Fine Artist Community",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

