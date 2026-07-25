import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideBlocks } from "@/components/guides/guide-article";
import { GuideShell } from "@/components/guides/guide-shell";
import {
  getArticleSchema,
  getGuideArticle,
  getGuideBySlug,
  getGuideFaqSchema,
  getHostedGuideSlugs,
  getRelatedGuides,
} from "@/lib/guides";
import { getSocialImage } from "@/lib/site";
import { getBreadcrumbSchema, serializeJsonLd } from "@/lib/seo";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getHostedGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide || !guide.hostedInGuides) {
    return { title: "Guide not found" };
  }

  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: { canonical: guide.canonicalPath },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: guide.canonicalPath,
      type: "article",
      siteName: "HalalDL",
      images: getSocialImage(`${guide.title} social preview`),
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      images: ["/social/halaldl-social-preview.png"],
    },
  };
}

export default async function GuideArticlePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  const article = getGuideArticle(slug);

  if (!guide || !guide.hostedInGuides || !article) {
    notFound();
  }

  const relatedGuides = getRelatedGuides(slug);
  const tocItems = article.blocks
    .filter((block) => block.type === "heading" && block.level === 2)
    .map((block) => {
      if (block.type !== "heading") return null;
      return { id: block.id, text: block.text };
    })
    .filter((item): item is { id: string; text: string } => Boolean(item));

  const faqs =
    article.faqs ??
    article.blocks.flatMap((block) => (block.type === "faq" ? block.items : []));

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: guide.title, path: guide.canonicalPath },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(getArticleSchema(guide)) }}
      />
      {faqs.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(getGuideFaqSchema(faqs)) }}
        />
      ) : null}

      <GuideShell
        title={guide.title}
        description={guide.description}
        eyebrow={guide.eyebrow}
        tocItems={tocItems}
        relatedGuides={relatedGuides}
        cta={guide.cta}
        page={`guides/${guide.slug}`}
      >
        <GuideBlocks blocks={article.blocks} page={`guides/${guide.slug}`} />
        {article.faqs && article.faqs.length > 0 ? (
          <div className="mt-10">
            <h2
              id="faq"
              className="scroll-mt-28 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
            >
              FAQ
            </h2>
            <div className="mt-5">
              <GuideBlocks
                blocks={[{ type: "faq", items: article.faqs }]}
                page={`guides/${guide.slug}`}
              />
            </div>
          </div>
        ) : null}
      </GuideShell>
    </>
  );
}
