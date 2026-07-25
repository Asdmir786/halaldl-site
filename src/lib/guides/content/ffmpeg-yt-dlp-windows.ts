import type { GuideArticle } from "@/lib/guides/types";

export const ffmpegYtDlpWindowsArticle: GuideArticle = {
  slug: "ffmpeg-yt-dlp-windows",
  faqs: [
    {
      question: "Do I always need FFmpeg with yt-dlp?",
      answer:
        "Not for every single download, but you usually need it for merging separate video/audio streams, many audio extractions, and common post-processing paths.",
    },
    {
      question: "Does HalalDL Full remove the need to learn PATH?",
      answer:
        "Full is designed to manage more of the local toolchain for most users so you are not stuck debugging PATH on day one. Lite keeps bring-your-own tooling explicit.",
    },
  ],
  blocks: [
    {
      type: "paragraph",
      text: "On Windows, “yt-dlp works” often means “yt-dlp plus FFmpeg works.” Merging separate video/audio streams, many audio extractions, and some post-processing paths depend on FFmpeg being findable by the process that actually runs the download.",
    },
    {
      type: "heading",
      level: 2,
      id: "why-ffmpeg",
      text: "Why FFmpeg shows up so often",
    },
    {
      type: "list",
      items: [
        "Sites often serve video and audio as separate streams",
        "Audio-only workflows frequently need conversion or remux help",
        "Some thumbnail/metadata paths lean on local tooling",
        "Without FFmpeg, jobs can “almost work” then fail at the merge step",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "path-hell",
      text: "PATH hell is real on Windows",
    },
    {
      type: "list",
      items: [
        "ffmpeg.exe is not on PATH",
        "Wrong architecture binary (x86 vs x64)",
        "Old leftover installs shadowing the one you meant",
        "GUI pointing at a different folder than your shell",
        "Multiple package managers installing competing copies",
      ],
    },
    {
      type: "table",
      table: {
        headers: ["Symptom", "Likely cause", "What to check"],
        rows: [
          ["Download finishes oddly / no merge", "FFmpeg missing", "Logs + ffmpeg -version"],
          ["Works in one terminal, not the GUI", "Different PATH", "Where each process searches"],
          ["Audio extract fails", "Converter missing", "Full build or BYO ffmpeg"],
          ["Random old behavior", "Stale binary first on PATH", "which/where ffmpeg"],
        ],
      },
    },
    {
      type: "heading",
      level: 2,
      id: "halaldl-full",
      text: "How HalalDL Full helps",
    },
    {
      type: "paragraph",
      text: "HalalDL Full is designed to manage more of the local toolchain for most users. That reduces first-run friction when you do not want to become a PATH debugger before your first successful download.",
    },
    {
      type: "heading",
      level: 2,
      id: "lite",
      text: "When Lite is still the right answer",
    },
    {
      type: "paragraph",
      text: "Choose Lite when you already manage yt-dlp, ffmpeg, aria2, and related tools yourself and want that boundary explicit. The difference is responsibility — not “Lite is more advanced.”",
    },
    {
      type: "callout",
      tone: "sky",
      title: "Related decision",
      body: "Full vs Lite is about who owns the toolchain. Portable vs installer is about install shape. Pick both axes deliberately.",
    },
    {
      type: "cta",
      cta: { label: "Compare Full vs Lite", href: "/compare/full-vs-lite", eventCta: "compare_full_vs_lite" },
    },
  ],
};
