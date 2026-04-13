import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/home/home-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SubpageRouteStrip } from "@/components/site/subpage-route-strip";
import { getGitHubSnapshot } from "@/lib/github";
import { getSocialImage } from "@/lib/site";
import { getBreadcrumbSchema, serializeJsonLd } from "@/lib/seo";
import { formatMegabytes } from "@/components/home/home-shared";

export const metadata: Metadata = {
  title: "HalalDL Full vs Lite",
  description:
    "Compare HalalDL Full vs Lite for Windows. See which build most people should use, what setup boundary changes, and when Lite actually makes sense.",
  alternates: {
    canonical: "/compare/full-vs-lite",
  },
  openGraph: {
    title: "HalalDL Full vs Lite | HalalDL",
    description:
      "Compare HalalDL Full vs Lite for Windows and choose the right install path for your setup style.",
    url: "/compare/full-vs-lite",
    type: "article",
    siteName: "HalalDL",
    images: getSocialImage("HalalDL Full vs Lite comparison page social preview"),
  },
  twitter: {
    card: "summary_large_image",
    title: "HalalDL Full vs Lite | HalalDL",
    description:
      "Compare HalalDL Full vs Lite for Windows and choose the right install path for your setup style.",
    images: ["/social/halaldl-social-preview.png"],
  },
};

const comparisonRows = [
  {
    label: "Best for",
    full: "Most people who want the cleanest first-run path.",
    lite: "Power users who prefer managing more of the toolchain boundary themselves.",
  },
  {
    label: "Setup feel",
    full: "Lower-friction install story with fewer manual decisions up front.",
    lite: "More explicit and hands-on if you already know what you want to manage.",
  },
  {
    label: "When to choose it",
    full: "You want to install, open the app, and get moving quickly.",
    lite: "You already care about yt-dlp, ffmpeg, aria2, or related pieces staying under your control.",
  },
  {
    label: "Main tradeoff",
    full: "Less explicit control over the setup boundary compared with Lite.",
    lite: "More setup responsibility and more room for manual friction.",
  },
];

const fullReasons = [
  "Best default for most users",
  "Smoother first-run path",
  "Matches the trust-first install story on the site",
];

const liteReasons = [
  "Better if you already manage the wider toolchain yourself",
  "Keeps setup boundaries more explicit",
  "Useful when you actively prefer control over convenience",
];

