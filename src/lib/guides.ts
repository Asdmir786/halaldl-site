import type { MetadataRoute } from "next";
import type { GuideArticle, GuideMeta, GuideTier } from "@/lib/guides/types";
import { absoluteUrl } from "@/lib/seo";
import { bestYtDlpGuiWindowsArticle } from "@/lib/guides/content/best-yt-dlp-gui-windows";
import { ytDlpCliVsGuiArticle } from "@/lib/guides/content/yt-dlp-cli-vs-gui";
import { filenameTemplatesGuiArticle } from "@/lib/guides/content/filename-templates-gui";
import { whyRawLogsMatterArticle } from "@/lib/guides/content/why-raw-logs-matter";
import { ffmpegYtDlpWindowsArticle } from "@/lib/guides/content/ffmpeg-yt-dlp-windows";
import { wingetVsGithubReleasesArticle } from "@/lib/guides/content/winget-vs-github-releases";
import { halaldl041Article } from "@/lib/guides/content/halaldl-0-4-1";
import { halaldl051Article } from "@/lib/guides/content/halaldl-0-5-1";
import { halaldl060Article } from "@/lib/guides/content/halaldl-0-6-0";
import { halaldl061Article } from "@/lib/guides/content/halaldl-0-6-1";
import { portableHalaldlArticle } from "@/lib/guides/content/portable-halaldl";
import { quickPanelWorkflowArticle } from "@/lib/guides/content/quick-panel-workflow";
import { localFirstWindowsDownloaderArticle } from "@/lib/guides/content/local-first-windows-downloader";
import { safeAlternativesArticle } from "@/lib/guides/content/safe-alternatives";
import { playlistGuiWorkflowArticle } from "@/lib/guides/content/playlist-gui-workflow";
import { audioWorkflowArticle } from "@/lib/guides/content/audio-workflow";
import { subtitlesMetadataGuiArticle } from "@/lib/guides/content/subtitles-metadata-gui";
import { troubleshootingWindowsArticle } from "@/lib/guides/content/troubleshooting-windows";
import { windowsFirstPhilosophyArticle } from "@/lib/guides/content/windows-first-philosophy";

export type { GuideArticle, GuideBlock, GuideFaqItem, GuideMeta, GuideTier } from "@/lib/guides/types";

const GUIDE_DATE = "2026-07-25T12:00:00Z";

