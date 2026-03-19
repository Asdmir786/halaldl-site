import {
  Download,
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
    label: "Start clean",
    title: "Paste the link and choose a preset without hunting for flags.",
    body: "Input, preset choice, and queue controls sit on one authored surface. It should feel like a desktop tool that already understands the next question you would ask in the terminal.",
    detail: "URL, preset, and action state stay visible together.",
  },
  {
    num: "02",
    label: "Control the queue",
    title: "Start now or queue it deliberately instead of guessing the app state.",
    body: "The important difference is not just that a queue exists. It is that active, waiting, and completed work read clearly enough that you can scan the window and trust what happens next.",
    detail: "Queueing stays explicit, not hidden behind shell output.",
  },
  {
    num: "03",
    label: "Inspect what happened",
    title: "Logs and history stay available when something succeeds or fails.",
    body: "Completed runs, raw output, and repeatable settings make the app usable over time. You should not need to reconstruct a session from memory after the terminal closes.",
    detail: "Visible output and archived history make the tool auditable.",
  },
];

export const valueProps = [
  {
    icon: Download,
    title: "Cleaner GUI over yt-dlp",
    body: "Less repeated flag work, without pretending the engine disappeared.",
  },
  {
    icon: TerminalSquare,
    title: "Visible raw logs",
    body: "When extractors break, the app still tells you what actually happened.",
  },
  {
    icon: Sparkles,
    title: "Preset-driven workflow",
    body: "Common video and audio targets become practical, not repetitive.",
  },
  {
    icon: Wrench,
    title: "Full vs Lite is explicit",
    body: "Tooling tradeoffs stay visible instead of being buried in install docs.",
  },
];
