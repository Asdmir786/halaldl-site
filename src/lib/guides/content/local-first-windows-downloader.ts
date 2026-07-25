import type { GuideArticle } from "@/lib/guides/types";

export const localFirstWindowsDownloaderArticle: GuideArticle = {
  slug: "local-first-windows-downloader",
  faqs: [
    {
      question: "Is “local-first” just marketing?",
      answer:
        "It should mean concrete properties: runs on your PC, no forced account, clear data boundaries, and preferably open source with public releases you can verify.",
    },
    {
      question: "Where does yt-dlp fit?",
      answer:
        "Most serious open-source Windows downloaders are frontends to yt-dlp. Honesty about that engine is a quality signal, not a weakness.",
    },
  ],
  blocks: [
    {
      type: "paragraph",
      text: "“Windows media downloader” search results are noisy. A useful filter is local-first: the app runs on your PC, does not require an account, and is honest about the engine underneath — usually yt-dlp.",
    },
    {
      type: "heading",
      level: 2,
      id: "criteria",
      text: "What “good” looks like",
    },
    {
      type: "list",
      items: [
        "Runs locally — no forced cloud account",
        "Open source with a real license (MIT, GPL, etc.)",
        "Public releases you can checksum",
        "Clear Windows support matrix (10/11, x64, etc.)",
        "Honest about yt-dlp (or whatever engine) instead of pretending magic",
        "No telemetry bait-and-switch in the product story",
        "Visible failure details when extractors break",
      ],
    },
    {
      type: "heading",
      level: 2,
      id: "red-flags",
      text: "Red flags in the broader market",
    },
    {
      type: "list",
      items: [
        "Random “free MP4 online” websites",
        "Unsigned mystery EXEs from SEO spam blogs",
        "Browser extensions with odd permissions",
        "No source, no license, no release history",
      ],
    },
    {
      type: "table",
      table: {
        headers: ["Question", "Strong answer", "Weak answer"],
        rows: [
          ["Where do I download?", "GitHub Releases", "Random mirror"],
          ["Can I verify the file?", "SHA256 published", "Trust us"],
          ["What is the engine?", "yt-dlp (named)", "Secret sauce"],
          ["Do I need an account?", "No", "Sign up to download"],
          ["Where does data live?", "Local machine", "Unclear cloud"],
        ],
      },
    },
    {
      type: "heading",
      level: 2,
      id: "halaldl",
      text: "How HalalDL maps to the criteria",
    },
    {
      type: "paragraph",
      text: "HalalDL is a Windows-first GUI for yt-dlp: local, account-free, MIT licensed, with Full/Lite/Portable paths and a public checksum story. Use the criteria above even if you pick a different tool.",
    },
    {
      type: "cta",
      cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    },
  ],
};
