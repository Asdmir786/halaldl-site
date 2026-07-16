import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HalalDL",
    short_name: "HalalDL",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    categories: ["multimedia", "utilities"],
    background_color: "#f8fafc",
    theme_color: "#080e17",
    icons: [
      {
        src: "/brand/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
