import type { GuideArticle } from "@/lib/guides/types";

export const audioWorkflowArticle: GuideArticle = {
  slug: "audio-workflow",
  faqs: [
    {
      question: "Why does audio extraction need FFmpeg so often?",
      answer:
        "Many sources do not hand you a finished audio file in the container you want. Extraction and remux/conversion commonly depend on local FFmpeg.",
    },
    {
      question: "Can HalalDL Full help here?",
      answer:
        "Yes. Full is designed to manage more of the local toolchain so you are not blocked on PATH setup before audio jobs work.",
    },
  ],
  blocks: [
    {
      type: "paragraph",
      text: "Audio-only workflows are one of the most common reasons people reach for yt-dlp — and one of the first places Windows users hit FFmpeg friction. A GUI helps you pick the intent; the engine and converter still do the work.",
    },
    {
      type: "callout",
      tone: "amber",
      title: "Rights",
      body: "Only extract and keep audio you are allowed to access and save.",
    },
    {
      type: "heading",
      level: 2,
      id: "what-you-need",
      text: "What you need on Windows",
    },
    {
      type: "list",
      items: [
        "A current yt-dlp (directly or via a GUI that can update it)",
        "Working FFmpeg for many extract/convert paths",
        "A naming preset if you are building a library",
        "Enough disk space for temporary intermediates",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "common-failures",
      text: "Common failure modes",
    },
    {
      type: "table",
      table: {
        headers: ["Symptom", "Likely cause", "Next check"],
        rows: [
          ["No audio file produced", "Missing FFmpeg / merge path", "Logs + Full vs Lite tooling"],
          ["Odd container/extension", "Template or format choice", "Preset + extension safety"],
          ["Works once, fails later", "Extractor change", "Update engine + read logs"],
          ["Huge unexpected size", "Wrong format selected", "Confirm audio-only intent"],
        ],
      },
    },
    {
      type: "heading",
      level: 2,
      id: "gui-workflow",
      text: "A clean GUI workflow",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Use HalalDL Full if you do not want to manage FFmpeg yourself",
        "Create or pick a preset aimed at audio-only jobs",
        "Attach a filename template suited to music/podcast libraries",
        "Run the job and keep raw logs available if extraction fails",
      ],
    },
    {
      type: "cta",
      cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    },
  ],
};
