import type { Metadata } from "next";
import { CURRENT_RELEASE } from "@/content/releases/registry";
import { DownloadPageContent } from "@/components/download/download-page-content";
import { getGitHubSnapshot } from "@/lib/github";
import { getSiteUrl, getSocialImage, SITE_LINKS } from "@/lib/site";
import { getBreadcrumbSchema, serializeJsonLd } from "@/lib/seo";

const releaseHomepage = CURRENT_RELEASE.homepage!;
const DOWNLOAD_META_TITLE = "Download HalalDL for Windows 10/11 — Full, Lite & Portable";
const DOWNLOAD_META_DESCRIPTION =
  "Download HalalDL for Windows 10/11 from official GitHub Releases. Compare Full, Lite, and Portable builds, choose the right setup path, and verify SHA256 before first run.";

export async function generateMetadata(): Promise<Metadata> {
  const github = await getGitHubSnapshot();

  return {
    title: { absolute: DOWNLOAD_META_TITLE },
    description: DOWNLOAD_META_DESCRIPTION,
    alternates: { canonical: "/download" },
    openGraph: {
      title: DOWNLOAD_META_TITLE,
      description: DOWNLOAD_META_DESCRIPTION,
      url: "/download",
      type: "website",
      siteName: "HalalDL",
      images: getSocialImage("HalalDL download page social preview"),
    },
    twitter: {
      card: "summary_large_image",
      title: DOWNLOAD_META_TITLE,
      description: DOWNLOAD_META_DESCRIPTION,
      images: ["/social/halaldl-social-preview.png"],
    },
    other: { "release-version": github.latestVersion },
  };
}

export default async function DownloadPage() {
  const github = await getGitHubSnapshot();
  const siteUrl = getSiteUrl();

  const downloadSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "HalalDL",
    applicationCategory: "Windows media downloader",
    applicationSubCategory: "yt-dlp GUI for Windows",
    operatingSystem: "Windows 10, Windows 11",
    softwareVersion: github.latestVersion,
    description: DOWNLOAD_META_DESCRIPTION,
    downloadUrl: `${siteUrl.origin}/download`,
    installUrl: `${siteUrl.origin}/download`,
    releaseNotes: github.releaseNotes,
    featureList: releaseHomepage.schemaFeatures,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    sameAs: [SITE_LINKS.repoUrl, github.latestReleaseUrl, SITE_LINKS.supportUrl],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which download should most people use?",
        acceptedAnswer: { "@type": "Answer", text: "Most people should use the Full build because it smooths out the first-run setup path." },
      },
      {
        "@type": "Question",
        name: "What is the canonical download source?",
        acceptedAnswer: { "@type": "Answer", text: "GitHub Releases is the direct source for the latest build. WinGet is convenient, but it can lag behind the newest release assets." },
      },
      {
        "@type": "Question",
        name: "How should I verify the installer?",
        acceptedAnswer: { "@type": "Answer", text: "Download from GitHub Releases, open SHA256SUMS.txt from the same release, and verify SHA256 before first run if you want an integrity check." },
      },
    ],
  };

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Download", path: "/download" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(downloadSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
      <DownloadPageContent github={github} />
    </>
  );
}
