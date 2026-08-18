import type { GuideArticle } from "@/lib/guides/types";

export const halaldl060Article: GuideArticle = {
  slug: "halaldl-0-6-0",
  faqs: [
    {
      question: "What is the main change in HalalDL 0.6.0?",
      answer:
        "0.6.0 expands HalalDL from a download workflow into a Download, Organize & Create workflow: preview and select sources, recover from common failures, organize local media, follow chosen sources, and create clips from completed files.",
    },
    {
      question: "Can I select only some videos from a playlist?",
      answer:
        "Yes. The release adds supported-link preview and individual playlist-entry selection so you can narrow a playlist before the queue begins.",
    },
    {
      question: "Does Download Doctor upload my links or files?",
      answer:
        "No. The release notes describe Download Doctor as local, plain-language recovery guidance for common failures. It explains the failure and offers next steps such as cookies or an alternate format.",
    },
    {
      question: "How do Follows work in 0.6.0?",
      answer:
        "Follows let you revisit chosen YouTube sources on your own schedule. The app must be open or available in the tray, and the release notes recommend a six-hour interval.",
    },
  ],
  blocks: [
    {
      type: "paragraph",
      text: "HalalDL 0.6.0 is the Download, Organize & Create update. It gives you more control before a queue starts, clearer recovery when a source or tool causes trouble, and more ways to keep or reuse the media that is already on your machine.",
    },
    {
      type: "heading",
      level: 2,
      id: "choose-exact-downloads",
      text: "Choose exact downloads before the queue starts",
    },
    {
      type: "paragraph",
      text: "Supported links can now be previewed before you commit the job. For playlists, that means you can select the individual entries you actually want instead of treating every source as an all-or-nothing batch. The release also brings explicit queue selection, cookies, SponsorBlock controls, and an improved Instagram engine into the download path.",
    },
    {
      type: "heading",
      level: 2,
      id: "recover-without-guessing",
      text: "Recover without guessing",
    },
    {
      type: "paragraph",
      text: "Download Doctor translates common failures into plain language and gives you safe recovery choices. When a retry needs a different tool path, 0.6.0 also adds aria2 fallback and clearer Full and Portable tool detection, so setup friction is easier to understand before you keep trying the same failed command.",
    },
    {
      type: "heading",
      level: 2,
      id: "organize-and-create-locally",
      text: "Organize and create locally",
    },
    {
      type: "table",
      table: {
        headers: ["Capability", "What it does", "Why it helps"],
        rows: [
          ["Library folders", "Keep completed media in local folders you control.", "Makes finished work easier to revisit without a hosted media library."],
          ["YouTube Follows", "Edit sources and revisit them on a schedule.", "Keeps recurring sources reachable while the app is open or in the tray."],
          ["Local Clip Maker", "Create a clip from completed video or audio.", "Lets you make a useful excerpt without changing the original file."],
          ["Chapter ranges", "Use chapters to choose the clip range.", "Makes range selection more deliberate than manually guessing timestamps."],
          ["Per-preset album art", "Choose square album art as part of a preset.", "Keeps repeat audio workflows consistent."],
        ],
      },
    },
    {
      type: "heading",
      level: 2,
      id: "before-you-update",
      text: "Before you update",
    },
    {
      type: "list",
      items: [
        "Full remains the recommended installer for most Windows users; Lite has fewer bundled tools, while Portable is self-contained and updated by replacing its ZIP folder manually.",
        "Installers are currently unsigned, so Windows SmartScreen may appear. Download from GitHub Releases and compare the release asset with SHA256SUMS.txt when you want an integrity check.",
        "Follows run only while HalalDL is open or available in the tray. The release notes recommend a six-hour interval, and source-platform availability can vary.",
        "Portable updates should be extracted into a fresh folder; then move only the data you intend to keep.",
      ],
    },
    {
      type: "callout",
      tone: "mint",
      title: "Read the source release notes",
      body: "The website summarizes the v0.6.0 workflows in plain language. Use the official GitHub release whenever you need exact assets, raw notes, or the full comparison against v0.5.1.",
    },
    {
      type: "cta",
      cta: { label: "Download HalalDL v0.6.0", href: "/download", eventCta: "go_to_download" },
    },
  ],
};
