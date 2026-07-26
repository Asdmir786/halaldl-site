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
    label: "Verify trust",
    title: "Know where the installer came from before you run it.",
    body: "The Install Trust card in About explains that official downloads come from GitHub Releases, that releases are still unsigned, and how to verify with SHA256SUMS.txt.",
    detail: "Copy Diagnostics gathers version, mode, tools, and startup timings for clearer bug reports.",
  },
  {
    num: "02",
    label: "Start faster",
    title: "Skip upfront tool probes so the app opens ready to paste a URL.",
    body: "0.5.1 runs managed tool checks on demand instead of probing everything at startup. Settings → Performance shows the timings when you want them.",
    detail: "ASAP URL autofill keeps unique clipboard links ready without fighting the input.",
  },
  {
    num: "03",
    label: "Ask when it matters",
    title: "Gentle Star and Feedback prompts after real usage — not on first launch.",
    body: "After three completed downloads, Settings/About and History can offer Star, Feedback, or Not now. No modal wall, no first-run nag.",
    detail: "The official Steel Blue + Mint brand makes the app look like itself the moment it opens.",
  },
];

export const valueProps = [
  {
    icon: ShieldCheck,
    title: "Install Trust card",
    body: "About explains unsigned releases, GitHub as the source, and checksum verification.",
  },
  {
    icon: TerminalSquare,
    title: "Copy Diagnostics",
    body: "One click copies version, tools, history counts, and startup timings for support.",
  },
  {
    icon: Sparkles,
    title: "Support without nagging",
    body: "Star and Feedback appear after real downloads — dismiss anytime with Not now.",
  },
  {
    icon: Wrench,
    title: "Faster startup",
    body: "On-demand tool checks and Performance timings keep everyday opens snappy.",
  },
];
