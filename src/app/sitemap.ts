import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { SITEMAP_ROUTES } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return SITEMAP_ROUTES.map((route) => ({
    ...route,
    url: new URL(route.url, siteUrl).toString(),
  }));
}
