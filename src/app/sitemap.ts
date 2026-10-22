import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.thefineartist.org";
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/events`, lastModified: new Date() },
    { url: `${base}/join`, lastModified: new Date() },
    { url: `${base}/privacy`, lastModified: new Date() },
  ];
}
