export const SITE_LINKS = {
  repoUrl: "https://github.com/Asdmir786/HalalDL",
  latestReleaseUrl: "https://github.com/Asdmir786/HalalDL/releases/latest",
  issuesUrl: "https://github.com/Asdmir786/HalalDL/issues/new/choose",
  supportUrl: "https://github.com/Asdmir786/HalalDL/blob/main/SUPPORT.md",
  wingetCommand: "winget install --id Asdmir786.HalalDL",
};

export const PRODUCTION_SITE_URL = "https://halaldl.vercel.app";
export const DEFAULT_SOCIAL_IMAGE = "/social/halaldl-social-preview.png";

export function getSocialImage(alt: string) {
  return [
    {
      url: DEFAULT_SOCIAL_IMAGE,
      width: 1280,
      height: 640,
      alt,
    },
  ];
}

export const FAQ_ITEMS = [
  {
    question: "Is HalalDL a cloud service?",
    answer:
      "No. HalalDL is a local desktop app. There is no account system, no hosted sync, and no telemetry layer in the product pitch or current release path.",
  },
  {
    question: "Which build should most people use?",
    answer:
      "Use Full if you want the easiest install path. Use Lite if you prefer managing yt-dlp, ffmpeg, aria2, and optional runtime tools yourself.",
  },
  {
    question: "Does HalalDL support macOS or Linux?",
    answer:
      "Not in the current release path. The project is explicitly Windows-first right now, targeting Windows 10 and Windows 11 on x64 hardware.",
  },
  {
    question: "Why does SmartScreen warn on first run?",
    answer:
      "Current installers are not code-signed yet. The safe path is to download only from GitHub Releases and verify SHA256 against the SHA256SUMS.txt file attached to the release.",
  },
  {
    question: "What is the canonical download source?",
    answer:
      "GitHub Releases is the direct source for the latest build. WinGet is supported, but the catalog can lag behind the latest GitHub release.",
  },
  {
    question: "Does HalalDL send telemetry or analytics?",
    answer:
      "No telemetry is part of the current product story or release path. The value proposition is explicitly local-first and account-free.",
  },
  {
    question: "Does the app bundle yt-dlp and ffmpeg?",
    answer:
      "The Full build is designed to manage the main toolchain for most users. The Lite build is for people who prefer bringing their own yt-dlp, ffmpeg, aria2, and related tooling.",
  },
  {
    question: "Why are raw logs visible in the UI?",
    answer:
      "Because download tools fail in real ways. Keeping raw output visible makes the app easier to trust, debug, and support when site rules or extractor behavior change.",
  },
  {
    question: "Can I use HalalDL without an internet account?",
    answer:
      "Yes. There is no app account, sign-in flow, or hosted dashboard involved in the normal desktop workflow.",
  },
  {
    question: "What is the difference between Full and Lite?",
    answer:
      "Full aims to reduce setup work and is the recommended path for most users. Lite keeps the app leaner and expects you to manage the underlying tools yourself.",
  },
  {
    question: "Is WinGet the fastest way to get new releases?",
    answer:
      "Not always. WinGet is convenient, but the authoritative and fastest path to the newest build is still GitHub Releases.",
  },
  {
    question: "How should I verify an installer before first run?",
    answer:
      "Download from GitHub Releases, open the attached SHA256SUMS.txt file, and verify SHA256 before proceeding if you want an extra integrity check.",
  },
  {
    question: "Is HalalDL meant for Windows only right now?",
    answer:
      "Yes. The project is explicitly positioned as Windows-first today, targeting Windows 10 and Windows 11 x64 systems.",
  },
  {
    question: "Where should I report bugs or request features?",
    answer:
      "Use the GitHub issues flow for bugs and requests. That keeps the support path public, searchable, and tied to the actual release history.",
  },
  {
    question: "Can I inspect exactly what changed between releases?",
    answer:
      "Yes. The website changelog gives a high-level summary, and each entry can link back to the matching GitHub Release for the full raw notes and assets.",
  },
  {
    question: "What changed in HalalDL 0.5.1?",
    answer:
      "0.5.1 is the Trust And Feedback update: an Install Trust card, Copy Diagnostics, gentle Star/Feedback prompts after three completed downloads, faster on-demand tool checks with Performance timings, and the official Steel Blue + Mint brand.",
  },
  {
    question: "Do preset filename templates need %(ext)s?",
    answer:
      "No. Custom presets can include a filename template, and HalalDL makes extension handling safe when the template omits %(ext)s so downloaded files still keep a proper extension.",
  },
  {
    question: "Why are the Full and Lite installers close in size?",
    answer:
      "Both are Windows desktop installers for the same app. The practical difference is responsibility: Full is meant to manage more of the local tool setup, while Lite is for people who already manage yt-dlp, FFmpeg, aria2, and related tools themselves.",
  },
  {
    question: "Will HalalDL nag me for feedback on first launch?",
    answer:
      "No. Support prompts for Star and Feedback only appear after three completed downloads, and you can dismiss them with Not now. There is no first-launch modal wall.",
  },
  {
    question: "Does clip mode always cut with frame-perfect accuracy?",
    answer:
      "No. Clip mode depends on yt-dlp download-section behavior, so exact cut behavior can depend on the source, selected format, and available local tooling.",
  },
];

