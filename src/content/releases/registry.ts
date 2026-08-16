export type ReleaseAccent = "sky" | "mint" | "coral";

export type ReleaseImage = {
  lightSrc: string;
  darkSrc: string;
  alt: string;
  width?: number;
  height?: number;
};

export type ReleaseProofStory = {
  id: string;
  label: string;
  title: string;
  description: string;
  bullets: string[];
  accent: ReleaseAccent;
  stat: string;
  media: ReleaseImage & { kind: "image" };
};

export type ReleaseChangelogSection = {
  title: string;
  items: string[];
};

export type ReleaseDefinition = {
  tag: `v${number}.${number}.${number}`;
  date: string;
  dateLabel: string;
  title: string;
  releaseUrl: string;
  summary: string;
  changelogMedia?: ReleaseImage;
  changelog?: {
    intro: string;
    sections: ReleaseChangelogSection[];
    beforeYouInstall: string[];
    developerNote: string;
  };
  homepage?: {
    eyebrow: string;
    description: string;
    capabilityChips: string[];
    note: string;
    releaseCardTitle: string;
    releaseCardBody: string;
    schemaFeatures: string[];
    workflow: {
      preview: string;
      selection: string;
      recovery: string;
    };
    productProof: ReleaseProofStory[];
  };
  fallback: {
    repoDescription: string;
    releaseNotes: string;
    assets: {
      fullSetup: string;
      liteSetup: string;
      portableZip: string;
      checksums: string;
    };
  };
};

const REPOSITORY = "https://github.com/Asdmir786/HalalDL";
const releaseAsset = (tag: string, asset: string) => `${REPOSITORY}/releases/download/${tag}/${asset}`;

const v060Fallback = {
  repoDescription:
    "A local-first Windows media downloader powered by yt-dlp, with preview and playlist selection, visible recovery guidance, local organization, and clip workflows.",
  releaseNotes:
    "HalalDL v0.6.0 is the Download, Organize & Create update with playlist control, Download Doctor, Library & Follows, Local Clip Maker, reliability improvements, and clearer local tool detection.",
  assets: {
    fullSetup: releaseAsset("v0.6.0", "HalalDL-Full-v0.6.0-win10%2B11-x64-setup.exe"),
    liteSetup: releaseAsset("v0.6.0", "HalalDL-Lite-v0.6.0-win10%2B11-x64-setup.exe"),
    portableZip: releaseAsset("v0.6.0", "HalalDL-Portable-v0.6.0-win10%2B11-x64.zip"),
    checksums: releaseAsset("v0.6.0", "SHA256SUMS.txt"),
  },
};

