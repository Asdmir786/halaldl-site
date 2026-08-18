import { CURRENT_RELEASE, type ReleaseProofStory } from "@/content/releases/registry";

export const SITE_LINKS = {
  repoUrl: "https://github.com/Asdmir786/HalalDL",
  latestReleaseUrl: "https://github.com/Asdmir786/HalalDL/releases/latest",
  issuesUrl: "https://github.com/Asdmir786/HalalDL/issues/new/choose",
  supportUrl: "https://github.com/Asdmir786/HalalDL/blob/main/SUPPORT.md",
  alternativeToUrl: "https://alternativeto.net/software/halaldl/about/",
  wingetCommands: {
    full: "winget install --id Asdmir786.HalalDL",
    lite: "winget install --id Asdmir786.HalalDL.Lite",
    portable: "winget install --id Asdmir786.HalalDL.Portable",
  },
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
    question: "What changed in HalalDL 0.6.0?",
    answer:
      "0.6.0 adds preview and individual playlist selection, Download Doctor recovery guidance, Library and editable Follows, Local Clip Maker, stronger tool detection, and clearer queue and clipboard flows.",
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
  {
    question: "Can I choose individual entries from a playlist?",
    answer:
      "Yes. HalalDL 0.6.0 previews supported links and lets you select individual playlist entries before the queue starts, so a larger playlist does not need to become an all-or-nothing download.",
  },
  {
    question: "What does Download Doctor do?",
    answer:
      "Download Doctor explains common failures in plain language and offers safe next steps you can choose before retrying, such as checking cookies, changing format, or reviewing the local tool path.",
  },
  {
    question: "What is Local Clip Maker?",
    answer:
      "Local Clip Maker creates a new clip from completed media already on your machine. You can use chapters to help choose the range while keeping the original file unchanged.",
  },
];

export type FeatureStory = ReleaseProofStory;
export const FEATURE_STORIES: FeatureStory[] = CURRENT_RELEASE.homepage?.productProof ?? [];

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : PRODUCTION_SITE_URL);

  return new URL(configuredUrl);
}
