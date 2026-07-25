import type { GuideArticle } from "@/lib/guides/types";

export const halaldl041Article: GuideArticle = {
  slug: "halaldl-0-4-1",
  faqs: [
    {
      question: "Is 0.4.1 a huge feature release?",
      answer:
        "It is a precision polish release: everyday friction drops in presets, quick panel, settings persistence, finished cards, and latest-result spotlight — without turning the app into a black box.",
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
      text: "HalalDL 0.4.1 is a precision polish release. It focuses on the places people touch every day — presets, the quick panel, settings that stick, finished results, and attention routing — while keeping raw logs and public release trust intact.",
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
        "Preset filename templates with safer extension handling",
        "More compact quick panel so the download action stays reachable",
        "Settings that persist as they change (including tray behavior)",
        "Clearer finished cards with size/duration when available",
        "Finite latest-result spotlight instead of permanent glare",
        "Optional clip start/end controls where the workflow supports them",
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
        headers: ["Area", "Before friction", "0.4.1 intent"],
        rows: [
          ["Naming", "Rebuilding templates per job", "Carry templates in presets"],
          ["Quick panel", "Metadata crowding the action", "Compact, reachable download"],
          ["Settings", "Draft-state surprises", "Persist as you change"],
          ["Finished cards", "Thin result detail", "Size/duration when known"],
          ["Latest result", "Permanent visual noise", "Finite spotlight"],
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
        "Anyone using custom presets and naming rules",
        "Anyone who saw tray/settings behavior revert after navigation",
        "Anyone who wants clearer finished-result cards",
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
