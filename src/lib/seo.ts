import type { MetadataRoute } from "next";
import { CURRENT_RELEASE } from "@/content/releases/registry";
import { DEFAULT_SOCIAL_IMAGE, getSiteUrl, SITE_LINKS } from "@/lib/site";

export const SITE_NAME = "HalalDL";
export const HOMEPAGE_TITLE = "HalalDL — Free yt-dlp GUI for Windows | Download, Organize & Create";
export const HOMEPAGE_OG_TITLE = "HalalDL — Download, Organize & Create locally";
export const HOMEPAGE_TWITTER_TITLE = HOMEPAGE_OG_TITLE;
export const SITE_DESCRIPTION = CURRENT_RELEASE.homepage!.description;
export const HOMEPAGE_OG_DESCRIPTION =
  "A free, local-first yt-dlp GUI for Windows. Preview, select, download, organize, recover, and create from local media—without an account.";
export const HOMEPAGE_TWITTER_DESCRIPTION = HOMEPAGE_OG_DESCRIPTION;
export const SITE_UPDATED_AT = new Date("2026-08-14T00:00:00Z");

export const SITEMAP_ROUTES: MetadataRoute.Sitemap = [
  {
    url: "/",
    lastModified: SITE_UPDATED_AT,
    changeFrequency: "weekly",
    priority: 1,
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  {
    url: "/download",
    lastModified: SITE_UPDATED_AT,
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: "/changelog",
    lastModified: SITE_UPDATED_AT,
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    url: "/install/windows",
    lastModified: SITE_UPDATED_AT,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: "/compare/full-vs-lite",
    lastModified: SITE_UPDATED_AT,
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    url: "/trust/verify-checksum",
    lastModified: SITE_UPDATED_AT,
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
  const websiteId = absoluteUrl("/#website");
  const publisherId = absoluteUrl("/#publisher");

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      name: SITE_NAME,
      url: siteUrl.origin,
      description: SITE_DESCRIPTION,
      inLanguage: "en-US",
      publisher: { "@id": publisherId },
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
    "@id": absoluteUrl("/#source"),
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
