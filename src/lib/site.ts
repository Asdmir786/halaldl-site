export const SITE_LINKS = {
  repoUrl: "https://github.com/Asdmir786/HalalDL",
  latestReleaseUrl: "https://github.com/Asdmir786/HalalDL/releases/latest",
  issuesUrl: "https://github.com/Asdmir786/HalalDL/issues/new/choose",
  supportUrl: "https://github.com/Asdmir786/HalalDL/blob/main/SUPPORT.md",
  wingetCommand: "winget install --id Asdmir786.HalalDL",
};

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
      "Current installers are not code-signed yet. The safe path is to download only from GitHub Releases and verify the installer against the SHA256SUMS.txt file attached to the release.",
  },
  {
    question: "What is the canonical download source?",
    answer:
      "GitHub Releases is the canonical source. WinGet is supported, but the catalog can lag behind the latest GitHub release.",
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
      "Download from GitHub Releases, open the attached SHA256SUMS.txt file, and verify the installer checksum before proceeding if you want the strongest trust path.",
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
    id: "downloads",
    label: "Downloads",
    title: "Queue downloads without living in a terminal.",
    description:
      "Paste a URL, choose a preset, decide whether to start immediately or queue it, and keep the workflow visible from one screen.",
    bullets: [
      "URL input, preset selection, and queue actions on one surface",
      "Queue and start-now flow stays explicit instead of hidden",
      "Windows-first layout that feels like a desktop utility, not a shell wrapper",
    ],
    accent: "sky",
    stat: "Start now or queue",
    media: {
      kind: "image",
      lightSrc: "/screenshots/light/halaldl-downloads.png",
      darkSrc: "/screenshots/halaldl-downloads.png",
      alt: "HalalDL downloads screen",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "logs",
    label: "Raw Logs",
    title: "Keep the raw output visible when something goes wrong.",
    description:
      "HalalDL does not try to hide the engine. The design principle is to keep the raw yt-dlp output visible so failures feel diagnosable, not mysterious.",
    bullets: [
      "Raw output is part of the default story, not buried behind a debug mode",
      "Useful when platform rules, extractors, or auth requirements change",
      "Matches the project's trust-first tone: clear state, clear failure, clear source",
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
  {
    id: "settings",
    label: "Settings",
    title: "Match the interface to your theme without losing the utility feel.",
    description:
      "The updated settings view makes the light, dark, and system appearance options explicit, which gives the site a clean bridge into a real dual-mode product story.",
    bullets: [
      "Appearance choices are visible instead of hidden in a generic preferences drawer",
      "Accent, storage, and behavior settings feel like part of the product, not an afterthought",
      "Lets the website mirror the app with matching light and dark screenshots",
    ],
    accent: "mint",
    stat: "Light, dark, or system",
    media: {
      kind: "image",
      lightSrc: "/screenshots/light/halaldl-settings.png",
      darkSrc: "/screenshots/halaldl-settings.png",
      alt: "HalalDL settings screen",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "history",
    label: "History",
    title: "Keep completed runs visible instead of losing them to a closed shell.",
    description:
      "A populated history view makes repeatable downloading more practical. You can inspect what completed, when it ran, and what preset or destination was used without reconstructing the session from memory.",
    bullets: [
      "Completed items stay visible after the active queue is gone",
      "Useful for tracking what already ran and avoiding duplicate work",
      "Turns the app into a better long-lived desktop utility, not a one-shot wrapper",
    ],
    accent: "sky",
    stat: "Completed runs stay traceable",
    media: {
      kind: "image",
      lightSrc: "/screenshots/light/halaldl-history.png",
      darkSrc: "/screenshots/halaldl-history.png",
      alt: "HalalDL history screen",
      width: 1600,
      height: 1000,
    },
  },
];

export function getSiteUrl() {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://halaldl.vercel.app");

  return new URL(candidate);
}