export type FeatureStory = {
  id: string;
  label: string;
  title: string;
  description: string;
  bullets: string[];
  accent: "sky" | "mint" | "coral";
  stat: string;
  media: {
    kind: "image";
    lightSrc: string;
    darkSrc: string;
    alt: string;
    width: number;
    height: number;
  };
};

export const FEATURE_STORIES: FeatureStory[] = [
  {
    id: "trust-diagnostics",
    label: "Install Trust",
    title: "Explain where the build came from — and how to verify it.",
    description:
      "HalalDL 0.5.1 adds an Install Trust card in About: official downloads come from GitHub Releases, releases are still unsigned, and SHA256SUMS.txt is the integrity check when you want it.",
    bullets: [
      "About states the canonical GitHub Releases download path",
      "Unsigned-installer and SmartScreen expectations stay explicit",
      "Copy Diagnostics packs version, mode, tools, history, and startup timings",
    ],
    accent: "sky",
    stat: "Trust you can verify",
    media: {
      kind: "image",
      lightSrc: "/releases/0.5.1/promo/trust-diagnostics-light.png",
      darkSrc: "/releases/0.5.1/promo/trust-diagnostics-dark.png",
      alt: "HalalDL Install Trust card and Copy Diagnostics",
      width: 1600,
      height: 900,
    },
  },
  {
    id: "support-prompts",
    label: "Support Prompts",
    title: "Ask for a star or feedback only after real usage.",
    description:
      "After three completed downloads, Settings/About and History gently offer Star, Feedback, or Not now — no first-launch nag and no modal interruption.",
    bullets: [
      "Prompts appear after three completed downloads",
      "Star, Feedback, and Not now stay one-click choices",
      "No first-run modal wall or blocking overlay",
    ],
    accent: "mint",
    stat: "Feedback without friction",
    media: {
      kind: "image",
      lightSrc: "/releases/0.5.1/promo/support-prompts-light.png",
      darkSrc: "/releases/0.5.1/promo/support-prompts-dark.png",
      alt: "HalalDL gentle Star and Feedback support prompts",
      width: 1600,
      height: 900,
    },
  },
  {
    id: "faster-startup",
    label: "Faster Startup",
    title: "Check tools when you need them — not before every open.",
    description:
      "Startup no longer probes every managed tool up front. Settings → Performance shows timings in-app, and they ride along when you copy diagnostics.",
    bullets: [
      "On-demand yt-dlp and related tool checks",
      "Performance timings visible in Settings",
      "ASAP URL autofill keeps unique clipboard links ready",
    ],
    accent: "coral",
    stat: "Snappier everyday opens",
    media: {
      kind: "image",
      lightSrc: "/releases/0.5.1/promo/faster-startup-light.png",
      darkSrc: "/releases/0.5.1/promo/faster-startup-dark.png",
      alt: "HalalDL Settings Performance timings and faster startup",
      width: 1600,
      height: 900,
    },
  },
  {
    id: "brand-identity",
    label: "Brand",
    title: "Ship the official Steel Blue + Mint identity end to end.",
    description:
      "0.5.1 locks the approved Steel Blue + Mint palette, ships a theme-aware BrandLogo in Sidebar and About, and regenerates Windows icons from the transparent marks.",
    bullets: [
      "Default theme maps to the approved Steel Blue + Mint identity",
      "Theme-aware BrandLogo in Sidebar and About",
      "Regenerated Tauri and Windows icon assets",
    ],
    accent: "sky",
    stat: "Clearly itself on open",
    media: {
      kind: "image",
      lightSrc: "/releases/0.5.1/promo/brand-identity-light.png",
      darkSrc: "/releases/0.5.1/promo/brand-identity-dark.png",
      alt: "HalalDL Steel Blue and Mint brand identity",
      width: 1600,
      height: 900,
    },
  },
  {
    id: "logs",
    label: "Raw Logs",
    title: "Keep the engine visible when a site or extractor behaves badly.",
    description:
      "Even with the Trust And Feedback focus in 0.5.1, HalalDL still keeps raw output close at hand. That matters when a platform changes, an extractor breaks, or you need to explain a failure clearly.",
    bullets: [
      "Raw output stays part of the product story instead of hiding behind debug mode",
      "Useful when validation passes but the downstream extractor still misbehaves",
      "Supports the same trust-first posture as release notes, checksums, and public issues",
    ],
    accent: "coral",
    stat: "Visible output beats vague progress",
    media: {
      kind: "image",
      lightSrc: "/releases/0.5.1/promo/raw-logs-light.png",
      darkSrc: "/releases/0.5.1/promo/raw-logs-dark.png",
      alt: "HalalDL Logs screen with visible yt-dlp console output",
      width: 1600,
      height: 900,
    },
  },
];

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : PRODUCTION_SITE_URL);

  return new URL(configuredUrl);
}
