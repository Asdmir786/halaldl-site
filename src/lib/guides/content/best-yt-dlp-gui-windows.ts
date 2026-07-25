import type { GuideArticle } from "@/lib/guides/types";

export const bestYtDlpGuiWindowsArticle: GuideArticle = {
  slug: "best-yt-dlp-gui-windows",
  faqs: [
    {
      question: "Is there an official yt-dlp GUI?",
      answer:
        "No. yt-dlp is a command-line tool. Every GUI listed here is a community frontend that calls yt-dlp under the hood.",
    },
    {
      question: "Do I still need FFmpeg?",
      answer:
        "Usually yes for merges, many audio extractions, and some post-processing paths. Some apps manage FFmpeg for you; others expect you to provide it.",
    },
    {
      question: "Which GUI should most Windows users start with?",
      answer:
        "If you want a Windows-first, local, no-account app with presets and visible logs, HalalDL Full is a strong starting point. Prefer a different tool if you need macOS/Linux or a heavier archive database.",
    },
  ],
  blocks: [
    {
      type: "paragraph",
      text: "yt-dlp is the engine most serious open-source downloaders rely on — but it lives in the terminal. If you want a Windows app instead of flags, you need a GUI frontend. This guide compares the common free options honestly so you can pick for your workflow, not a marketing slogan.",
    },
    {
      type: "callout",
      tone: "amber",
      title: "Responsible use",
      body: "Only download media you are allowed to access and save. Respect copyright, platform rules, and local law. Prefer public GitHub Releases over random “free MP4” websites.",
    },
    {
      type: "heading",
      level: 2,
      id: "what-to-compare",
      text: "What actually matters in a yt-dlp GUI",
    },
    {
      type: "list",
      items: [
        "Windows support and install friction (installer, portable, WinGet)",
        "Whether yt-dlp and FFmpeg are managed or bring-your-own",
        "Presets / repeatable everyday workflow",
        "Visible raw logs when extractors break",
        "Telemetry posture and license clarity",
        "Whether the project is actively maintained",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "comparison-table",
      text: "Quick comparison",
    },
    {
      type: "table",
      caption: "Community frontends change over time — verify each project’s latest release before you install.",
      table: {
        headers: [
          "Tool",
          "Platforms",
          "Tool bundling",
          "Logs / transparency",
          "Presets",
          "Telemetry",
          "License",
          "Windows-first fit",
        ],
        rows: [
          [
            "HalalDL",
            "Windows 10/11 x64",
            "Full manages tools; Lite is BYO",
            "Raw logs are part of the product",
            "Yes, including filename templates",
            "No product telemetry",
            "MIT",
            "Strong",
          ],
          [
            "Open Video Downloader",
            "Cross-platform",
            "Depends on build / setup",
            "Varies by version",
            "Basic quality/format choices",
            "Check project docs",
            "Open source",
            "Good general pick",
          ],
          [
            "Parabolic",
            "Cross-platform",
            "Often manages yt-dlp internally",
            "Simpler UI focus",
            "Simple paste-and-go",
            "Check project docs",
            "Open source",
            "Good if you want minimal UI",
          ],
          [
            "Tartube-class archive UIs",
            "Windows / Linux (typical)",
            "Configurable",
            "Power-user oriented",
            "Heavy channel/DB workflows",
            "Check project docs",
            "Open source",
            "Better for archiving than one-off jobs",
          ],
          [
            "Arroxy / modern cross-platform GUIs",
            "Win / Mac / Linux",
            "Often auto-fetch tools",
            "Product-dependent",
            "Feature-rich download flows",
            "Usually local / no account",
            "Open source (verify)",
            "Strong if you need multi-OS",
          ],
        ],
      },
    },
    {
      type: "heading",
      level: 2,
      id: "halaldl",
      text: "HalalDL — Windows-first GUI with presets and visible logs",
    },
    {
      type: "paragraph",
      text: "HalalDL is built for people who want yt-dlp’s power without living in PowerShell every day. It stays local-first and account-free, ships Full/Lite/Portable paths, and keeps raw output available when a site or extractor misbehaves.",
    },
    {
      type: "list",
      items: [
        "Best when your machine is Windows 10/11 x64",
        "Best when you want reusable presets (including filename templates in 0.4.1+)",
        "Best when you care about checksums, public releases, and MIT licensing",
        "Not the pick if you need macOS or Linux today",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "who-should-pick-what",
      text: "Who should pick what",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Everyday Windows downloads with clear presets → HalalDL Full",
        "You already manage yt-dlp/ffmpeg yourself → HalalDL Lite or another BYO GUI",
        "Cross-platform household (Win + Mac + Linux) → evaluate Arroxy-class or Parabolic-class apps",
        "Long-running channel archives / databases → Tartube-class tools",
        "One-off simplicity and you accept fewer power features → Open Video Downloader or Parabolic",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "safe-download-path",
      text: "Safe download path",
    },
    {
      type: "paragraph",
      text: "Whatever GUI you choose: prefer the project’s GitHub Releases, verify checksums when provided, and treat SmartScreen warnings on unsigned OSS installers as a verification prompt — not a reason to download from a random mirror.",
    },
    {
      type: "cta",
      cta: {
        label: "Download HalalDL for Windows",
        href: "/download",
        eventCta: "go_to_download",
      },
    },
  ],
};
