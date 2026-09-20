import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/home/home-header";
import { MarketingShell } from "@/components/site/marketing-shell";
import { GuideCtaButton, RelatedGuides } from "@/components/guides/guide-article";
import { GuideToc } from "@/components/guides/guide-toc";
import { GuideReadingProgress, ScrollBeats } from "@/components/experience/scroll-beats";
import type { GuideCta, GuideMeta } from "@/lib/guides/types";

type GuideShellProps = {
  title: string;
  description: string;
  eyebrow?: string;
  children: ReactNode;
  tocItems?: Array<{ id: string; text: string }>;
  relatedGuides?: GuideMeta[];
  cta: GuideCta;
};

export function GuideShell({
  title,
  description,
  eyebrow,
  children,
  tocItems = [],
  relatedGuides = [],
  cta,
}: GuideShellProps) {
  return (
    <main id="main-content" className="secondary-page overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pb-20">
        <SiteHeader currentPage="guides" />
        <MarketingShell>
          <GuideReadingProgress targetId="guide-article-body" />
          <ScrollBeats>
            <nav
              aria-label="Breadcrumb"
              className="mt-6 flex flex-wrap items-center gap-2 text-sm text-ink-muted"
              data-scroll-beat=""
            >
              <Link href="/" className="transition-colors hover:text-ink">
                Home
              </Link>
              <span>/</span>
              <Link href="/guides" className="transition-colors hover:text-ink">
                Guides
              </Link>
              <span>/</span>
              <span className="font-medium text-ink">{title}</span>
            </nav>

            <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1fr)_16rem] xl:items-start">
              <article id="guide-article-body" data-scroll-beat="" className="min-w-0">
                <header className="secondary-hero guide-article-hero relative overflow-hidden rounded-[1.85rem] border border-line bg-paper/70 p-6 sm:p-8">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky/70 blur-3xl" aria-hidden="true" />
                  <div className="relative">
                    {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
                    <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">
                      {title}
                    </h1>
                    <p className="mt-5 max-w-3xl text-base leading-relaxed text-ink-soft sm:text-lg">
                      {description}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <GuideCtaButton cta={cta} analyticsSurface="guide_body" />
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-mint-strong"><span className="h-1.5 w-1.5 rounded-full bg-mint-strong" /> Windows guide · local app · no account</span>
                    </div>
                  </div>
                </header>

                <div className="mt-8 min-w-0 rounded-[1.85rem] border border-line bg-paper/45 p-6 sm:p-8">{children}</div>

                <div className="mt-10 rounded-[1.75rem] border border-mint-strong/20 bg-mint/25 p-6 sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Next step
                  </p>
                  <p className="mt-3 font-display text-2xl font-semibold text-ink">
                    Ready to install on Windows?
                  </p>
                  <div className="mt-5">
                    <GuideCtaButton cta={cta} analyticsSurface="guide_next_step" />
                  </div>
                </div>

                <RelatedGuides
                  guides={relatedGuides.map((guide) => ({
                    title: guide.title,
                    description: guide.description,
                    canonicalPath: guide.canonicalPath,
                  }))}
                />
              </article>

              <div data-scroll-beat="" className="xl:sticky xl:top-24">
                <GuideToc items={tocItems} />
              </div>
            </div>
          </ScrollBeats>
        </MarketingShell>
      </div>
    </main>
  );
}
