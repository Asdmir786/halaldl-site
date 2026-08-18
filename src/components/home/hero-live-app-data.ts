export const HERO_APP_COLORS = {
  bg: "#080e17",
  sidebar: "#0c1422",
  sidebarActive: "#132030",
  border: "rgba(245,247,251,0.07)",
  borderStrong: "rgba(245,247,251,0.12)",
  ink: "#f5f7fb",
  inkSoft: "#a8bdd4",
  inkMuted: "#5b7fa8",
  mint: "#26e0c6",
  mintDim: "rgba(38,224,198,0.14)",
  mintBorder: "rgba(38,224,198,0.28)",
  card: "#0f1a28",
  cardBorder: "rgba(245,247,251,0.06)",
  input: "#121c2c",
  inputBorder: "rgba(245,247,251,0.1)",
  pill: "#1a2a3a",
  green: "#28c840",
  yellow: "#febc2e",
  red: "#ff5f57",
  progressTrack: "rgba(245,247,251,0.08)",
  progressFill: "linear-gradient(90deg, #26e0c6, #5b7fa8)",
  tagActive: "rgba(38,224,198,0.15)",
  tagQueued: "rgba(212,134,10,0.18)",
  tagDone: "rgba(38,224,198,0.15)",
} as const;

export type HeroDemoStage =
  | "init"
  | "sidebar"
  | "header"
  | "typing"
  | "typed"
  | "previewing"
  | "selecting"
  | "starting"
  | "downloading"
  | "done"
  | "history"
  | "reset";

export type OutputMode = "video" | "audio";

export type HeroDemoCycle = {
  url: string;
  preset: string;
  activeTitle: string;
  queuedTitle: string;
  speed: [number, number];
  outputMode: OutputMode;
  outputSteps: string[];
  previewLabel: string;
  selectionLabel: string;
};

export const HERO_DEMO_CYCLES: HeroDemoCycle[] = [
  {
    url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    preset: "Best Video (Up to 4K)",
    activeTitle: "4K HDR · Never Gonna Give You Up · youtube.com",
    queuedTitle: "Playlist → MP3 · SoundCloud mix · 18 tracks",
    speed: [4.8, 18.2],
    outputMode: "video",
    outputSteps: ["720p", "1080p", "4K"],
    previewLabel: "Single video preview ready",
    selectionLabel: "1 item selected",
  },
  {
    url: "https://instagram.com/p/CxK2mNvIabc/",
    preset: "Instagram Carousel",
    activeTitle: "Instagram carousel · 6 images + video · instagram.com",
    queuedTitle: "Best Video · YouTube playlist · 12 items",
    speed: [2.1, 6.4],
    outputMode: "video",
    outputSteps: ["720p", "1080p", "4K"],
    previewLabel: "Carousel preview ready",
    selectionLabel: "6 media selected",
  },
  {
    url: "https://youtube.com/playlist?list=PLbpi6ZahtOH6Ar_3GPy3workOUT",
    preset: "Audio MP3 (Best)",
    activeTitle: "Playlist · 18 tracks → MP3 · youtube.com",
    queuedTitle: "Subtitles + Video · lecture series · youtube.com",
    speed: [1.4, 4.8],
    outputMode: "audio",
    outputSteps: ["MP3", "M4A", "Best audio"],
    previewLabel: "Playlist preview ready",
    selectionLabel: "3 of 18 selected",
  },
];

export type HeroSidebarItem = {
  id: string;
  icon: string;
  label: string;
  badge?: string;
};

export const HERO_SIDEBAR_ITEMS: HeroSidebarItem[] = [
  { id: "downloads", icon: "↓", label: "Downloads", badge: "4" },
  { id: "presets", icon: "≡", label: "Presets" },
  { id: "tools", icon: "⚙", label: "Tools" },
  { id: "logs", icon: ">_", label: "Logs" },
  { id: "history", icon: "◷", label: "History" },
  { id: "settings", icon: "⚙", label: "Settings" },
];

export const HERO_HISTORY_ITEMS = [
  { title: "4K HDR video · Never Gonna Give You Up ★", meta: "Just now · youtube.com · 1.2 GB · MP4 4K", color: "#26e0c6" },
  { title: "Instagram carousel · 6 images + video", meta: "8m ago · instagram.com · 84.3 MB · Mixed", color: "#5b7fa8" },
  { title: "Playlist → MP3 · 18 tracks complete", meta: "1h ago · youtube.com · 312 MB · MP3", color: "#7fa8c8" },
  { title: "Lecture with sidecar subtitles (.srt)", meta: "3h ago · youtube.com · 156.4 MB · MP4", color: "#a8bdd4" },
] as const;

export const VIDEO_OUTPUTS = ["720p", "1080p", "4K"];
export const AUDIO_OUTPUTS = ["MP3", "M4A", "Best audio"];
