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
    title: "Drop a copied link into the full app or quick tray flow without rebuilding the routine.",
    body: "The point of the new quick flow is not just speed. It is that the fast path still keeps the URL, preset, and next action understandable instead of turning into a mysterious one-click shortcut.",
    detail: "Clipboard, preset, and launch intent stay readable together.",
  },
  {
    num: "02",
    label: "Reuse the preset",
    title: "Carry subtitle choices and cleaner labels into the moment you actually download.",
    body: "Preset-driven workflow matters more when the preset remembers the parts people redo every day. In 0.4.0 that now includes subtitle behavior, cleaner grouping, and a flow that reads better in both the full window and tray panel.",
    detail: "Preset logic stays reusable instead of becoming repeated setup work.",
  },
  {
    num: "03",
    label: "Follow the signal",
    title: "Updates, notifications, logs, and history should point you straight to what changed.",
    body: "A desktop downloader becomes more trustworthy when the app can surface the right update package, route a notification to the right place, and still leave enough raw output and history behind to explain the result.",
    detail: "Visible output plus guided attention makes the tool auditable.",
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
    title: "Subtitle-aware presets",
    body: "Common video, audio, and subtitle targets become practical instead of repetitive.",
  },
  {
    icon: Wrench,
    title: "Safer update path",
    body: "App-update checks and package verification feel more deliberate in 0.4.0.",
  },
];
