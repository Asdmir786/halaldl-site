import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, FileStack, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/home/home-header";
import { ThemedScreenshot } from "@/components/themed-screenshot";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { getSocialImage } from "@/lib/site";
import { getChangelogEntries } from "@/lib/changelog";
import { getBreadcrumbSchema, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "What changed in HalalDL, with release summaries, proof, and a practical release checklist.",
  alternates: {
    canonical: "/changelog",
  },
  openGraph: {
    title: "Changelog | HalalDL",
    description:
      "What changed in HalalDL, with release summaries, proof, and a practical release checklist.",
    url: "/changelog",
    type: "website",
    siteName: "HalalDL",
    images: getSocialImage("HalalDL changelog page social preview"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Changelog | HalalDL",
    description:
      "What changed in HalalDL, with release summaries, proof, and a practical release checklist.",
    images: ["/social/halaldl-social-preview.png"],
  },
};

export default async function ChangelogPage() {
  const [featured, ...entries] = await getChangelogEntries();
  const releaseHistory = [featured, ...entries];
  const earliestRelease = releaseHistory[releaseHistory.length - 1];
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Changelog", path: "/changelog" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />

      <main id="main-content" className="overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
          <SiteHeader currentPage="changelog" />

          <ScrollReveal className="mt-6" y={18}>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm text-ink-muted"
            >
              <Link href="/" className="transition-colors hover:text-ink">
                Home
              </Link>
              <span>/</span>
              <span className="font-medium text-ink">Changelog</span>
            </nav>
          </ScrollReveal>

          <ScrollReveal className="max-w-3xl mt-6" y={22}>
            <div className="eyebrow">
              <FileStack className="h-3.5 w-3.5" />
              Changelog
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">
              What changed in HalalDL.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
              Use this page when you want release-by-release proof before you download or update.
              Each entry gives the high-signal summary first, then links back to the full GitHub
              release for raw notes and assets.
            </p>
          </ScrollReveal>

          <section className="pt-14 sm:pt-16">
            <div className="section-divider mb-12" />

            <ScrollReveal className="grid gap-4 md:grid-cols-3">
              <article className="surface-card-static rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Latest release
                </p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">{featured.version}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{featured.date}</p>
              </article>
              <article className="surface-card-static rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Public history
                </p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">
                  {releaseHistory.length} releases
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  From {earliestRelease.version} to {featured.version}.
                </p>
              </article>
              <article className="surface-card-static rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Reading pattern
                </p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">Added. Improved. Fixed.</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Notes are reserved for install, migration, or trust-related context.
                </p>
              </article>
            </ScrollReveal>

            <div className="section-divider my-12" />

            <ScrollReveal className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
              <article className="surface-elevated overflow-hidden rounded-2xl p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky px-3 py-1 text-xs font-semibold text-sky-strong">
                    <Sparkles className="h-3.5 w-3.5" />
                    Latest release
                  </span>
                  <span className="text-sm text-ink-muted">{featured.date}</span>
                </div>

                <div className="mt-5 flex flex-wrap items-end gap-4">
                  <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
                    {featured.version}
                  </h2>
                  <p className="pb-1 text-sm font-medium text-ink-muted">{featured.headline}</p>
                </div>

                <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft">
                  {featured.summary}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={featured.releaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                  >
                    View GitHub release
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <Link
                    href="/download"
                    className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper-strong"
                  >
                    Download latest
                  </Link>
                </div>

                {featured.media?.type === "image" && (
                  <div className="mt-8 screenshot-frame p-3">
                    <div className="feature-stage min-h-[16rem] sm:min-h-[22rem] lg:min-h-[24rem]">
                      <ThemedScreenshot
                        lightSrc={featured.media.lightSrc}
                        darkSrc={featured.media.darkSrc}
                        alt={featured.media.alt}
                        sizes="(min-width: 1024px) 700px, 100vw"
                        renderMode="active"
                        className="inset-0"
                        imageClassName="border border-line-strong bg-paper-strong object-contain object-center"
                      />
                    </div>
                  </div>
                )}
              </article>

              <aside className="surface-card-static rounded-2xl p-6">
                <h2 className="font-display text-xl font-semibold text-ink">How to read this page</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  This page should help you judge momentum quickly instead of making you read every
                  raw release note line-by-line.
                </p>

                <ul className="mt-6 space-y-3">
                  {[
                    "Start with the newest entry to see what changed in plain language.",
                    "Use Added, Improved, and Fixed to scan for the kind of change you care about.",
                    "Open the linked GitHub Release when you want the exact assets or full raw notes.",
                    "Pay extra attention to Notes when a release affects install flow, SmartScreen, or verification.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-strong" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            </ScrollReveal>
          </section>

          <section className="pt-16 sm:pt-20">
            <div className="section-divider mb-12" />

            <ScrollReveal className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold text-ink">Release history</h2>
              <Link href="/" className="text-sm font-semibold text-ink-soft hover:text-ink">
                Back to home
              </Link>
            </ScrollReveal>

            <div className="mt-8 space-y-4">
              {[featured, ...entries].map((entry) => (
                <ScrollReveal key={entry.version}>
                  <article className="surface-card-static rounded-2xl p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-display text-2xl font-semibold text-ink">{entry.version}</h3>
                          <span className="text-sm text-ink-muted">{entry.date}</span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-ink">{entry.headline}</p>
                        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">
                          {entry.summary}
                        </p>
                      </div>
                      <a
                        href={entry.releaseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-ink-soft"
                      >
                        GitHub Release
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-3">
                      {entry.added?.length ? (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                            Added
                          </h4>
                          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
                            {entry.added.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {entry.improved?.length ? (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                            Improved
                          </h4>
                          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
                            {entry.improved.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {entry.fixed?.length ? (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                            Fixed
                          </h4>
                          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
                            {entry.fixed.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    {entry.notes?.length ? (
                      <div className="mt-6 rounded-xl border border-line bg-paper-strong/70 p-4">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                          Notes
                        </h4>
                        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
                          {entry.notes.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
