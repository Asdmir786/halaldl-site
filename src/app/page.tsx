import { LandingPage } from "@/components/home/landing-page";
import { CURRENT_RELEASE } from "@/content/releases/registry";
import { getGitHubSnapshot } from "@/lib/github";
import { FAQ_ITEMS, getSiteUrl, SITE_LINKS } from "@/lib/site";
import { getSoftwareSourceCodeSchema, serializeJsonLd, SITE_DESCRIPTION } from "@/lib/seo";

export default async function Home() {
  const github = await getGitHubSnapshot();
  const siteUrl = getSiteUrl();
  const releaseHomepage = CURRENT_RELEASE.homepage!;

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": new URL("/#application", siteUrl).toString(),
    name: "HalalDL",
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "yt-dlp GUI for Windows",
    operatingSystem: "Windows 10, Windows 11",
    softwareVersion: github.latestVersion,
    url: siteUrl.origin,
    headline: "Download media without the command line.",
    description: SITE_DESCRIPTION,
    image: new URL("/social/halaldl-social-preview.png", siteUrl).toString(),
    featureList: releaseHomepage.schemaFeatures,
    author: { "@id": new URL("/#publisher", siteUrl).toString() },
    publisher: { "@id": new URL("/#publisher", siteUrl).toString() },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    isAccessibleForFree: true,
    license: "https://opensource.org/licenses/MIT",
    downloadUrl: SITE_LINKS.latestReleaseUrl,
    installUrl: SITE_LINKS.latestReleaseUrl,
    sameAs: [SITE_LINKS.repoUrl, SITE_LINKS.supportUrl, SITE_LINKS.issuesUrl],
    screenshot: releaseHomepage.productProof.map((story) =>
      new URL(story.media.lightSrc, siteUrl).toString(),
    ),
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
