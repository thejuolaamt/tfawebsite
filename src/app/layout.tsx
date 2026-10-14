import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const body = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const SITE_URL = "https://www.thefineartist.org";
const TITLE = "The Fine Artist Community (TFA) | Art Community in Nigeria";
const DESCRIPTION =
  "The Fine Artist Community (TFA) is an art community in Nigeria where artists of every level belong, learn, exhibit and grow together. Join us free.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | The Fine Artist Community (TFA)",
  },
  description: DESCRIPTION,
  applicationName: "The Fine Artist Community",
  keywords: [
    "The Fine Artist Community",
    "The Fine Artist",
    "TFA",
    "TFA art community",
    "art community",
    "art community in Nigeria",
    "Nigerian artists",
    "fine art",
    "artists community",
    "art workshops",
    "art exhibitions",
    "Ondo",
  ],
  authors: [{ name: "The Fine Artist Community" }],
  creator: "The Fine Artist Community",
  publisher: "The Fine Artist Community",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "The Fine Artist Community",
    type: "website",
    locale: "en_NG",
    images: [
      {
        url: "/images/tfa-logo-mark.png",
        alt: "The Fine Artist Community (TFA) logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/tfa-logo-mark.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#9C0001",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}