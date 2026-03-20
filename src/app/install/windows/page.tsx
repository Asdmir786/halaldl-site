import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Download,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/home/home-header";
import { SubpageRouteStrip } from "@/components/site/subpage-route-strip";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CopyCommand } from "@/components/ui/copy-command";
import { getGitHubSnapshot } from "@/lib/github";
import { getSiteUrl, getSocialImage, SITE_LINKS } from "@/lib/site";
import { formatMegabytes } from "@/components/home/home-shared";

export const metadata: Metadata = {
  title: "How to Install HalalDL on Windows 10 and 11",
  description:
    "Install HalalDL on Windows 10 and 11 with the right Full, Lite, or WinGet path. Includes SHA256, SmartScreen, and first-run guidance.",
  alternates: {
    canonical: "/install/windows",
  },
  openGraph: {
    title: "How to Install HalalDL on Windows | HalalDL",
    description:
      "Choose the right HalalDL install path for Windows 10 and 11 with Full, Lite, or WinGet.",
    url: "/install/windows",
    type: "article",
    siteName: "HalalDL",
    images: getSocialImage("HalalDL install guide social preview"),
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Install HalalDL on Windows | HalalDL",
    description:
      "Choose the right HalalDL install path for Windows 10 and 11 with Full, Lite, or WinGet.",
    images: ["/social/halaldl-social-preview.png"],
  },
};

const installSteps = [
  {
    title: "Pick the right install path first",
    body: "Most people should choose Full. Use Lite only if you actively prefer managing more of the yt-dlp and ffmpeg boundary yourself. Use WinGet for convenience, not as the most authoritative release source.",
  },
  {
    title: "Download from the canonical source",
    body: "If you want the clearest trust path, open the latest GitHub Release and download the Full or Lite installer from there. WinGet is supported, but GitHub Releases is still the canonical source.",
  },
  {
    title: "Verify the installer if you want the strongest trust path",
    body: "Open SHA256SUMS.txt from the same release and compare the installer hash before first run. This matters more because the installer is not code-signed yet.",
  },
  {
    title: "Run the installer and launch HalalDL",
    body: "Finish the setup flow, launch the app, and confirm the Windows-first UI opens correctly. If SmartScreen warns, verify source plus checksum before continuing.",
  },
];

