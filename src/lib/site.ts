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
    id: "presets",
    label: "Presets",
    title: "Save sane defaults instead of repeating yt-dlp flags.",
    description:
      "Preset-driven downloads are a core reason this app exists. The UI exposes useful defaults for most people while keeping the workflow transparent for power users.",
    bullets: [
      "Built-in presets for common video and audio targets",
      "Duplicate and customize presets without starting from scratch",
      "Practical compatibility choices for editors, phones, and archive use",
    ],
    accent: "mint",
    stat: "Preset-first workflow",
    media: {
      kind: "image",
      lightSrc: "/screenshots/light/halaldl-presets.png",
      darkSrc: "/screenshots/halaldl-presets.png",
      alt: "HalalDL presets screen",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "tools",
    label: "Tools",
    title: "Handle binaries from one place instead of chasing setup docs.",
    description:
      "Full and Lite builds stay honest about how much setup they manage. The tools screen makes that tradeoff visible rather than pretending every machine is identical.",
    bullets: [
      "Full is the recommended path for most users",
      "Lite is for people who want direct control over their toolchain",
      "yt-dlp, ffmpeg, aria2, and optional runtime support are surfaced clearly",
    ],
    accent: "sky",
    stat: "Full vs Lite stays explicit",
    media: {
      kind: "image",
      lightSrc: "/screenshots/light/halaldl-tools.png",
      darkSrc: "/screenshots/halaldl-tools.png",
      alt: "HalalDL tools screen",
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
