import type { GuideArticle } from "@/lib/guides/types";

export const quickPanelWorkflowArticle: GuideArticle = {
  slug: "quick-panel-workflow",
  faqs: [
    {
      question: "Does compact mean fewer options?",
      answer:
        "No. The 0.4.1 quick panel trims repeated metadata noise so the download action stays reachable while URL, preset, save location, and start mode remain understandable.",
    },
    {
      question: "Is this only for mouse users?",
      answer:
        "No. Keyboard-friendly repeat downloads are part of the same compact workflow on smaller Windows layouts.",
    },
  ],
  blocks: [
    {
      type: "paragraph",
      text: "Repeat downloads should not force you to rebuild context every time. HalalDL’s quick panel keeps URL, preset, save location, and start mode understandable while leaving the download action close at hand — especially on compact Windows layouts.",
    },
    {
      type: "heading",
      level: 2,
      id: "everyday-loop",
      text: "The everyday loop",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Paste a URL",
        "Confirm or pick the preset (including naming intent)",
        "Confirm save location / start mode at a glance",
        "Start the download without hunting for the primary action",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "compact",
      text: "Compact without becoming opaque",
    },
    {
      type: "paragraph",
      text: "0.4.1 trims repeated metadata so the panel stays scannable. The goal is not to hide decisions — it is to stop secondary detail from pushing the main action away from the thumb path.",
    },
    {
      type: "list",
      items: [
        "Repeated metadata is quieter and easier to scan",
        "The download button stays closer to the thumb path",
        "Keyboard-first quick downloads feel smoother on compact Windows layouts",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "with-presets",
      text: "Pair it with presets",
    },
    {
      type: "paragraph",
      text: "The quick panel is strongest when presets already carry format and filename intent. That is how HalalDL stays guided for everyday jobs without pretending the engine is magic.",
    },
    {
      type: "callout",
      tone: "mint",
      title: "Related polish",
      body: "Finished cards and latest-result spotlight continue the same theme: make the end state clear without permanent visual noise.",
    },
    {
      type: "cta",
      cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    },
  ],
};
