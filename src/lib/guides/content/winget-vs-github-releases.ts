import type { GuideArticle } from "@/lib/guides/types";

export const wingetVsGithubReleasesArticle: GuideArticle = {
  slug: "winget-vs-github-releases",
  faqs: [
    {
      question: "Is WinGet unsupported?",
      answer:
        "No. WinGet is a supported convenience path. It is just not always the fastest or most authoritative route to the newest release assets and checksum file.",
    },
    {
      question: "Where should I verify SHA256?",
      answer:
        "From the matching GitHub Release that published the installer and SHA256SUMS.txt together.",
    },
  ],
  blocks: [
    {
      type: "paragraph",
      text: "WinGet is convenient for install and updates. GitHub Releases is still the direct, authoritative path to the newest HalalDL assets and the matching SHA256SUMS.txt. Use both intentionally — do not treat them as identical.",
    },
    {
      type: "heading",
      level: 2,
      id: "what-each-is-for",
      text: "What each path is for",
    },
    {
      type: "table",
      table: {
        headers: ["Need", "Prefer", "Why"],
        rows: [
          ["Newest build today", "GitHub Releases", "Assets publish there first"],
          ["Checksum file next to the asset", "GitHub Releases", "Same release attachment"],
          ["Package-manager convenience", "WinGet", "Familiar install/update flow"],
          ["Scripted fleet installs", "WinGet or MSI", "Then keep a verify process"],
          ["First-time trust check", "GitHub Releases", "Source + sums in one place"],
        ],
      },
    },
    {
      type: "heading",
      level: 2,
      id: "catalog-lag",
      text: "Catalog lag is normal",
    },
    {
      type: "paragraph",
      text: "Package catalogs can trail GitHub. If you care about the latest polish release the day it ships, check Releases first. If you are fine waiting for catalog propagation, WinGet remains a good everyday option.",
    },
    {
      type: "callout",
      tone: "amber",
      title: "Trust tip",
      body: "Whatever path you use to install, treat random mirrors as unsafe. Prefer the project’s GitHub Releases when you need the canonical file and checksum.",
    },
    {
      type: "heading",
      level: 2,
      id: "practical-workflow",
      text: "A practical workflow",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Watch GitHub Releases (or the site changelog) for what changed",
        "If you need the newest build immediately, download from Releases and verify SHA256",
        "If convenience matters more than same-day freshness, WinGet is fine",
        "When something breaks after an update, confirm which version you actually installed",
      ],
    },
    {
      type: "cta",
      cta: { label: "Open download page", href: "/download", eventCta: "go_to_download" },
    },
  ],
};
