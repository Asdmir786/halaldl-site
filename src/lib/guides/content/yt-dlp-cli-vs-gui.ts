import type { GuideArticle } from "@/lib/guides/types";

export const ytDlpCliVsGuiArticle: GuideArticle = {
  slug: "yt-dlp-cli-vs-gui",
  faqs: [
    {
      question: "Is a GUI slower or weaker than yt-dlp CLI?",
      answer:
        "A GUI still calls yt-dlp. You trade some scripting flexibility for speed of everyday use. Power users can keep CLI for automation and a GUI for interactive jobs.",
    },
    {
      question: "Can a GUI still show what yt-dlp is doing?",
      answer:
        "Yes — if it exposes raw logs. HalalDL keeps visible output part of the product story instead of hiding failures behind a vague progress spinner.",
    },
    {
      question: "Should beginners start with CLI?",
      answer:
        "Only if they enjoy terminals. Most Windows beginners get a successful first download faster with a maintained GUI, then learn CLI later for batch jobs.",
    },
  ],
  blocks: [
    {
      type: "paragraph",
      text: "yt-dlp is excellent. The question is not “CLI or nothing?” — it is which interface matches the job in front of you. This guide separates batch/automation work from everyday Windows downloads, and explains where a GUI like HalalDL fits without pretending the engine disappeared.",
    },
    {
      type: "callout",
      tone: "amber",
      title: "Same engine",
      body: "Every serious open-source GUI in this category still depends on yt-dlp under the hood. The interface changes. The extractor reality does not.",
    },
    {
      type: "heading",
      level: 2,
      id: "when-cli-wins",
      text: "When the command line wins",
    },
    {
      type: "list",
      items: [
        "Large batch files and unattended overnight jobs",
        "Exact format strings and one-off experiments you want to script",
        "CI, Task Scheduler, or shell pipelines",
        "You already live in PowerShell and keep yt-dlp updated yourself",
        "You need flags a given GUI has not exposed yet",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "when-gui-wins",
      text: "When a GUI wins",
    },
    {
      type: "list",
      items: [
        "Paste a URL, pick a preset, download — repeatedly",
        "You want filename rules saved with the preset, not retyped",
        "You prefer a clear finished-result card over scrolling terminal noise",
        "Other people in the house should not need a cheat sheet to use the tool",
        "You still want raw logs available when something breaks",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "comparison",
      text: "Side-by-side",
    },
    {
      type: "table",
      table: {
        headers: ["Need", "Prefer CLI", "Prefer GUI"],
        rows: [
          ["One video right now", "Fine if already set up", "Usually faster"],
          ["200 URLs overnight", "Native strength", "Awkward / limited"],
          ["Reusable naming rules", "Config / templates", "Presets"],
          ["Explain a failure", "Verbose flags", "Raw logs in the app"],
          ["Share with non-terminal users", "Poor fit", "Better fit"],
          ["Exact obscure flags", "Best", "Only if exposed"],
        ],
      },
    },
    {
      type: "heading",
      level: 2,
      id: "setup-friction",
      text: "Setup friction on Windows",
    },
    {
      type: "paragraph",
      text: "CLI on a fresh Windows machine often means installing yt-dlp, placing FFmpeg correctly, fixing PATH, and learning enough flags to be dangerous. A Full-style GUI collapses that into an install path — which is why many people abandon CLI before the first success.",
    },
    {
      type: "heading",
      level: 2,
      id: "halaldl-middle",
      text: "HalalDL’s middle path",
    },
    {
      type: "paragraph",
      text: "HalalDL is a Windows GUI for yt-dlp that does not pretend the engine is magic. Presets and a compact quick panel cover the daily path; visible logs keep troubleshooting honest when extractors break.",
    },
    {
      type: "list",
      items: [
        "Full manages more toolchain friction for most users",
        "Lite keeps bring-your-own yt-dlp/ffmpeg explicit",
        "Portable supports no-install folder workflows",
        "Checksum guidance stays part of the trust story",
      ],
    },
    {
      type: "callout",
      tone: "mint",
      title: "Practical split",
      body: "Keep CLI for automation. Use HalalDL for interactive Windows downloads. You do not have to pick only one forever.",
    },
    {
      type: "cta",
      cta: {
        label: "Try HalalDL on Windows",
        href: "/download",
        eventCta: "go_to_download",
      },
    },
  ],
};
