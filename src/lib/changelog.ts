export type ChangelogMedia =
  | {
      type: "image";
      src: string;
      alt: string;
    }
  | {
      type: "video";
      src: string;
      poster?: string;
      alt: string;
    };

export type ChangelogEntry = {
  version: string;
  date: string;
  headline: string;
  summary: string;
  releaseUrl: string;
  featured?: boolean;
  media?: ChangelogMedia;
  added?: string[];
  improved?: string[];
  fixed?: string[];
  notes?: string[];
};

export type ReleaseChecklistGroup = {
  title: string;
  items: string[];
};

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: "v0.3.9",
    date: "March 12, 2026",
    headline: "The Faster Flow Update",
    summary:
      "Polished the install and download flow with better feedback, cleaner setup behavior, and a more dependable first-run experience.",
    releaseUrl: "https://github.com/Asdmir786/HalalDL/releases/tag/v0.3.9",
    featured: true,
    media: {
      type: "image",
      src: "/screenshots/light/halaldl-downloads.png",
      alt: "HalalDL downloads screen",
    },
    improved: [
      "Smoother download flow and clearer progress feedback",
      "Cleaner Full install experience",
      "More explicit UI around release and setup behavior",
    ],
    fixed: [
      "Setup and update rough edges called out in earlier builds",
      "More consistent release packaging and surface polish",
    ],
    notes: [
      "GitHub Releases remains the canonical download source.",
      "WinGet may lag behind the latest GitHub release.",
    ],
  },
];

export const RELEASE_CHECKLIST: ReleaseChecklistGroup[] = [
  {
    title: "Write The Release",
    items: [
      "Draft a one-line release headline that explains what changed in plain language.",
      "Group release notes into Added, Improved, Fixed, and Known Issues if needed.",
      "Link the website entry back to the matching GitHub Release.",
    ],
  },
  {
    title: "Capture Proof",
    items: [
      "Patch release: text only unless the UI visibly changed.",
      "Minor release like 0.4.0: add one polished screenshot if the interface changed.",
      "Workflow-heavy release: add one screenshot and optionally one short WebM or MP4 clip.",
      "Avoid GIFs unless there is no better option; video is cleaner and lighter.",
    ],
  },
  {
    title: "Publish Cleanly",
    items: [
      "Use screenshots by default, not autoplay media.",
      "Keep changelog entries reverse-chronological and concise.",
      "Call out SmartScreen, checksums, or migration notes when they matter.",
      "Do not create bespoke heavy animations per release; keep site motion reusable.",
    ],
  },
];
