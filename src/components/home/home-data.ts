import {
  Eye,
  FileCheck,
  LaptopMinimal,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Wrench,
} from "lucide-react";

export const trustSignals = [
  { label: "MIT License", icon: FileCheck },
  { label: "No Account", icon: Eye },
  { label: "No Telemetry", icon: ShieldCheck },
  { label: "Windows 10/11 x64", icon: LaptopMinimal },
];

export const workflowSteps = [
  {
    num: "01",
    label: "Preview first",
    title: "See the source and choose only what belongs in the queue.",
    body: "Preview supported links, narrow playlists to the entries you actually want, and keep bulk downloads explicit instead of accidental.",
    detail: "The queue starts with a decision, not a guess.",
  },
  {
    num: "02",
    label: "Choose output",
    title: "Set the format, quality, and helpers for the job.",
    body: "Use practical presets for video, MP3 audio, subtitles, cookies, SponsorBlock, and other controls when the source needs them.",
    detail: "Full manages the common toolchain; Lite keeps that boundary in your hands.",
  },
  {
    num: "03",
    label: "Finish locally",
    title: "Recover, organize, and create from the files you keep.",
    body: "Download Doctor explains common failures, Library and Follows organize completed media, and Clip Maker turns local files into a selected range.",
    detail: "Your queue, history, logs, and media stay on the machine.",
  },
];

export const valueProps = [
  {
    icon: ShieldCheck,
    title: "Local by design",
    body: "No account, no hosted media pipeline, and no telemetry in the core desktop workflow.",
  },
  {
    icon: TerminalSquare,
    title: "Visible engine",
    body: "Raw logs and Download Doctor make failures understandable instead of hiding the tool output.",
  },
  {
    icon: Sparkles,
    title: "Organize what you keep",
    body: "Library folders, editable follows, history, and presets turn one-off downloads into a repeatable local workflow.",
  },
  {
    icon: Wrench,
    title: "Full or Lite",
    body: "Choose the lower-friction Full build or manage more of the yt-dlp, FFmpeg, and aria2 boundary yourself with Lite.",
  },
];
