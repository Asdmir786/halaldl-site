import type { GuideArticle } from "@/lib/guides/types";

export const whyRawLogsMatterArticle: GuideArticle = {
  slug: "why-raw-logs-matter",
  faqs: [
    {
      question: "Isn’t a progress bar enough?",
      answer:
        "Progress bars show movement, not cause. When an extractor breaks or a format disappears, the raw yt-dlp line is what tells you why.",
    },
    {
      question: "Do I need logs on every successful download?",
      answer:
        "No. Logs matter most when something fails, looks wrong, or needs a reproducible bug report. Keeping them available is the point — not drowning every success in noise.",
    },
  ],
  blocks: [
    {
      type: "paragraph",
      text: "Extractors break. Platforms change. A GUI that only says “failed” is not trustworthy. Raw yt-dlp output is how you see what actually happened — the same signal power users already read in the terminal.",
    },
    {
      type: "callout",
      tone: "amber",
      title: "Trust posture",
      body: "Visible logs are part of the same honesty as public releases, checksums, and open issues. Hide the engine and you hide the truth when sites change.",
    },
    {
      type: "heading",
      level: 2,
      id: "why-guis-hide-logs",
      text: "Why many GUIs hide the engine",
    },
    {
      type: "list",
      items: [
        "Cleaner UI marketing — fewer “scary” lines",
        "Support load looks lower until users cannot explain failures",
        "Product feels magical until the first real extractor break",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "when-logs-save-you",
      text: "When raw logs save you",
    },
    {
      type: "list",
      items: [
        "Validation looked fine but the extractor still misbehaved",
        "You need to file a useful GitHub issue with the actual error",
        "You are checking whether updating yt-dlp fixed the run",
        "A playlist item fails while siblings succeed",
        "Format selection or merge steps fail after FFmpeg issues",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "cli-vs-gui-logs",
      text: "CLI vs GUI: same engine, different visibility",
    },
    {
      type: "table",
      table: {
        headers: ["Situation", "CLI", "GUI without logs", "GUI with raw logs"],
        rows: [
          ["One-off success", "Fine", "Fine", "Fine"],
          ["Extractor break", "Readable", "Opaque", "Readable"],
          ["Bug report quality", "High", "Low", "High"],
          ["Non-terminal users", "Hard", "Easy until fail", "Easy + diagnosable"],
        ],
      },
    },
    {
      type: "heading",
      level: 2,
      id: "halaldl",
      text: "How HalalDL treats logs",
    },
    {
      type: "paragraph",
      text: "HalalDL keeps raw output part of the product story instead of locking it behind a debug mode. That matches a Windows-first GUI that still respects yt-dlp as the engine — not a black box wrapper.",
    },
    {
      type: "list",
      items: [
        "Raw output stays available when you need to inspect a failure",
        "Useful when validation passes but the downstream extractor still misbehaves",
        "Supports the same trust-first posture as release notes, checksums, and public issues",
      ],
    },
    {
      type: "cta",
      cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    },
  ],
};
