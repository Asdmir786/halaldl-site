import type { MetadataRoute } from "next";
import { DEFAULT_SOCIAL_IMAGE, getSiteUrl, SITE_LINKS } from "@/lib/site";

export const SITE_NAME = "HalalDL";
export const HOMEPAGE_TITLE = "HalalDL — Free yt-dlp GUI for Windows (local-first)";
export const HOMEPAGE_OG_TITLE = "HalalDL — Free yt-dlp GUI for Windows";
export const HOMEPAGE_TWITTER_TITLE = "HalalDL — Free yt-dlp GUI for Windows";
export const SITE_DESCRIPTION =
  "Free open-source yt-dlp GUI for Windows 10/11. Local-first, no account, with presets, visible logs, and optional tool management.";
export const HOMEPAGE_OG_DESCRIPTION =
  "A free, local-first yt-dlp GUI for Windows — presets, visible logs, and optional tool management. No account required.";
export const HOMEPAGE_TWITTER_DESCRIPTION =
  "Free open-source yt-dlp GUI for Windows. Local-first, no account, presets and visible logs.";

export const SITEMAP_ROUTES: MetadataRoute.Sitemap = [
  {
    url: "/",
    lastModified: new Date("2026-04-12T14:31:16Z"),
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: "/download",
    lastModified: new Date("2026-04-12T14:31:16Z"),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: "/changelog",
    lastModified: new Date("2026-04-12T14:31:16Z"),
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    url: "/install/windows",
    lastModified: new Date("2026-04-12T14:31:16Z"),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: "/compare/full-vs-lite",
    lastModified: new Date("2026-04-12T14:31:16Z"),
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    url: "/trust/verify-checksum",
    lastModified: new Date("2026-04-12T14:31:16Z"),
    changeFrequency: "monthly",
    priority: 0.75,
  },
];

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function getBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function getSiteStructuredData() {
  const siteUrl = getSiteUrl();
  const publisherId = absoluteUrl("/#publisher");

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      name: SITE_NAME,
      url: siteUrl.origin,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: {
        "@id": publisherId,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": publisherId,
      name: SITE_NAME,
      url: siteUrl.origin,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/brand/icon.png"),
        width: 512,
        height: 512,
      },
      image: absoluteUrl("/brand/icon.png"),
      sameAs: [SITE_LINKS.repoUrl],
    },
  ];
}

export function getSoftwareSourceCodeSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: SITE_NAME,
    codeRepository: SITE_LINKS.repoUrl,
    license: "https://opensource.org/licenses/MIT",
    url: absoluteUrl("/"),
    sameAs: [SITE_LINKS.repoUrl, SITE_LINKS.supportUrl, SITE_LINKS.issuesUrl],
  };
}

export function getAbsoluteSocialImage(alt: string) {
  return [
    {
      url: absoluteUrl(DEFAULT_SOCIAL_IMAGE),
      width: 1280,
      height: 640,
      alt,
    },
  ];
}
