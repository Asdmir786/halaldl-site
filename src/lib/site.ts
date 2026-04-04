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
    id: "quick-flow",
    label: "Quick Flow",
    title: "Catch a copied link from the tray and launch a download fast.",
    description:
      "HalalDL 0.4.0 adds a lighter repeat-download path. You can open the quick tray panel, pull in the copied link, choose a preset, and fire the job without walking the whole app every time.",
    bullets: [
      "Tray-first panel keeps repeat downloads fast without hiding what will happen next",
      "Clipboard-aware flow reduces the copy-paste routine for everyday links",
      "Preset choice stays visible so the fast path still feels deliberate",
    ],
    accent: "sky",
    stat: "Tray-first repeat flow",
    media: {
      kind: "image",
      lightSrc: "/releases/0.4.0/promo/quick-flow.png",
      darkSrc: "/releases/0.4.0/promo/quick-flow-dark.png",
      alt: "HalalDL quick flow tray download panel",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "subtitle-presets",
    label: "Preset Logic",
    title: "Let presets carry subtitle choices instead of redoing them every run.",
    description:
      "The 0.4.0 preset refresh makes subtitle behavior part of the preset story. That means fewer repeated toggles, clearer labeling, and a setup that feels authored instead of improvised.",
    bullets: [
      "Subtitle-aware presets carry language and subtitle intent with the preset itself",
      "Built-in grouping reads more cleanly in both the main app and quick tray flow",
      "A dedicated subtitles-only path makes the preset model more complete",
    ],
    accent: "mint",
    stat: "Preset choices stay reusable",
    media: {
      kind: "image",
      lightSrc: "/releases/0.4.0/promo/subtitle-presets.png",
      darkSrc: "/releases/0.4.0/promo/subtitle-presets-dark.png",
      alt: "HalalDL subtitle-aware preset selection",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "updates",
    label: "App Updates",
    title: "Download the right package and verify it before install.",
    description:
      "The About update flow is stronger in 0.4.0. The app can now identify the correct release package, verify the checksum, and stage the handoff more safely when you are updating.",
    bullets: [
      "Release-package detection is clearer than a generic download prompt",
      "Checksum verification fits the trust story the website already emphasizes",
      "The update path feels like part of the product, not a detached afterthought",
    ],
    accent: "coral",
    stat: "Verified update handoff",
    media: {
      kind: "image",
      lightSrc: "/releases/0.4.0/screenshots/about-update.png",
      darkSrc: "/releases/0.4.0/screenshots/about-update-dark.png",
      alt: "HalalDL About screen showing verified app updates",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "notifications",
    label: "Notification Routing",
    title: "Click the alert and land on the exact thing that needs attention.",
    description:
      "0.4.0 turns notifications into navigation instead of noise. Supported alerts can now bring HalalDL forward and spotlight the exact tool, download, or update area that changed.",
    bullets: [
      "Actionable notifications reduce hunting through the app after a toast appears",
      "Spotlight states make the destination obvious once the window opens",
      "The release adds a more trustworthy bridge between alerts and actual app state",
    ],
    accent: "sky",
    stat: "Alerts become actionable",
    media: {
      kind: "image",
      lightSrc: "/releases/0.4.0/promo/notification-spotlight.png",
      darkSrc: "/releases/0.4.0/promo/notification-spotlight-dark.png",
      alt: "HalalDL notification spotlight routing",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "history",
    label: "History",
    title: "Keep completed runs visible instead of reconstructing them from memory.",
    description:
      "The refreshed History screen makes repeatable downloading easier to trust over time. Archive summaries, filters, and clearer browsing give the app more of a durable desktop-tool feel.",
    bullets: [
      "Archive summary and filters read more cleanly after the refresh",
      "Saved jobs stay inspectable after the active queue is gone",
      "Repeat downloading feels more dependable when finished work stays traceable",
    ],
    accent: "mint",
    stat: "Completed runs stay traceable",
    media: {
      kind: "image",
      lightSrc: "/releases/0.4.0/promo/history-refresh.png",
      darkSrc: "/releases/0.4.0/promo/history-refresh-dark.png",
      alt: "HalalDL refreshed history screen",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "logs",
    label: "Raw Logs",
    title: "Keep the engine visible when a site or extractor behaves badly.",
    description:
      "Even with the faster quick-flow release, HalalDL still keeps raw output close at hand. That matters when a platform changes, an extractor breaks, or you need to explain a failure clearly.",
    bullets: [
      "Raw output stays part of the product story instead of hiding behind debug mode",
      "Useful when validation passes but the downstream extractor still misbehaves",
      "Supports the same trust-first posture as release notes, checksums, and public issues",
    ],
    accent: "coral",
    stat: "Visible output beats vague progress",
    media: {
      kind: "image",
      lightSrc: "/screenshots/light/halaldl-logs.png",
      darkSrc: "/screenshots/halaldl-logs.png",
      alt: "HalalDL logs screen",
      width: 1600,
      height: 1000,
    },
  },
];

export function getSiteUrl() {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    PRODUCTION_SITE_URL;

  return new URL(candidate);
}