export default async function FullVsLitePage() {
  const github = await getGitHubSnapshot();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which build should most people use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most people should use the Full build because it provides the smoother first-run path.",
        },
      },
      {
        "@type": "Question",
        name: "When should I choose Lite?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Choose Lite when you already prefer managing more of the yt-dlp, ffmpeg, aria2, or related toolchain boundary yourself.",
        },
      },
      {
        "@type": "Question",
        name: "Is Lite more advanced?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Lite is not inherently better. It is simply a better fit for people who want more direct control and accept more setup responsibility.",
        },
      },
    ],
  };

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Full vs Lite", path: "/compare/full-vs-lite" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />

      <main id="main-content" className="overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
          <SiteHeader currentPage="compare" />
          <ScrollReveal y={14} amount={0.35}>
            <SubpageRouteStrip currentPage="compare" />
          </ScrollReveal>

          <ScrollReveal className="mt-6" y={18}>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm text-ink-muted"
            >
              <Link href="/" className="transition-colors hover:text-ink">
                Home
              </Link>
              <span>/</span>
              <span className="font-medium text-ink">Full vs Lite</span>
            </nav>
          </ScrollReveal>

          <ScrollReveal
            className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start"
            y={22}
          >
            <div className="max-w-2xl">
              <div className="eyebrow">
                <Layers3 className="h-3.5 w-3.5" />
                Compare
              </div>
              <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">
                HalalDL Full vs Lite.
              </h1>
              <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
                The simple version is this: most people should use Full. Lite is the better fit
                only when you already care about keeping more of the underlying toolchain boundary
                explicit.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/download"
                  className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                >
                  Go to download page
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={github.fullSetupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-paper px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-strong"
                >
                  Download Full
                </a>
              </div>
            </div>

            <aside className="surface-elevated rounded-[1.75rem] p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Short answer
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-line bg-paper/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Full
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink">Recommended for most users</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Pick this if you want the smoother first-run experience.
                  </p>
                </div>
                <div className="rounded-2xl border border-line bg-paper/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Lite
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink">Only if you want more control</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Better when the wider toolchain boundary matters to you.
                  </p>
                </div>
              </div>
            </aside>
          </ScrollReveal>

          <section className="pt-16 sm:pt-20">
            <div className="section-divider mb-12" />

            <ScrollReveal className="grid gap-5 lg:grid-cols-2">
              <article className="install-card-primary rounded-[1.9rem] p-6 sm:p-7">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-mint-strong">
                  Recommended
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-3xl font-semibold text-ink">Full build</h2>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
                      Best first install for most users. This is the lower-friction path.
                    </p>
                  </div>
                  <span className="rounded-full border border-sky-strong/30 bg-sky px-3 py-1 text-xs font-semibold text-sky-strong">
                    {formatMegabytes(github.fullSetupSize)}
                  </span>
                </div>

                <ul className="mt-6 space-y-3">
                  {fullReasons.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-ink-soft">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-strong" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={github.fullSetupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                >
                  Download Full
                  <ArrowRight className="h-4 w-4" />
                </a>
              </article>

              <article className="install-card-secondary rounded-[1.9rem] p-6 sm:p-7">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-sky px-3 py-1 text-xs font-semibold text-sky-strong">
                  Power users
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-3xl font-semibold text-ink">Lite build</h2>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
                      Better when you actively prefer more direct control over the setup boundary.
                    </p>
                  </div>
                  <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold text-ink-muted">
                    {formatMegabytes(github.liteSetupSize)}
                  </span>
                </div>

                <ul className="mt-6 space-y-3">
                  {liteReasons.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-ink-soft">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-strong" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={github.liteSetupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper-strong px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper"
                >
                  Download Lite
                  <ArrowRight className="h-4 w-4" />
                </a>
              </article>
            </ScrollReveal>
          </section>

          <section className="pt-16 sm:pt-20">
            <div className="section-divider mb-12" />

            <ScrollReveal className="rounded-[1.85rem] border border-line bg-paper/70 p-6 sm:p-7">
              <div className="max-w-2xl">
                <div className="eyebrow">
                  <CircleHelp className="h-3.5 w-3.5" />
                  Decision guide
                </div>
                <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
                  The real decision points.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-ink-soft">
                  This is not a fake “pro vs basic” split. The main difference is whether you want
                  the smoother default setup path or you want more of the environment boundary to
                  stay under your own control.
                </p>
              </div>

              <div className="mt-8 overflow-hidden rounded-2xl border border-line">
                <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1fr)] bg-paper-strong">
                  <div className="border-r border-line px-4 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Compare
                  </div>
                  <div className="border-r border-line px-4 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Full
                  </div>
                  <div className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Lite
                  </div>
                </div>

                {comparisonRows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1fr)] border-t border-line bg-paper/40"
                  >
                    <div className="border-r border-line px-4 py-4 text-sm font-semibold text-ink">
                      {row.label}
                    </div>
                    <div className="border-r border-line px-4 py-4 text-sm leading-relaxed text-ink-soft">
                      {row.full}
                    </div>
                    <div className="px-4 py-4 text-sm leading-relaxed text-ink-soft">
                      {row.lite}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </section>

          <section className="pt-16 sm:pt-20">
            <div className="section-divider mb-12" />

            <ScrollReveal className="grid gap-5 lg:grid-cols-2">
              <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber">
                    <CircleAlert className="h-5 w-5 text-amber-strong" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      Choose Full if...
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      You want the cleanest recommendation and do not want to overthink the setup
                      path.
                    </p>
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {[
                    "you just want to install and get moving",
                    "you are not trying to manually manage the wider toolchain boundary",
                    "you want the path the site is clearly recommending",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-ink-soft">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-strong" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky">
                    <ShieldCheck className="h-5 w-5 text-sky-strong" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      Choose Lite if...
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      You already know why you prefer the more hands-on path.
                    </p>
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {[
                    "you already care about managing more of the dependency/toolchain boundary",
                    "you accept a more explicit setup tradeoff",
                    "you do not need the site to smooth the path for you",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-ink-soft">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-strong" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </ScrollReveal>
          </section>

          <section className="pt-16 sm:pt-20">
            <div className="section-divider mb-10" />

            <ScrollReveal className="flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-line bg-paper/70 p-6 sm:p-7">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Next move
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
                  If you still are not sure, use Full.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  The safest default is still Full. Use the download page if you want the full
                  trust and install context in one place.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/download"
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                >
                  Go to download page
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-strong"
                >
                  Back to home
                </Link>
              </div>
            </ScrollReveal>
          </section>
        </div>
      </main>
    </>
  );
}
