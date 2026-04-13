import { LandingPage } from "@/components/home/landing-page";
import { getGitHubSnapshot } from "@/lib/github";
import { FAQ_ITEMS, getSiteUrl, SITE_LINKS } from "@/lib/site";
import { getSoftwareSourceCodeSchema, serializeJsonLd } from "@/lib/seo";

export default async function Home() {
  const github = await getGitHubSnapshot();
  const siteUrl = getSiteUrl();

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "HalalDL",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Windows 10, Windows 11",
    softwareVersion: github.latestVersion,
    url: siteUrl.origin,
    headline: "Windows-first yt-dlp GUI for local-first downloads",
    description:
      "HalalDL is an open-source Windows desktop GUI for yt-dlp with presets, visible raw logs, Full and Lite installers, and no telemetry.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    isAccessibleForFree: true,
    license: "https://opensource.org/licenses/MIT",
    downloadUrl: SITE_LINKS.latestReleaseUrl,
    installUrl: SITE_LINKS.latestReleaseUrl,
    releaseNotes: github.releaseNotes,
    sameAs: [SITE_LINKS.repoUrl, SITE_LINKS.supportUrl, SITE_LINKS.issuesUrl],
    screenshot: [
      new URL("/releases/0.4.1/promo/hero-light.png", siteUrl).toString(),
      new URL("/releases/0.4.1/promo/preset-filenames-light.png", siteUrl).toString(),
      new URL("/releases/0.4.1/promo/download-details-light.png", siteUrl).toString(),
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(getSoftwareSourceCodeSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      <LandingPage github={github} />
    </>
  );
}
