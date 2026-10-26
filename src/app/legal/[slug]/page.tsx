import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolPageShell } from "@/components/fetch/tool-page-shell";
import { LEGAL_PAGES, type LegalSlug } from "@/lib/fetch/legal";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(LEGAL_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = LEGAL_PAGES[slug as LegalSlug];
  if (!page) return { title: "Legal" };
  return {
    title: { absolute: `${page.title} — HalalDL` },
    description: page.description,
    alternates: { canonical: `/legal/${slug}` },
  };
}

export default async function LegalPage({ params }: PageProps) {
  const { slug } = await params;
  const page = LEGAL_PAGES[slug as LegalSlug];
  if (!page) notFound();
  return (
    <ToolPageShell currentPage="legal" title={page.title} lede={page.description}>
      <article className="grid gap-4 text-sm leading-relaxed text-ink-soft">
        {page.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </article>
      <p className="mt-8 text-sm text-ink-muted">
        <Link className="font-semibold text-ink underline" href="/fetch">Back to the web tool</Link>
      </p>
    </ToolPageShell>
  );
}
