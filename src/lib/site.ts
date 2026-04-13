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
    question: "What changed in HalalDL 0.4.1?",
    answer:
      "0.4.1 is a precision polish release: preset filename templates, a more compact quick panel, settings that persist reliably, clearer finished download cards, optional clip start and end controls, and better latest-result spotlight behavior.",
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
    question: "What should I do if settings used to revert for me?",
    answer:
      "Update to v0.4.1, set the behavior option once, then leave and reopen Settings. The release fixes the draft-state issue that could lose tray click behavior after navigation.",
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
    id: "preset-filenames",
    label: "Preset Filenames",
    title: "Let each preset carry the filename pattern it actually needs.",
    description:
      "HalalDL 0.4.1 moves filename templates into custom presets, so repeat jobs can keep the naming rules you already picked without rebuilding them for every download.",
    bullets: [
      "Custom presets can include their own yt-dlp filename template",
      "Missing extension tokens are repaired so files keep a proper suffix",
      "The safer naming path applies to regular downloads and Instagram fallback jobs",
    ],
    accent: "sky",
    stat: "Preset naming stays reusable",
    media: {
      kind: "image",
      lightSrc: "/releases/0.4.1/promo/preset-filenames-light.png",
      darkSrc: "/releases/0.4.1/promo/preset-filenames-dark.png",
      alt: "HalalDL preset filename template editor",
      width: 1600,
      height: 900,
    },
  },
  {
    id: "quick-panel",
    label: "Quick Panel",
    title: "Keep the fast download action reachable on compact screens.",
    description:
      "The quick panel is tighter in 0.4.1. Save location, start mode, subtitles, and preset details now summarize quietly instead of pushing the main action away.",
    bullets: [
      "Repeated metadata is quieter and easier to scan",
      "The download button stays closer to the thumb path",
      "Keyboard-first quick downloads feel smoother on compact Windows layouts",
    ],
    accent: "mint",
    stat: "Compact quick downloads",
    media: {
      kind: "image",
      lightSrc: "/releases/0.4.1/promo/quick-panel-light.png",
      darkSrc: "/releases/0.4.1/promo/quick-panel-dark.png",
      alt: "HalalDL compact quick download panel",
      width: 1600,
      height: 900,
    },
  },
  {
    id: "settings",
    label: "Settings",
    title: "Change behavior once and trust it to stay changed.",
    description:
      "Settings persistence is fixed in 0.4.1. Tray left-click and double-click behavior now commit automatically instead of relying on draft state that can disappear.",
    bullets: [
      "Behavior controls save as they change",
      "Tray click preferences persist after leaving Settings",
      "Existing settings, presets, downloads, and history keep carrying forward normally",
    ],
    accent: "coral",
    stat: "Settings stay saved",
    media: {
      kind: "image",
      lightSrc: "/releases/0.4.1/promo/settings-fix-light.png",
      darkSrc: "/releases/0.4.1/promo/settings-fix-dark.png",
      alt: "HalalDL Settings screen with persistent tray behavior controls",
      width: 1600,
      height: 900,
    },
  },
  {
    id: "finished-cards",
    label: "Finished Results",
    title: "See the size and duration of completed work at a glance.",
    description:
      "Finished download cards now carry more useful result detail. Multi-output jobs can total their sidecars, and media duration appears when HalalDL can read it reliably.",
    bullets: [
      "Output size appears directly on finished download cards",
      "Subtitle sidecars and multi-output jobs are totaled together",
      "Image-only downloads stay clean without fake timeline details",
    ],
    accent: "sky",
    stat: "Result detail gets clearer",
    media: {
      kind: "image",
      lightSrc: "/releases/0.4.1/promo/download-details-light.png",
      darkSrc: "/releases/0.4.1/promo/download-details-dark.png",
      alt: "HalalDL finished download cards with output size and duration",
      width: 1600,
      height: 900,
    },
  },
  {
    id: "latest-result",
    label: "Latest Result",
    title: "Route attention to the newest finished download without leaving a permanent glare.",
    description:
      "Notification-routed results now get a finite glow animation and a subtler latest marker, so the app points to the right result without pretending old work is still new.",
    bullets: [
      "The newest finished result gets a clear but temporary spotlight",
      "Older opened results no longer claim latest status",
      "The attention path stays useful without becoming visual noise",
    ],
    accent: "mint",
    stat: "Newest result is obvious",
    media: {
      kind: "image",
      lightSrc: "/releases/0.4.1/promo/latest-glow-light.png",
      darkSrc: "/releases/0.4.1/promo/latest-glow-dark.png",
      alt: "HalalDL latest finished result spotlight",
      width: 1600,
      height: 900,
    },
  },
  {
    id: "logs",
    label: "Raw Logs",
    title: "Keep the engine visible when a site or extractor behaves badly.",
    description:
      "Even with the tighter 0.4.1 polish release, HalalDL still keeps raw output close at hand. That matters when a platform changes, an extractor breaks, or you need to explain a failure clearly.",
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
  return new URL(PRODUCTION_SITE_URL);
}
