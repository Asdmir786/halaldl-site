import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/home/home-header";
import { SubpageRouteStrip } from "@/components/site/subpage-route-strip";
import { GuideIndexCard } from "@/components/guides/guide-index-card";
import { MarketingShell } from "@/components/site/marketing-shell";
import { getGuidesByTier } from "@/lib/guides";
import { getSocialImage } from "@/lib/site";
import { getBreadcrumbSchema, serializeJsonLd } from "@/lib/seo";

const META_TITLE = "HalalDL guides — yt-dlp GUI for Windows";
const META_DESCRIPTION =
  "Practical guides for choosing a yt-dlp GUI on Windows, installing HalalDL, verifying checksums, and using presets, logs, and portable workflows.";

export const metadata: Metadata = {
  title: { absolute: META_TITLE },
  description: META_DESCRIPTION,
  alternates: { canonical: "/guides" },
  openGraph: {
    title: META_TITLE,
    description: META_DESCRIPTION,
    url: "/guides",
    type: "website",
    siteName: "HalalDL",
    images: getSocialImage("HalalDL guides hub social preview"),
  },
  twitter: {
    card: "summary_large_image",
    title: META_TITLE,
    description: META_DESCRIPTION,
    images: ["/social/halaldl-social-preview.png"],
  },
};

export default function GuidesHubPage() {
  const tier1 = getGuidesByTier(1);
  const tier2 = getGuidesByTier(2);
  const tier3 = getGuidesByTier(3);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
      <main id="main-content" className="overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
          <SiteHeader currentPage="guides" />
          <MarketingShell>
          <SubpageRouteStrip currentPage="guides" />

          <nav aria-label="Breadcrumb" className="mt-6 flex items-center gap-2 text-sm text-ink-muted">
            <Link href="/" className="transition-colors hover:text-ink">
              Home
            </Link>
            <span>/</span>
            <span className="font-medium text-ink">Guides</span>
          </nav>

          <div className="mt-8 max-w-3xl">
            <div className="eyebrow">Guides</div>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">
              yt-dlp GUI guidance for Windows, without the spam.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
              Start with Tier 1 if you are choosing a frontend or installing HalalDL. Tier 2 goes
              deeper on presets, logs, and releases. Tier 3 covers broader local-first Windows
              downloader topics.
            </p>
          </div>

          <section className="mt-14">
            <h2 className="font-display text-2xl font-semibold text-ink">Tier 1 — start here</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tier1.map((guide) => (
                <GuideIndexCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-2xl font-semibold text-ink">Tier 2 — product depth</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tier2.map((guide) => (
                <GuideIndexCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-2xl font-semibold text-ink">Tier 3 — broader topics</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tier3.map((guide) => (
                <GuideIndexCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </section>
          </MarketingShell>
        </div>
      </main>
    </>
  );
}
