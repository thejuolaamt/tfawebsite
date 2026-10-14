import type { MetadataRoute } from "next";

const SITE_URL = "https://www.thefineartist.org";

// Add a line here every time you create a new page on the site.
// Update lastModified when the page content changes in a meaningful way.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: "2026-10-14",
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}