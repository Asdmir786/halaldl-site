import type { Metadata } from "next";
import { CURRENT_RELEASE } from "@/content/releases/registry";
import { ChangelogPageContent } from "@/components/changelog/changelog-page-content";
import { getSocialImage } from "@/lib/site";
import { getChangelogEntries } from "@/lib/changelog";
import { getBreadcrumbSchema, serializeJsonLd } from "@/lib/seo";

const CHANGELOG_META_TITLE = "HalalDL changelog — v0.6.1 Privacy and Security Maintenance";
const CHANGELOG_META_DESCRIPTION =
  `Read the complete HalalDL ${CURRENT_RELEASE.tag} release story, including desktop telemetry removal, queue-only deep links, tighter Tauri boundaries, preserved local data, and the full release archive.`;

export const metadata: Metadata = {
  title: { absolute: CHANGELOG_META_TITLE },
  description: CHANGELOG_META_DESCRIPTION,
  alternates: { canonical: "/changelog" },
  openGraph: { title: CHANGELOG_META_TITLE, description: CHANGELOG_META_DESCRIPTION, url: "/changelog", type: "website", siteName: "HalalDL", images: getSocialImage("HalalDL changelog page social preview") },
  twitter: { card: "summary_large_image", title: CHANGELOG_META_TITLE, description: CHANGELOG_META_DESCRIPTION, images: ["/social/halaldl-social-preview.png"] },
};

export default async function ChangelogPage() {
  const [featured, ...entries] = await getChangelogEntries();
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Changelog", path: "/changelog" },
  ]);

  if (!featured) {
    return null;
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
      <ChangelogPageContent featured={featured} entries={entries} />
    </>
  );
}