const currentRelease: ReleaseDefinition = {
  tag: "v0.6.0",
  date: "2026-08-12T19:33:57Z",
  dateLabel: "Aug 12, 2026",
  title: "Download, Organize & Create",
  releaseUrl: `${REPOSITORY}/releases/tag/v0.6.0`,
  summary:
    "Preview links, select playlist entries, recover with Download Doctor, organize local media, follow chosen sources, and make clips from completed files.",
  changelogMedia: {
    lightSrc: "/releases/0.6.0/hero-light.png",
    darkSrc: "/releases/0.6.0/hero-dark.png",
    alt: "HalalDL 0.6.0 Download, Organize and Create release hero",
  },
  homepage: {
    eyebrow: "v0.6.0 — Download, Organize & Create",
    description:
      "A free, local-first yt-dlp GUI for Windows 10/11. Preview supported links, choose exact playlist entries, recover with Download Doctor, organize local media, and make clips from completed files.",
    capabilityChips: ["Playlist selection", "Download Doctor", "Library & Follows", "Local clips", "Up to 4K*"],
    note: "Maximum quality depends on the source and available formats. Follows run while the app is open or in the tray.",
    releaseCardTitle: "Choose. Organize. Create.",
    releaseCardBody:
      "v0.6.0 adds playlist control, Download Doctor, Library & Follows, and local Clip Maker workflows.",
    schemaFeatures: [
      "Preview supported links and select individual playlist entries",
      "Video quality and audio output presets, subtitles, and local download queues",
      "Download Doctor recovery guidance and visible download logs",
      "Local Library folders, editable source follows, and Clip Maker workflows",
      "No account requirement or hosted media library",
    ],
    workflow: {
      preview: "Preview ready — select the entries that belong in the queue",
      selection: "Link preview, playlist entries, and explicit queue selection before the download starts.",
      recovery: "Recover with Download Doctor, then organize or create from media you keep locally.",
    },
    productProof: [
      {
        id: "playlist-selection",
        label: "Choose exactly",
        title: "Preview the link. Keep the entries you actually want.",
        description:
          "v0.6.0 previews supported links before the queue starts, so a playlist can be narrowed to the individual entries that belong in the download.",
        bullets: [
          "Preview a supported link before committing the job",
          "Select individual playlist entries instead of taking everything",
          "Make queue selection explicit when the source is larger than one file",
        ],
        accent: "mint",
        stat: "Control before the queue",
        media: { kind: "image", lightSrc: "/releases/0.6.0/playlist-light.png", darkSrc: "/releases/0.6.0/playlist-dark.png", alt: "HalalDL v0.6.0 playlist selection interface", width: 1600, height: 900 },
      },
      {
        id: "download-doctor",
        label: "Download Doctor",
        title: "Get a safe next step when a download fails.",
        description:
          "Download Doctor turns common failures into plain language, then offers recovery paths you can choose when you are ready to retry.",
        bullets: ["Read the underlying failure in clearer language", "Try a safe next step such as cookies or an alternate format", "Use aria2 fallback and clearer tool detection when setup needs help"],
        accent: "coral",
        stat: "Recover without guessing",
        media: { kind: "image", lightSrc: "/releases/0.6.0/doctor-light.png", darkSrc: "/releases/0.6.0/doctor-dark.png", alt: "HalalDL v0.6.0 Download Doctor recovery workflow", width: 1600, height: 900 },
      },
      {
        id: "library-follows",
        label: "Library & Follows",
        title: "Give completed media a place to live — and sources to revisit.",
        description:
          "Library folders keep local media organized while editable YouTube follows let you check chosen sources on a schedule that you control.",
        bullets: ["Organize completed media into local Library folders", "Edit the YouTube sources you want to follow", "Use the recommended six-hour interval while the app is open or in the tray"],
        accent: "sky",
        stat: "Local organization, your schedule",
        media: { kind: "image", lightSrc: "/releases/0.6.0/library-light.png", darkSrc: "/releases/0.6.0/library-dark.png", alt: "HalalDL v0.6.0 Library and YouTube follows editor", width: 1600, height: 900 },
      },
      {
        id: "clip-maker",
        label: "Local Clip Maker",
        title: "Turn completed local media into the clip you need.",
        description:
          "Create a new clip from completed video or audio, use chapters to choose a range, and keep the original local file unchanged.",
        bullets: ["Start from media already completed on your machine", "Use chapters to choose a useful range", "Create a new local clip without changing the original"],
        accent: "mint",
        stat: "Create from what you keep",
        media: { kind: "image", lightSrc: "/releases/0.6.0/clips-light.png", darkSrc: "/releases/0.6.0/clips-dark.png", alt: "HalalDL v0.6.0 Local Clip Maker", width: 1600, height: 900 },
      },
      {
        id: "reliability",
        label: "Reliable by design",
        title: "Use the quick panel with fewer avoidable setup surprises.",
        description:
          "v0.6.0 improves the quick panel and clipboard flow while adding package-reliability and dependency updates behind the download experience.",
        bullets: ["Improved quick-panel and clipboard behavior", "A stronger Instagram download engine", "Package-reliability and dependency updates throughout the app"],
        accent: "coral",
        stat: "A calmer everyday workflow",
        media: { kind: "image", lightSrc: "/releases/0.6.0/reliability-light.png", darkSrc: "/releases/0.6.0/reliability-dark.png", alt: "HalalDL v0.6.0 reliability improvements", width: 1600, height: 900 },
      },
    ],
  },
  changelog: {
    intro: "Choose exactly what to download, recover from common failures, organize what you keep, follow sources on your schedule, and create clips from completed media.",
    sections: [
      { title: "Download with more control", items: ["Preview supported links and select individual playlist entries.", "Use cookies, SponsorBlock, the improved Instagram engine, and explicit queue selection when needed."] },
      { title: "Recover without guessing", items: ["Download Doctor explains common failures in plain language and offers safe next steps.", "aria2 fallback and clearer Full/Portable tool detection reduce setup friction."] },
      { title: "Organize and create", items: ["Use Library folders and editable YouTube follows, including the six-hour recommended interval.", "Create clips from completed local media and use chapters to choose a range.", "Square album art is now a per-preset choice."] },
      { title: "Fixes and polish", items: ["Quick panel and clipboard improvements.", "Package reliability and dependency updates."] },
    ],
    beforeYouInstall: [
      "Full is the recommended installer for most Windows users. Lite has fewer bundled tools. Portable is self-contained and updates by replacing its ZIP folder manually.",
      "Installers are currently unsigned; Windows SmartScreen may appear. Verify the asset against SHA256SUMS.txt if you need checksum assurance.",
      "Watchlists run only while the app is open or in the tray. Six hours is recommended, and source-platform availability can vary.",
      "Portable users should extract each update into a fresh folder and move only the data they intend to retain.",
    ],
    developerNote: "HalalDL remains local-first. Screenshot fixtures contain fixed fictional data only; they do not access real queues, cookies, watchlists, or media files.",
  },
  fallback: v060Fallback,
};

