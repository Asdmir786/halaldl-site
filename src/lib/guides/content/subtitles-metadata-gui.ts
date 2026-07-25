import type { GuideArticle } from "@/lib/guides/types";

export const subtitlesMetadataGuiArticle: GuideArticle = {
  slug: "subtitles-metadata-gui",
  faqs: [
    {
      question: "Do all sites expose the same subtitle formats?",
      answer:
        "No. Availability depends on the source. When a language track is missing, raw logs and format listings are more honest than a silent empty checkbox.",
    },
    {
      question: "Should subtitles live in presets?",
      answer:
        "If you repeatedly want the same subtitle behavior, yes — presets keep that intent with the rest of the download settings.",
    },
  ],
  blocks: [
    {
      type: "paragraph",
      text: "Subtitles and metadata are classic yt-dlp strengths that people avoid because the flags are dense. A GUI should expose the common cases — preferred languages, embedding vs sidecar files, thumbnails/metadata — without hiding failures.",
    },
    {
      type: "heading",
      level: 2,
      id: "what-people-want",
      text: "What people usually want",
    },
    {
      type: "list",
      items: [
        "Download a readable subtitle track with the video",
        "Keep useful metadata for libraries and search",
        "Avoid relearning flag combinations for every job",
        "Understand when a site simply does not offer the track",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "gui-advantages",
      text: "GUI advantages (when done honestly)",
    },
    {
      type: "list",
      items: [
        "Prefer presets when you repeatedly want the same subtitle behavior",
        "Keep logs visible when a language track is missing",
        "Pair subtitle choices with filename templates for tidy libraries",
        "Avoid assuming every site exposes the same formats",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "when-cli-still-wins",
      text: "When CLI still wins",
    },
    {
      type: "paragraph",
      text: "Exact one-off experiments with unusual subtitle formats, bulk scripting across hundreds of URLs, or custom post-processing pipelines may still be cleaner in yt-dlp CLI. Use the GUI for the everyday path; keep CLI for specialty automation.",
    },
    {
      type: "callout",
      tone: "sky",
      title: "Failure honesty",
      body: "A missing subtitle is not always an app bug. Sites omit tracks. The useful product behavior is to show that clearly instead of failing silently.",
    },
    {
      type: "cta",
      cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    },
  ],
};