export default async function InstallWindowsPage() {
  const github = await getGitHubSnapshot();
  const siteUrl = getSiteUrl();

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to install HalalDL on Windows",
    description:
      "Install HalalDL on Windows 10 and 11 using Full, Lite, or WinGet with SHA256 and SmartScreen guidance.",
    step: installSteps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.body,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which build should most people install?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most people should install the Full build because it gives the smoother first-run setup path.",
        },
      },
      {
        "@type": "Question",
        name: "Can I install HalalDL with WinGet?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. WinGet is supported and convenient, but GitHub Releases remains the canonical source for the latest release assets.",
        },
      },
      {
        "@type": "Question",
        name: "What should I do if SmartScreen warns?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Verify that the installer came from GitHub Releases and compare it against SHA256SUMS.txt before proceeding.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl.origin,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Install on Windows",
        item: `${siteUrl.origin}/install/windows`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main id="main-content" className="overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
          <SiteHeader currentPage="none" />
          <ScrollReveal y={14} amount={0.35}>
            <SubpageRouteStrip currentPage="install" />
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
              <span className="font-medium text-ink">Install on Windows</span>
            </nav>
          </ScrollReveal>

          <ScrollReveal
            className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start"
            y={22}
          >
            <div className="max-w-2xl">
              <div className="eyebrow">
                <Download className="h-3.5 w-3.5" />
                Windows install guide
              </div>
              <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">
                How to install HalalDL on Windows 10 and 11.
              </h1>
              <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
                The cleanest path is simple: most people should use Full, download from GitHub
                Releases, verify SHA256 if they want the strongest trust path, then run the
                installer.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-ink-soft">
                <span className="rounded-full border border-line bg-paper-strong/80 px-3 py-1.5">
                  Latest release {github.latestVersion}
                </span>
                <span className="rounded-full border border-line bg-paper-strong/80 px-3 py-1.5">
                  Windows 10/11 x64
                </span>
                <span className="rounded-full border border-line bg-paper-strong/80 px-3 py-1.5">
                  GitHub Releases is canonical
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/download"
                  className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                >
                  Go to download page
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/compare/full-vs-lite"
                  className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-paper px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-strong"
                >
                  Compare Full vs Lite
                </Link>
              </div>
            </div>

            <aside className="surface-elevated rounded-[1.75rem] p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Quick answer
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-line bg-paper/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Full
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink">Recommended for most users</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Lower-friction first install with the smoother default path.
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    {formatMegabytes(github.fullSetupSize)}
                  </p>
                </div>
                <div className="rounded-2xl border border-line bg-paper/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    WinGet
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink">Good for convenience</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Useful for quick installs and updates, but not the canonical release path.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <CopyCommand command={SITE_LINKS.wingetCommand} />
              </div>
            </aside>
          </ScrollReveal>

          <section className="pt-16 sm:pt-20">
            <div className="section-divider mb-12" />

            <ScrollReveal className="grid gap-5 lg:grid-cols-3">
              <article className="install-card-primary rounded-[1.75rem] p-6">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-mint-strong">
                  Recommended
                </div>
                <h2 className="mt-5 font-display text-2xl font-semibold text-ink">Full build</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  Best first install for most people who want the smoother setup path.
                </p>
                <a
                  href={github.fullSetupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                >
                  Download Full
                  <ArrowRight className="h-4 w-4" />
                </a>
              </article>

              <article className="install-card-secondary rounded-[1.75rem] p-6">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-sky px-3 py-1 text-xs font-semibold text-sky-strong">
                  Power users
                </div>
                <h2 className="mt-5 font-display text-2xl font-semibold text-ink">Lite build</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  Better when you prefer to keep more of the tooling boundary under your own
                  control.
                </p>
                <a
                  href={github.liteSetupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper-strong px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper"
                >
                  Download Lite
                  <ArrowRight className="h-4 w-4" />
                </a>
              </article>

              <article className="surface-card-static rounded-[1.75rem] p-6">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink-muted">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Trust path
                </div>
                <h2 className="mt-5 font-display text-2xl font-semibold text-ink">
                  Verify before first run
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  If you want the strongest install path, verify SHA256 before running the
                  installer and use GitHub Releases as the public source of truth.
                </p>
                <Link
                  href="/trust/verify-checksum"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-strong"
                >
                  Verify SHA256
                  <FileCheck2 className="h-4 w-4" />
                </Link>
              </article>
            </ScrollReveal>
          </section>

          <section className="pt-16 sm:pt-20">
            <div className="section-divider mb-12" />

            <ScrollReveal className="rounded-[1.85rem] border border-line bg-paper/70 p-6 sm:p-7">
              <div className="max-w-2xl">
                <div className="eyebrow">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Step by step
                </div>
                <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
                  Install flow on Windows.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-ink-soft">
                  The install process should be direct: choose the right build, verify if you
                  care about the strongest trust path, then run the installer and launch the app.
                </p>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {installSteps.map((step, index) => (
                  <article key={step.title} className="rounded-2xl border border-line bg-paper/60 p-5">
                    <div className="flex items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky text-sm font-semibold text-sky-strong">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-display text-xl font-semibold text-ink">{step.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </ScrollReveal>
          </section>

          <section className="pt-16 sm:pt-20">
            <div className="section-divider mb-12" />

            <ScrollReveal className="grid gap-5 lg:grid-cols-2">
              <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                <h2 className="font-display text-2xl font-semibold text-ink">If SmartScreen warns</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  That warning is expected while the installer is not code-signed. Do not treat it
                  as a reason to skip verification. Treat it as a reason to verify source plus
                  SHA256 first.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Confirm the installer came from GitHub Releases.",
                    "Open SHA256SUMS.txt from the same release.",
                    "Compare the file hash before you continue.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-ink-soft">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-strong" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                <h2 className="font-display text-2xl font-semibold text-ink">Best next move</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  If you are ready to install, the download page is still the main decision page.
                  If you want more proof before first run, go straight to the SHA256 guide.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/download"
                    className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                  >
                    Go to download page
                  </Link>
                  <Link
                    href="/trust/verify-checksum"
                    className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-strong"
                  >
                    Verify SHA256
                  </Link>
                </div>
              </article>
            </ScrollReveal>
          </section>
        </div>
      </main>
    </>
  );
}
