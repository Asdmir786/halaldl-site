import type { GuideArticle } from "@/lib/guides/types";

export const playlistGuiWorkflowArticle: GuideArticle = {
  slug: "playlist-gui-workflow",
  faqs: [
    {
      question: "Should I use a GUI for huge unattended playlists?",
      answer:
        "For very large unattended batches, yt-dlp CLI batch mode is often stronger. Use a GUI when you want interactive selection and clearer per-item visibility.",
    },
    {
      question: "What breaks most often on playlists?",
      answer:
        "Individual items failing while others succeed, naming collisions, and extractor changes on long-running lists. Raw logs help isolate the failing entry.",
    },
  ],
  blocks: [
    {
      type: "paragraph",
      text: "Playlists and channels are where yt-dlp shines — and where a GUI has to stay honest about progress, failures, and naming. The job is not only “start many downloads”; it is keeping the run understandable when one item fails.",
    },
    {
      type: "callout",
      tone: "amber",
      title: "Rights first",
      body: "Only download playlist or channel media you are allowed to access and save. Bulk capability is not permission.",
    },
    {
      type: "heading",
      level: 2,
      id: "before-you-start",
      text: "Before you start a playlist job",
    },
    {
      type: "list",
      items: [
        "Confirm you are allowed to download the content",
        "Pick a preset so naming stays consistent across many files",
        "Decide whether you need the whole list or a subset",
        "Make sure disk space and save location are intentional",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "gui-vs-cli",
      text: "GUI vs CLI for playlists",
    },
    {
      type: "table",
      table: {
        headers: ["Job", "Prefer GUI", "Prefer CLI"],
        rows: [
          ["Interactive pick-and-download", "Yes", "Possible but slower"],
          ["Hundreds of URLs overnight", "Awkward", "Native strength"],
          ["Diagnosing one failed item", "With raw logs", "Verbose flags"],
          ["Shared Windows desktop use", "Better", "Poor fit"],
        ],
      },
    },
    {
      type: "heading",
      level: 2,
      id: "naming",
      text: "Naming and presets matter more at scale",
    },
    {
      type: "paragraph",
      text: "A bad template is annoying on one file and painful on two hundred. Carry filename templates inside presets so playlist runs stay library-friendly without retyping `-o` strings.",
    },
    {
      type: "heading",
      level: 2,
      id: "failures",
      text: "Expect partial failures",
    },
    {
      type: "paragraph",
      text: "Long playlists almost always include at least one awkward item. Watch raw logs when a single entry fails, update the engine when extractors change, and avoid treating one failure as a total run failure unless you need that policy.",
    },
    {
      type: "cta",
      cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    },
  ],
};
