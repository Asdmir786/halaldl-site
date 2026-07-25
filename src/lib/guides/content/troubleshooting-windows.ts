import type { GuideArticle } from "@/lib/guides/types";

export const troubleshootingWindowsArticle: GuideArticle = {
  slug: "troubleshooting-windows",
  faqs: [
    {
      question: "What should I try first when a download fails?",
      answer:
        "Update yt-dlp / the engine path, confirm FFmpeg for merge and audio jobs, then read the raw log line instead of only the toast.",
    },
    {
      question: "SmartScreen appeared — is the file malware?",
      answer:
        "Not automatically. Unsigned OSS installers are often uncommon. Verify GitHub Releases source and SHA256 before deciding to continue.",
    },
  ],
  blocks: [
    {
      type: "paragraph",
      text: "Most Windows yt-dlp pain clusters around outdated extractors, missing FFmpeg, blocked unsigned installers, and opaque GUI failures. Fix the checklist in order before you rewrite your whole setup.",
    },
    {
      type: "heading",
      level: 2,
      id: "checklist",
      text: "Fast checklist",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Update yt-dlp / use an app path that can update the engine",
        "Confirm FFmpeg is available for merge and audio jobs",
        "Read the raw log line, not just the toast",
        "Verify the installer came from GitHub Releases if SmartScreen warns",
        "Retry after checking cookies / login-gated content requirements",
        "Confirm you are on a supported Windows 10/11 x64 path for HalalDL",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "symptom-map",
      text: "Symptom map",
    },
    {
      type: "table",
      table: {
        headers: ["Symptom", "Likely area", "Guide / action"],
        rows: [
          ["Unable to extract…", "Outdated extractor", "Update engine"],
          ["Merge / audio fail", "FFmpeg", "FFmpeg + Full vs Lite guides"],
          ["SmartScreen warning", "Unsigned installer", "Verify SHA256 guide"],
          ["Settings didn’t stick", "Persistence bug (pre-0.4.1)", "Update to latest"],
          ["One playlist item fails", "Item-specific extractor", "Read raw logs"],
          ["WinGet older than site", "Catalog lag", "GitHub Releases"],
        ],
      },
    },
    {
      type: "heading",
      level: 2,
      id: "what-to-capture",
      text: "What to capture for a good bug report",
    },
    {
      type: "list",
      items: [
        "HalalDL version and build (Full / Lite / Portable)",
        "Windows version",
        "The URL class (do not paste private credentials)",
        "The raw log excerpt around the failure",
        "Whether FFmpeg is managed or bring-your-own",
      ],
    },
    {
      type: "callout",
      tone: "mint",
      title: "HalalDL angle",
      body: "Visible raw logs exist so troubleshooting can be specific. Opaque “failed” toasts are not enough when extractors change weekly.",
    },
    {
      type: "cta",
      cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    },
  ],
};
