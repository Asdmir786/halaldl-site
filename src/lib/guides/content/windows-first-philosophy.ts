import type { GuideArticle } from "@/lib/guides/types";

export const windowsFirstPhilosophyArticle: GuideArticle = {
  slug: "windows-first-philosophy",
  faqs: [
    {
      question: "Will HalalDL support macOS or Linux soon?",
      answer:
        "The current release path is explicitly Windows-first (Windows 10/11 x64). If you need macOS or Linux today, choose a cross-platform frontend.",
    },
    {
      question: "Why admit you are a yt-dlp GUI?",
      answer:
        "Because honesty is the product. Pretending the engine is proprietary magic creates trust debt the first time an extractor breaks.",
    },
  ],
  blocks: [
    {
      type: "paragraph",
      text: "HalalDL is intentionally Windows-first, local-first, MIT licensed, and explicit that yt-dlp is the engine. That is a product choice, not a temporary slogan — and it shapes every install path and trust page on this site.",
    },
    {
      type: "heading",
      level: 2,
      id: "what-we-optimize-for",
      text: "What we optimize for",
    },
    {
      type: "list",
      items: [
        "No app account wall",
        "No product telemetry in the current story",
        "Public GitHub source, issues, and releases",
        "Full / Lite / Portable paths for different responsibility levels",
        "Presets and visible logs for everyday Windows use",
        "Checksum guidance for unsigned installer reality",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "what-we-do-not-pretend",
      text: "What we do not pretend",
    },
    {
      type: "list",
      items: [
        "We are not a cloud downloader service",
        "We are not code-signed yet — verify SHA256",
        "We are not a multi-OS product today",
        "We are not magically immune to extractor breakage",
      ],
    },
    {
      type: "table",
      table: {
        headers: ["If you need…", "HalalDL fit", "Better alternative class"],
        rows: [
          ["Windows desktop GUI + presets", "Strong", "—"],
          ["macOS / Linux today", "Not current path", "Cross-platform yt-dlp GUIs"],
          ["Huge unattended scripting", "Secondary", "yt-dlp CLI"],
          ["Channel archive databases", "Not the focus", "Archive-oriented frontends"],
        ],
      },
    },
    {
      type: "heading",
      level: 2,
      id: "why-windows-first",
      text: "Why Windows-first",
    },
    {
      type: "paragraph",
      text: "Focus keeps the install matrix, signing story, WinGet packaging, and UX details honest. Shipping “every OS eventually” without depth creates weaker Windows software and vaguer trust guidance.",
    },
    {
      type: "callout",
      tone: "sky",
      title: "Still open source",
      body: "Windows-first is a release scope choice. The project remains MIT licensed with public source and issues.",
    },
    {
      type: "cta",
      cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    },
  ],
};