export const GUIDES: GuideMeta[] = [
  {
    slug: "best-yt-dlp-gui-windows",
    title: "Best yt-dlp GUI for Windows (2026) — honest comparison",
    description:
      "Compare HalalDL, Parabolic, Open Video Downloader, Tartube, Stacher, and yt-dlp itself using dated official sources and honest workflow tradeoffs.",
    primaryKeyword: "yt-dlp GUI Windows",
    tier: 1,
    publishedAt: GUIDE_DATE,
    updatedAt: "2026-09-20T11:03:39Z",
    canonicalPath: "/guides/best-yt-dlp-gui-windows",
    hostedInGuides: true,
    relatedSlugs: ["yt-dlp-cli-vs-gui", "install-halaldl-windows", "full-vs-lite"],
    cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Comparison",
  },
  {
    slug: "yt-dlp-cli-vs-gui",
    title: "yt-dlp CLI vs GUI: when each wins",
    description:
      "An honest look at when the yt-dlp command line is worth it, and when a Windows GUI like HalalDL is the smarter everyday choice.",
    primaryKeyword: "yt-dlp GUI vs command line",
    tier: 1,
    publishedAt: GUIDE_DATE,
    updatedAt: "2026-09-20T11:03:39Z",
    canonicalPath: "/guides/yt-dlp-cli-vs-gui",
    hostedInGuides: true,
    relatedSlugs: ["best-yt-dlp-gui-windows", "why-raw-logs-matter", "install-halaldl-windows"],
    cta: { label: "Try HalalDL", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Decision guide",
  },
  {
    slug: "install-halaldl-windows",
    title: "Download HalalDL for Windows — Install & Verify",
    description:
      "Download and install HalalDL on Windows 10/11 from GitHub Releases. Full, Lite, Portable, MSI, or WinGet — with SHA256 guidance.",
    primaryKeyword: "install HalalDL Windows",
    tier: 1,
    publishedAt: GUIDE_DATE,
    updatedAt: "2026-09-20T11:03:39Z",
    canonicalPath: "/install/windows",
    hostedInGuides: false,
    relatedSlugs: ["best-yt-dlp-gui-windows", "full-vs-lite", "verify-sha256-smartscreen"],
    cta: { label: "Go to download", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Install",
  },
  {
    slug: "verify-sha256-smartscreen",
    title: "Verify SHA256 and handle SmartScreen safely",
    description:
      "Download only from GitHub Releases, verify SHA256 with PowerShell, and handle Windows SmartScreen without skipping trust checks.",
    primaryKeyword: "verify SHA256 Windows installer",
    tier: 1,
    publishedAt: GUIDE_DATE,
    updatedAt: GUIDE_DATE,
    canonicalPath: "/trust/verify-checksum",
    hostedInGuides: false,
    relatedSlugs: ["install-halaldl-windows", "winget-vs-github-releases", "safe-alternatives"],
    cta: { label: "Open download page", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Trust",
  },
  {
    slug: "full-vs-lite",
    title: "HalalDL Full vs Lite explained",
    description:
      "Choose between HalalDL Full and Lite: managed tools versus bring-your-own yt-dlp, ffmpeg, and related tooling.",
    primaryKeyword: "HalalDL Full vs Lite",
    tier: 1,
    publishedAt: GUIDE_DATE,
    updatedAt: "2026-09-20T11:03:39Z",
    canonicalPath: "/compare/full-vs-lite",
    hostedInGuides: false,
    relatedSlugs: ["install-halaldl-windows", "ffmpeg-yt-dlp-windows", "portable-halaldl"],
    cta: { label: "Download a build", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Compare",
  },
  {
    slug: "filename-templates-gui",
    title: "Filename templates in a GUI — yt-dlp naming without flags",
    description:
      "Learn how yt-dlp output templates work, and how HalalDL carries filename patterns inside presets so repeat jobs stay consistent.",
    primaryKeyword: "yt-dlp filename template Windows",
    tier: 2,
    publishedAt: GUIDE_DATE,
    updatedAt: GUIDE_DATE,
    canonicalPath: "/guides/filename-templates-gui",
    hostedInGuides: true,
    relatedSlugs: ["halaldl-0-4-1", "quick-panel-workflow", "best-yt-dlp-gui-windows"],
    cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Presets",
  },
  {
    slug: "why-raw-logs-matter",
    title: "Why raw logs matter when extractors break",
    description:
      "Site rules and extractors change. Visible yt-dlp output makes failures understandable — and that should stay part of any serious GUI.",
    primaryKeyword: "yt-dlp GUI raw logs",
    tier: 2,
    publishedAt: GUIDE_DATE,
    updatedAt: "2026-09-20T11:03:39Z",
    canonicalPath: "/guides/why-raw-logs-matter",
    hostedInGuides: true,
    relatedSlugs: ["yt-dlp-cli-vs-gui", "troubleshooting-windows", "halaldl-0-5-1"],
    cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Trust",
  },
  {
    slug: "ffmpeg-yt-dlp-windows",
    title: "FFmpeg + yt-dlp on Windows without PATH hell",
    description:
      "Why FFmpeg matters for merges and audio, how PATH setups fail, and how HalalDL Full reduces first-run toolchain friction.",
    primaryKeyword: "ffmpeg yt-dlp Windows setup",
    tier: 2,
    publishedAt: GUIDE_DATE,
    updatedAt: GUIDE_DATE,
    canonicalPath: "/guides/ffmpeg-yt-dlp-windows",
    hostedInGuides: true,
    relatedSlugs: ["full-vs-lite", "install-halaldl-windows", "troubleshooting-windows"],
    cta: { label: "Download Full", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Setup",
  },
  {
    slug: "winget-vs-github-releases",
    title: "WinGet vs GitHub Releases for HalalDL",
    description:
      "WinGet is convenient. GitHub Releases is still the direct route to the newest HalalDL build and checksums.",
    primaryKeyword: "HalalDL winget",
    tier: 2,
    publishedAt: GUIDE_DATE,
    updatedAt: GUIDE_DATE,
    canonicalPath: "/guides/winget-vs-github-releases",
    hostedInGuides: true,
    relatedSlugs: ["install-halaldl-windows", "verify-sha256-smartscreen", "halaldl-0-5-1"],
    cta: { label: "Open download page", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Releases",
  },
  {
    slug: "halaldl-0-5-1",
    title: "What changed in HalalDL 0.5.1 (and why)",
    description:
      "A deeper look at HalalDL 0.5.1: Install Trust, Copy Diagnostics, support prompts after real usage, faster startup, and Steel Blue + Mint brand.",
    primaryKeyword: "HalalDL 0.5.1",
    tier: 2,
    publishedAt: GUIDE_DATE,
    updatedAt: GUIDE_DATE,
    canonicalPath: "/guides/halaldl-0-5-1",
    hostedInGuides: true,
    relatedSlugs: ["verify-sha256-smartscreen", "why-raw-logs-matter", "halaldl-0-4-1"],
    cta: { label: "Download latest", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Release notes",
  },
  {
    slug: "halaldl-0-6-1",
    title: "HalalDL 0.6.1 — Privacy and Security Maintenance",
    description:
      "What changed in HalalDL 0.6.1: desktop telemetry removal, safer queue-only deep links, tighter Tauri boundaries, and preserved local data.",
    primaryKeyword: "HalalDL 0.6.1",
    tier: 1,
    publishedAt: "2026-09-20T11:03:39Z",
    updatedAt: "2026-09-20T11:03:39Z",
    canonicalPath: "/guides/halaldl-0-6-1",
    hostedInGuides: true,
    relatedSlugs: ["best-yt-dlp-gui-windows", "install-halaldl-windows", "why-raw-logs-matter"],
    cta: { label: "Download HalalDL v0.6.1", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Release notes",
  },
  {
    slug: "halaldl-0-6-0",
    title: "What changed in HalalDL 0.6.0 — Download, Organize & Create",
    description:
      "A practical guide to HalalDL 0.6.0: playlist selection, Download Doctor, Library & Follows, Local Clip Maker, reliability changes, and update notes.",
    primaryKeyword: "HalalDL 0.6.0",
    tier: 1,
    publishedAt: "2026-08-12T19:33:57Z",
    updatedAt: "2026-08-14T00:00:00Z",
    canonicalPath: "/guides/halaldl-0-6-0",
    hostedInGuides: true,
    relatedSlugs: ["playlist-gui-workflow", "troubleshooting-windows", "halaldl-0-5-1"],
    cta: { label: "Download HalalDL v0.6.0", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Release notes",
  },
  {
    slug: "halaldl-0-4-1",
    title: "What changed in HalalDL 0.4.1 (and why)",
    description:
      "A deeper look at HalalDL 0.4.1: preset filename templates, compact quick panel, settings persistence, finished cards, and latest-result spotlight.",
    primaryKeyword: "HalalDL 0.4.1",
    tier: 2,
    publishedAt: GUIDE_DATE,
    updatedAt: GUIDE_DATE,
    canonicalPath: "/guides/halaldl-0-4-1",
    hostedInGuides: true,
    relatedSlugs: ["halaldl-0-5-1", "filename-templates-gui", "quick-panel-workflow"],
    cta: { label: "Download latest", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Release notes",
  },
  {
    slug: "portable-halaldl",
    title: "Portable HalalDL: a no-install Windows workflow",
    description:
      "Use the Portable ZIP when you want HalalDL, settings, and managed tools kept together without a traditional installer.",
    primaryKeyword: "portable yt-dlp GUI Windows",
    tier: 2,
    publishedAt: GUIDE_DATE,
    updatedAt: GUIDE_DATE,
    canonicalPath: "/guides/portable-halaldl",
    hostedInGuides: true,
    relatedSlugs: ["install-halaldl-windows", "full-vs-lite", "verify-sha256-smartscreen"],
    cta: { label: "See download options", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Portable",
  },
  {
    slug: "quick-panel-workflow",
    title: "Tray and quick panel workflow for repeat downloads",
    description:
      "How HalalDL’s compact quick panel keeps URL, preset, save location, and the download action reachable on everyday Windows layouts.",
    primaryKeyword: "quick download yt-dlp GUI",
    tier: 2,
    publishedAt: GUIDE_DATE,
    updatedAt: GUIDE_DATE,
    canonicalPath: "/guides/quick-panel-workflow",
    hostedInGuides: true,
    relatedSlugs: ["halaldl-0-4-1", "filename-templates-gui", "yt-dlp-cli-vs-gui"],
    cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Workflow",
  },
  {
    slug: "local-first-windows-downloader",
    title: "Local-first Windows media downloader: what “good” looks like",
    description:
      "Criteria for evaluating Windows media downloaders: local operation, open source, checksums, no account wall, and honest yt-dlp foundations.",
    primaryKeyword: "Windows media downloader",
    tier: 3,
    publishedAt: GUIDE_DATE,
    updatedAt: GUIDE_DATE,
    canonicalPath: "/guides/local-first-windows-downloader",
    hostedInGuides: true,
    relatedSlugs: ["best-yt-dlp-gui-windows", "safe-alternatives", "verify-sha256-smartscreen"],
    cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Criteria",
  },
  {
    slug: "safe-alternatives",
    title: "Safe alternatives to sketchy YouTube download sites",
    description:
      "Prefer open-source, local tools with public releases and checksums over random “free MP4” websites.",
    primaryKeyword: "safe YouTube downloader Windows",
    tier: 3,
    publishedAt: GUIDE_DATE,
    updatedAt: "2026-09-20T11:03:39Z",
    canonicalPath: "/guides/safe-alternatives",
    hostedInGuides: true,
    relatedSlugs: ["verify-sha256-smartscreen", "best-yt-dlp-gui-windows", "local-first-windows-downloader"],
    cta: { label: "Download from GitHub path", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Safety",
  },
  {
    slug: "playlist-gui-workflow",
    title: "Download playlists and channels on Windows with a GUI",
    description:
      "How playlist and channel downloads work with yt-dlp-powered GUIs, and what to watch for on Windows.",
    primaryKeyword: "yt-dlp playlist GUI Windows",
    tier: 3,
    publishedAt: GUIDE_DATE,
    updatedAt: "2026-09-20T11:03:39Z",
    canonicalPath: "/guides/playlist-gui-workflow",
    hostedInGuides: true,
    relatedSlugs: ["filename-templates-gui", "quick-panel-workflow", "yt-dlp-cli-vs-gui"],
    cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Workflow",
  },
  {
    slug: "audio-workflow",
    title: "Audio-only downloads with yt-dlp on Windows",
    description:
      "Extract audio through yt-dlp on Windows — when FFmpeg matters, how presets help, and how a GUI keeps the path clear.",
    primaryKeyword: "yt-dlp audio download Windows GUI",
    tier: 3,
    publishedAt: GUIDE_DATE,
    updatedAt: GUIDE_DATE,
    canonicalPath: "/guides/audio-workflow",
    hostedInGuides: true,
    relatedSlugs: ["ffmpeg-yt-dlp-windows", "filename-templates-gui", "best-yt-dlp-gui-windows"],
    cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Audio",
  },
  {
    slug: "subtitles-metadata-gui",
    title: "Subtitles and metadata without the terminal",
    description:
      "Pull subtitles and keep useful metadata with a yt-dlp GUI instead of memorizing flags.",
    primaryKeyword: "yt-dlp subtitles GUI",
    tier: 3,
    publishedAt: GUIDE_DATE,
    updatedAt: GUIDE_DATE,
    canonicalPath: "/guides/subtitles-metadata-gui",
    hostedInGuides: true,
    relatedSlugs: ["filename-templates-gui", "playlist-gui-workflow", "why-raw-logs-matter"],
    cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Subtitles",
  },
  {
    slug: "troubleshooting-windows",
    title: "Troubleshooting common yt-dlp Windows errors",
    description:
      "Update extractors, check FFmpeg, read raw logs, and fix the Windows issues that show up most often with yt-dlp GUIs.",
    primaryKeyword: "yt-dlp Windows errors",
    tier: 3,
    publishedAt: GUIDE_DATE,
    updatedAt: "2026-09-20T11:03:39Z",
    canonicalPath: "/guides/troubleshooting-windows",
    hostedInGuides: true,
    relatedSlugs: ["why-raw-logs-matter", "ffmpeg-yt-dlp-windows", "verify-sha256-smartscreen"],
    cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Support",
  },
  {
    slug: "windows-first-philosophy",
    title: "Windows-first, local-first: how HalalDL is positioned",
    description:
      "Why HalalDL stays Windows-first, account-free, MIT licensed, and explicit about yt-dlp under the hood.",
    primaryKeyword: "HalalDL Windows-first",
    tier: 3,
    publishedAt: GUIDE_DATE,
    updatedAt: GUIDE_DATE,
    canonicalPath: "/guides/windows-first-philosophy",
    hostedInGuides: true,
    relatedSlugs: ["local-first-windows-downloader", "safe-alternatives", "yt-dlp-cli-vs-gui"],
    cta: { label: "Download HalalDL", href: "/download", eventCta: "go_to_download" },
    eyebrow: "Philosophy",
  },
];

const ARTICLES: Record<string, GuideArticle> = {
  "best-yt-dlp-gui-windows": bestYtDlpGuiWindowsArticle,
  "yt-dlp-cli-vs-gui": ytDlpCliVsGuiArticle,
  "filename-templates-gui": filenameTemplatesGuiArticle,
  "why-raw-logs-matter": whyRawLogsMatterArticle,
  "ffmpeg-yt-dlp-windows": ffmpegYtDlpWindowsArticle,
  "winget-vs-github-releases": wingetVsGithubReleasesArticle,
  "halaldl-0-5-1": halaldl051Article,
  "halaldl-0-6-0": halaldl060Article,
  "halaldl-0-6-1": halaldl061Article,
  "halaldl-0-4-1": halaldl041Article,
  "portable-halaldl": portableHalaldlArticle,
  "quick-panel-workflow": quickPanelWorkflowArticle,
  "local-first-windows-downloader": localFirstWindowsDownloaderArticle,
  "safe-alternatives": safeAlternativesArticle,
  "playlist-gui-workflow": playlistGuiWorkflowArticle,
  "audio-workflow": audioWorkflowArticle,
  "subtitles-metadata-gui": subtitlesMetadataGuiArticle,
  "troubleshooting-windows": troubleshootingWindowsArticle,
  "windows-first-philosophy": windowsFirstPhilosophyArticle,
};

export function getGuideBySlug(slug: string) {
  return GUIDES.find((guide) => guide.slug === slug) ?? null;
}

export function getGuidesByTier(tier: GuideTier) {
  return GUIDES.filter((guide) => guide.tier === tier);
}

export function getHostedGuideSlugs() {
  return GUIDES.filter((guide) => guide.hostedInGuides).map((guide) => guide.slug);
}

export function getGuideArticle(slug: string) {
  return ARTICLES[slug] ?? null;
}

export function getRelatedGuides(slug: string) {
  const guide = getGuideBySlug(slug);
  if (!guide) return [];
  return guide.relatedSlugs
    .map((relatedSlug) => getGuideBySlug(relatedSlug))
    .filter((item): item is GuideMeta => Boolean(item));
}

export function getGuideSitemapEntries(): MetadataRoute.Sitemap {
  const hub: MetadataRoute.Sitemap[number] = {
    url: "/guides",
    lastModified: new Date(GUIDE_DATE),
    changeFrequency: "weekly",
    priority: 0.85,
  };

  const hosted = GUIDES.filter((guide) => guide.hostedInGuides).map((guide) => ({
    url: guide.canonicalPath,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: "monthly" as const,
    priority: guide.tier === 1 ? 0.8 : guide.tier === 2 ? 0.7 : 0.6,
  }));

  return [hub, ...hosted];
}

export function getArticleSchema(guide: GuideMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    mainEntityOfPage: absoluteUrl(guide.canonicalPath),
    author: {
      "@type": "Organization",
      name: "HalalDL",
    },
    publisher: {
      "@type": "Organization",
      name: "HalalDL",
    },
  };
}

export function getGuideFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
