import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HalalDL",
    short_name: "HalalDL",
    description:
      "Windows-first, local-first desktop GUI for yt-dlp with presets, visible raw logs, and practical install options.",
    start_url: "/",
    display: "standalone",
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
