import type { GuideArticle } from "@/lib/guides/types";

export const portableHalaldlArticle: GuideArticle = {
  slug: "portable-halaldl",
  faqs: [
    {
      question: "Is Portable the same as Lite?",
      answer:
        "No. Portable is about install shape (no traditional installer; keep data together). Full vs Lite is about who manages the toolchain.",
    },
    {
      question: "Should I still verify SHA256 for Portable?",
      answer:
        "Yes. Download the Portable ZIP from GitHub Releases and verify against the matching SHA256SUMS.txt entry.",
    },
  ],
  blocks: [
    {
      type: "paragraph",
      text: "The Portable ZIP is for locked-down or no-install Windows setups. Keep the app, settings, archive data, thumbnails, and managed tools together in one folder instead of writing a classic installed layout.",
    },
    {
      type: "heading",
      level: 2,
      id: "when-portable-wins",
      text: "When Portable wins",
    },
    {
      type: "list",
      items: [
        "You cannot (or should not) write to Program Files",
        "You want to carry the app on a USB drive or secondary folder",
        "You need a self-contained tree for support or rollback",
        "Policy prefers no traditional installer",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "two-axes",
      text: "Two axes: install shape vs toolchain responsibility",
    },
    {
      type: "table",
      table: {
        headers: ["Decision", "Options", "Question to ask"],
        rows: [
          ["Install shape", "Setup EXE / MSI / Portable ZIP", "Where should the app and data live?"],
          ["Toolchain", "Full vs Lite", "Who manages yt-dlp and FFmpeg?"],
          ["Updates", "GitHub Releases vs WinGet", "Do I need newest assets today?"],
        ],
      },
    },
    {
      type: "callout",
      tone: "sky",
      title: "Still choose intentionally",
      body: "Portable is about install shape. Full vs Lite is about who manages the toolchain. Pick both axes deliberately — Portable does not automatically mean Lite.",
    },
    {
      type: "heading",
      level: 2,
      id: "safe-path",
      text: "Safe Portable path",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Open the latest GitHub Release",
        "Download the Portable ZIP from that release",
        "Verify SHA256 against SHA256SUMS.txt",
        "Extract to a folder you control and run from there",
      ],
    },
    {
      type: "cta",
      cta: { label: "See download options", href: "/download", eventCta: "go_to_download" },
    },
  ],
};
