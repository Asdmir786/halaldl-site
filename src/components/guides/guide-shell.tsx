import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/home/home-header";
import { SubpageRouteStrip } from "@/components/site/subpage-route-strip";
import { GuideCtaButton, RelatedGuides } from "@/components/guides/guide-article";
import { GuideToc } from "@/components/guides/guide-toc";
import type { GuideCta, GuideMeta } from "@/lib/guides/types";

type GuideShellProps = {
  title: string;
  description: string;
  eyebrow?: string;
  children: ReactNode;
  tocItems?: Array<{ id: string; text: string }>;
  relatedGuides?: GuideMeta[];
  cta: GuideCta;
  page: string;
  showRouteStrip?: boolean;
};

export function GuideShell({
  title,
  description,
  eyebrow,
  children,
  tocItems = [],
  relatedGuides = [],
  cta,
  page,
  showRouteStrip = true,
}: GuideShellProps) {
  return (
    <main id="main-content" className="overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
        <SiteHeader currentPage="guides" />
        {showRouteStrip ? <SubpageRouteStrip currentPage="guides" /> : null}

        <nav aria-label="Breadcrumb" className="mt-6 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
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
          <article>
            {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-ink-soft sm:text-lg">
              {description}
            </p>

            <div className="mt-10">{children}</div>

            <div className="mt-12 rounded-[1.75rem] border border-line bg-paper/70 p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Next step
              </p>
              <p className="mt-3 font-display text-2xl font-semibold text-ink">
                Ready to install on Windows?
              </p>
              <div className="mt-5">
                <GuideCtaButton cta={cta} page={page} />
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

          <GuideToc items={tocItems} />
        </div>
      </div>
    </main>
  );
}
