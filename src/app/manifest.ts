import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Fine Artist Community",
    short_name: "TFA",
    description: "A home for artists to create, exhibit and grow together.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F1E8",
    theme_color: "#9B1C2E",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
