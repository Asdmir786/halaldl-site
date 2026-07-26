import type { GuideArticle } from "@/lib/guides/types";

export const halaldl051Article: GuideArticle = {
  slug: "halaldl-0-5-1",
  faqs: [
    {
      question: "Is 0.5.1 mostly cosmetics?",
      answer:
        "No. The Steel Blue + Mint brand ships with it, but the daily-driver wins are Install Trust, Copy Diagnostics, gentler support prompts, and faster on-demand tool checks.",
    },
    {
      question: "Where do I get the full raw notes?",
      answer:
        "Use the site changelog for the summary, then open the matching GitHub Release for raw notes and assets.",
    },
  ],
  blocks: [
    {
      type: "paragraph",
      text: "HalalDL 0.5.1 is the Trust And Feedback update. It makes install trust clearer, feedback easier, and startup faster — while shipping the official Steel Blue + Mint brand.",
    },
    {
      type: "heading",
      level: 2,
      id: "highlights",
      text: "What landed",
    },
    {
      type: "list",
      items: [
        "Install Trust card in About — GitHub Releases source, unsigned builds, SHA256SUMS guidance",
        "Copy Diagnostics for version, mode, tools, history counts, and startup timings",
        "Gentle Star / Feedback / Not now prompts after three completed downloads",
        "On-demand tool checks instead of probing everything at startup",
        "Settings → Performance timings that travel with diagnostics",
        "Official Steel Blue + Mint brand, BrandLogo, and regenerated Windows icons",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "why-it-matters",
      text: "Why these changes matter together",
    },
    {
      type: "table",
      table: {
        headers: ["Area", "Before friction", "0.5.1 intent"],
        rows: [
          ["Install trust", "Unsigned builds without in-app context", "Explain source, signing status, checksums"],
          ["Bug reports", "Rebuilding environment details by hand", "Copy Diagnostics in one click"],
          ["Support asks", "First-launch nags or never asking", "Ask after real usage, allow Not now"],
          ["Startup", "Probing every managed tool up front", "Check tools when needed"],
          ["Brand", "Palette still settling", "Locked Steel Blue + Mint identity"],
        ],
      },
    },
    {
      type: "heading",
      level: 2,
      id: "who-should-update",
      text: "Who should update",
    },
    {
      type: "list",
      items: [
        "Anyone who wants clearer SmartScreen and checksum guidance in-app",
        "Anyone filing bugs who needs a reliable diagnostics paste",
        "Anyone who wants snappier opens without losing tool checks",
        "Anyone installing HalalDL for the first time on Windows 10/11",
      ],
    },
    {
      type: "callout",
      tone: "mint",
      title: "Still the same trust story",
      body: "Update from GitHub Releases (or WinGet when the catalog catches up), verify SHA256 if you want the extra check, and keep using public issues for bugs.",
    },
    {
      type: "cta",
      cta: { label: "Download latest", href: "/download", eventCta: "go_to_download" },
    },
  ],
};