const legacyReleases: ReleaseDefinition[] = [
  {
    tag: "v0.5.1",
    date: "2026-07-25T20:07:16Z",
    dateLabel: "Jul 25, 2026",
    title: "The Trust And Feedback Update",
    releaseUrl: `${REPOSITORY}/releases/tag/v0.5.1`,
    summary: "Install Trust, Copy Diagnostics, support prompts, faster tool checks, and the Steel Blue and Mint brand.",
    changelogMedia: { lightSrc: "/releases/0.5.1/promo/hero-light.png", darkSrc: "/releases/0.5.1/promo/hero-dark.png", alt: "HalalDL 0.5.1 Trust And Feedback release hero" },
    fallback: v060Fallback,
  },
  {
    tag: "v0.4.1",
    date: "2026-04-01T00:00:00Z",
    dateLabel: "Apr 1, 2026",
    title: "Precision polish",
    releaseUrl: `${REPOSITORY}/releases/tag/v0.4.1`,
    summary: "Preset filename templates, compact quick panel, settings persistence, and finished-card polish.",
    changelogMedia: { lightSrc: "/releases/0.4.1/promo/hero-light.png", darkSrc: "/releases/0.4.1/promo/hero-dark.png", alt: "HalalDL 0.4.1 precision polish release hero" },
    fallback: v060Fallback,
  },
  {
    tag: "v0.4.0",
    date: "2026-03-01T00:00:00Z",
    dateLabel: "Mar 1, 2026",
    title: "Update flow",
    releaseUrl: `${REPOSITORY}/releases/tag/v0.4.0`,
    summary: "A clearer verified app-update experience.",
    changelogMedia: { lightSrc: "/releases/0.4.0/promo/update-flow.png", darkSrc: "/releases/0.4.0/promo/update-flow-dark.png", alt: "HalalDL 0.4.0 update flow" },
    fallback: v060Fallback,
  },
  {
    tag: "v0.3.9",
    date: "2026-02-01T00:00:00Z",
    dateLabel: "Feb 1, 2026",
    title: "Downloads view",
    releaseUrl: `${REPOSITORY}/releases/tag/v0.3.9`,
    summary: "A polished HalalDL downloads screen.",
    changelogMedia: { lightSrc: "/screenshots/light/halaldl-downloads.png", darkSrc: "/screenshots/halaldl-downloads.png", alt: "HalalDL downloads screen" },
    fallback: v060Fallback,
  },
];

export const RELEASES = [currentRelease, ...legacyReleases];
export const CURRENT_RELEASE = currentRelease;

export function getReleaseByTag(tag: string) {
  return RELEASES.find((release) => release.tag === tag);
}

export function getReleaseAssetUrl(tag: string, assetName: string) {
  return releaseAsset(tag, assetName);
}
