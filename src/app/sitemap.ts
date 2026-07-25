import type { MetadataRoute } from "next";
import { getGuideSitemapEntries } from "@/lib/guides";
import { getSiteUrl } from "@/lib/site";
import { SITEMAP_ROUTES } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return [...SITEMAP_ROUTES, ...getGuideSitemapEntries()].map((route) => ({
    ...route,
    url: new URL(route.url, siteUrl).toString(),
  }));
}
