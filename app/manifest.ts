import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pennywise",
    short_name: "Pennywise",
    description: "Smart personal expense monitoring, transaction tracking & budget management system",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#090d16",
    theme_color: "#10b981",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "192x192 512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icons/icon.svg",
        sizes: "192x192 512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
