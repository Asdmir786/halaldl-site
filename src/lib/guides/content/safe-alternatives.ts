import type { GuideArticle } from "@/lib/guides/types";

export const safeAlternativesArticle: GuideArticle = {
  slug: "safe-alternatives",
  faqs: [
    {
      question: "Are all desktop downloaders safe?",
      answer:
        "No. Prefer open-source projects with public GitHub Releases and checksums. Avoid random EXEs attached to SEO spam articles.",
    },
    {
      question: "Is yt-dlp itself enough?",
      answer:
        "Yes for many power users. If you want a Windows GUI on top, pick a maintained frontend and still verify the install path.",
    },
  ],
  blocks: [
    {
      type: "callout",
      tone: "mint",
      title: "A safer default",
      body: "Prefer a local tool with an official project page, named release assets, a visible license, and a verifiable update trail. A web page promising every platform with no source trail is not the same thing.",
    },
    {
      type: "paragraph",
      text: "Random “free YouTube to MP4” websites are a malware and privacy lottery. Prefer open-source desktop tools with public GitHub Releases and checksums — whether that is yt-dlp itself or a GUI like HalalDL.",
    },
    {
      type: "callout",
      tone: "coral",
      title: "Hard rule",
      body: "If you cannot name the publisher, license, release page, and verification method, do not run the installer.",
    },
    {
      type: "heading",
      level: 2,
      id: "red-flags",
      text: "Red flags",
    },
    {
      type: "list",
      items: [
        "Browser extensions that demand odd permissions",
        "Mirrors that are not the project’s GitHub",
        "No license, no source, no release history",
        "Forced account walls for a local download",
        "Bundled “optional” adware toolbars",
        "Checksums missing with no explanation",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "better-path",
      text: "Better path",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Pick an open-source yt-dlp GUI or use yt-dlp directly",
        "Download from the project’s GitHub Releases",
        "Verify SHA256 when checksums are published",
        "Only save media you are allowed to access",
        "Prefer apps that keep raw logs when things fail",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "halaldl-fit",
      text: "Where HalalDL fits",
    },
    {
      type: "paragraph",
      text: "HalalDL is a Windows-first, MIT-licensed GUI for yt-dlp with public releases, checksum guidance, Full/Lite/Portable options, and no account wall. It is one safe-shaped option — not the only one — in a category full of unsafe lookalikes.",
    },
    {
      type: "table",
      table: {
        headers: ["Source type", "Trust level", "Notes"],
        rows: [
          ["Project GitHub Releases", "Highest for OSS", "Pair with SHA256"],
          ["WinGet / package managers", "Good with lag caveats", "Confirm package ID"],
          ["Official project site download", "Good if it points to Releases", "Check the final URL"],
          ["Random SEO download blogs", "Avoid", "Common malware path"],
        ],
      },
    },
    {
      type: "cta",
      cta: { label: "HalalDL download path", href: "/download", eventCta: "go_to_download" },
    },
  ],
};
