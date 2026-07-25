import type { GuideArticle } from "@/lib/guides/types";

export const filenameTemplatesGuiArticle: GuideArticle = {
  slug: "filename-templates-gui",
  faqs: [
    {
      question: "Do I need %(ext)s in every template?",
      answer:
        "It is still good practice, but HalalDL repairs missing extension tokens so files keep a usable suffix when a template leaves the extension out.",
    },
    {
      question: "Are templates only for custom presets?",
      answer:
        "In HalalDL 0.4.1+, custom presets can carry their own filename template so the naming rule travels with the rest of the preset intent.",
    },
  ],
  blocks: [
    {
      type: "paragraph",
      text: "yt-dlp filename templates are one of the most useful — and most intimidating — parts of the engine. In the CLI you pass `-o` (or an output template in a config file) every time you care about naming. In a GUI, that pattern should live next to the rest of the download intent: format, subtitles, save location, and start mode.",
    },
    {
      type: "callout",
      tone: "amber",
      title: "Responsible use",
      body: "Only download and rename media you are allowed to access and save. Templates organize files; they do not change copyright or platform rules.",
    },
    {
      type: "heading",
      level: 2,
      id: "what-templates-are",
      text: "What a filename template actually is",
    },
    {
      type: "paragraph",
      text: "A template is a pattern with tokens like `%(title)s`, `%(uploader)s`, `%(id)s`, and `%(ext)s`. yt-dlp fills those tokens from metadata after it understands the URL. Get the pattern right once and every repeat job stays consistent.",
    },
    {
      type: "list",
      items: [
        "Keep library folders predictable without hand-renaming",
        "Encode show/channel identity in the filename when you want it",
        "Avoid collisions when titles repeat across uploads",
        "Make multi-output jobs (video + sidecars) easier to spot later",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "cli-pain",
      text: "Why CLI templates frustrate everyday Windows users",
    },
    {
      type: "list",
      items: [
        "You retype or re-copy the same `-o` string for common jobs",
        "Shell quoting on Windows PowerShell is easy to get wrong",
        "A typo in `%(ext)s` can leave files without a proper extension",
        "The naming rule is disconnected from the preset/format choice in your head",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "halaldl-presets",
      text: "How HalalDL carries templates inside presets",
    },
    {
      type: "paragraph",
      text: "HalalDL 0.4.1 moves filename templates into custom presets. That means the naming rule travels with the preset instead of living only in your shell history. When you pick the preset for a repeat job, the template comes along.",
    },
    {
      type: "list",
      items: [
        "Custom presets can include their own yt-dlp-style filename template",
        "Missing extension tokens are repaired so files keep a proper suffix",
        "The safer naming path applies to regular downloads and Instagram fallback jobs",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "practical-patterns",
      text: "Practical patterns to start with",
    },
    {
      type: "table",
      caption: "Examples of intent — adapt tokens to your library layout.",
      table: {
        headers: ["Intent", "Example idea", "Why it helps"],
        rows: [
          ["Simple title + ext", "title + extension", "Readable everyday downloads"],
          ["Uploader libraries", "uploader / title", "Sort by channel later"],
          ["ID-stable archives", "id + title", "Survive title edits on the site"],
          ["Date-aware folders", "upload date + title", "Chronological browsing"],
        ],
      },
    },
    {
      type: "callout",
      tone: "mint",
      title: "GUI benefit",
      body: "You still get yt-dlp naming power, but the preset stores the pattern next to format and subtitle intent instead of forcing you back into PowerShell for every repeat download.",
    },
    {
      type: "heading",
      level: 2,
      id: "extension-safety",
      text: "Extension safety matters more than people think",
    },
    {
      type: "paragraph",
      text: "If a template omits `%(ext)s`, some workflows can produce files that are hard to open or associate. HalalDL’s repair path keeps extension handling safe when the template leaves the extension token out — one less footgun versus raw CLI experiments.",
    },
    {
      type: "cta",
      cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    },
  ],
};
