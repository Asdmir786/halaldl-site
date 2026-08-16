import type { Metadata } from "next";
import { GuidesHubContent } from "@/components/guides/guides-hub-content";
import { getGuidesByTier, getGuideBySlug } from "@/lib/guides";
import { getSocialImage } from "@/lib/site";
import { absoluteUrl, getBreadcrumbSchema, serializeJsonLd } from "@/lib/seo";

const META_TITLE = "Windows yt-dlp GUI Guides — Install, Playlists, FFmpeg & SHA256 | HalalDL";
const META_DESCRIPTION =
  "Practical Windows guides for choosing a yt-dlp GUI, installing HalalDL, downloading playlists, configuring FFmpeg, verifying SHA256, recovering errors, and working with local media.";

export const metadata: Metadata = {
  title: { absolute: META_TITLE },
  description: META_DESCRIPTION,
  alternates: { canonical: "/guides" },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: "/guides", type: "website", siteName: "HalalDL", images: getSocialImage("HalalDL guides hub social preview") },
  twitter: { card: "summary_large_image", title: META_TITLE, description: META_DESCRIPTION, images: ["/social/halaldl-social-preview.png"] },
};

export default function GuidesHubPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
  ]);
  const guideItems = [...getGuidesByTier(1), ...getGuidesByTier(2), ...getGuidesByTier(3)];
  const guideCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: META_TITLE,
    description: META_DESCRIPTION,
    url: absoluteUrl("/guides"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: guideItems.map((guide, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: guide.title,
        url: absoluteUrl(guide.canonicalPath),
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(guideCollectionSchema) }} />
      <GuidesHubContent
        tier1={getGuidesByTier(1)}
        tier2={getGuidesByTier(2)}
        tier3={getGuidesByTier(3)}
        currentReleaseGuide={getGuideBySlug("halaldl-0-6-0") ?? undefined}
      />
    </>
  );
}
