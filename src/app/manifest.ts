import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/lib/seo";
import { THEME_COLOR_DARK, THEME_COLOR_LIGHT } from "@/lib/theme";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HalalDL",
    short_name: "HalalDL",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    categories: ["multimedia", "utilities"],
    background_color: THEME_COLOR_LIGHT,
    theme_color: THEME_COLOR_DARK,
    icons: [
      {
        src: "/brand/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/brand/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/brand/icon-light.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icon-dark.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
