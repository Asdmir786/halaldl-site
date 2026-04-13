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
    label: "Start faster",
    title: "Use the compact quick panel without losing the next action.",
    body: "The 0.4.1 quick panel trims repeated metadata so the download button stays easier to reach on smaller layouts, while the URL, preset, save location, and start mode still remain understandable.",
    detail: "Compact summary, reachable action, and keyboard-friendly repeat downloads.",
  },
  {
    num: "02",
    label: "Name it once",
    title: "Carry filename templates inside the preset instead of repeating them per job.",
    body: "Custom presets can now include their own filename template. HalalDL also keeps extension handling safe when a template leaves out the extension token.",
    detail: "Preset choices cover format, subtitles, and filename intent together.",
  },
  {
    num: "03",
    label: "Trust the finish",
    title: "Saved settings, clearer result cards, and latest-result spotlight make the end state easier to read.",
    body: "Behavior settings now persist as they change. Finished cards can show total output size and duration, and notification-routed results get a finite glow instead of permanent noise.",
    detail: "The app is quieter where it should be and louder only where attention matters.",
  },
];

export const valueProps = [
  {
    icon: Download,
    title: "Tray-friendly quick flow",
    body: "Repeat downloads get faster without collapsing into a black-box shortcut.",
  },
  {
    icon: TerminalSquare,
    title: "Visible raw logs",
    body: "When extractors break, the app still tells you what actually happened.",
  },
  {
    icon: Sparkles,
    title: "Preset filename templates",
    body: "Custom presets can carry naming rules and keep extensions safe automatically.",
  },
  {
    icon: Wrench,
    title: "Settings that persist",
    body: "Tray click behavior and related settings now save as soon as they change.",
  },
];
