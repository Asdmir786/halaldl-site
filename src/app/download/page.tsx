import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Github,
  Package,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/home/home-header";
import { SubpageRouteStrip } from "@/components/site/subpage-route-strip";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CopyCommand } from "@/components/ui/copy-command";
import { getGitHubSnapshot } from "@/lib/github";
import { getSiteUrl, SITE_LINKS } from "@/lib/site";
import { formatMegabytes, shortenDigest } from "@/components/home/home-shared";

export async function generateMetadata(): Promise<Metadata> {
  const github = await getGitHubSnapshot();

  return {
    title: "Download HalalDL for Windows",
    description:
      "Download HalalDL for Windows 10 and 11. Compare Full, Lite, and WinGet paths, verify SHA256 checksums, and use GitHub Releases as the canonical source.",
    alternates: {
      canonical: "/download",
    },
    openGraph: {
      title: "Download HalalDL for Windows | HalalDL",
      description:
        "Download HalalDL for Windows 10 and 11 with Full, Lite, and WinGet paths plus checksum verification.",
      url: "/download",
      type: "website",
      images: [
        {
          url: "/social/halaldl-social-preview.png",
          width: 1280,
          height: 640,
          alt: "HalalDL download page social preview",
        },
      ],
    },
    twitter: {
      title: "Download HalalDL for Windows | HalalDL",
      description:
        "Download HalalDL for Windows 10 and 11 with Full, Lite, and WinGet paths plus checksum verification.",
      images: ["/social/halaldl-social-preview.png"],
    },
    other: {
      "release-version": github.latestVersion,
    },
  };
}

export default async function DownloadPage() {
  const github = await getGitHubSnapshot();
  const siteUrl = getSiteUrl();

  const downloadSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "HalalDL",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Windows 10, Windows 11",
    softwareVersion: github.latestVersion,
    description:
      "Windows-first, local-first desktop GUI for yt-dlp with Full and Lite installers, visible raw logs, and a checksum verification path.",
    downloadUrl: `${siteUrl.origin}/download`,
    installUrl: `${siteUrl.origin}/download`,
    releaseNotes: github.releaseNotes,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    sameAs: [SITE_LINKS.repoUrl, github.latestReleaseUrl, SITE_LINKS.supportUrl],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which download should most people use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most people should use the Full build because it smooths out the first-run setup path.",
        },
      },
      {
        "@type": "Question",
        name: "What is the canonical download source?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "GitHub Releases is the canonical source. WinGet is convenient, but GitHub Releases is the authoritative path to the newest build.",
        },
      },
      {
        "@type": "Question",
        name: "How should I verify the installer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Download from GitHub Releases, open SHA256SUMS.txt, and verify the installer checksum before first run if you want the strongest trust path.",
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
        name: "Download",
        item: `${siteUrl.origin}/download`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(downloadSchema) }}
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
          <SiteHeader currentPage="download" />
          <ScrollReveal y={14} amount={0.35}>
            <SubpageRouteStrip currentPage="download" />
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
              <span className="font-medium text-ink">Download</span>
            </nav>
          </ScrollReveal>

          <ScrollReveal
            className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start"
            y={22}
          >
            <div className="max-w-2xl">
              <div className="eyebrow">
                <BadgeCheck className="h-3.5 w-3.5" />
                Download
              </div>

              <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">
                Download HalalDL for Windows.
              </h1>

              <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
                Choose the install path that matches how hands-on you want to be. Full is best for
                most people. Lite keeps more of the underlying toolchain boundary explicit. WinGet
                is convenient, but GitHub Releases remains the canonical source.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-ink-soft">
                <span className="rounded-full border border-line bg-paper-strong/80 px-3 py-1.5">
                  Latest release {github.latestVersion}
                </span>
                <span className="rounded-full border border-line bg-paper-strong/80 px-3 py-1.5">
                  Published {github.latestReleaseLabel}
                </span>
                <span className="rounded-full border border-line bg-paper-strong/80 px-3 py-1.5">
                  Windows 10/11 x64
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={github.fullSetupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                >
                  Download Full
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href={github.checksumsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-paper px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-strong"
                >
                  Check SHA256SUMS
                  <ExternalLink className="h-4 w-4" />
                </a>
                <Link
                  href="/changelog"
                  className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-paper px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-strong"
                >
                  View changelog
                </Link>
                <Link
                  href="/compare/full-vs-lite"
                  className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-paper px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-strong"
                >
                  Compare Full vs Lite
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium">
                <Link
                  href="/install/windows"
                  className="text-ink transition-colors hover:text-ink-soft"
                >
                  Windows install guide
                </Link>
                <Link
                  href="/trust/verify-checksum"
                  className="text-ink transition-colors hover:text-ink-soft"
                >
                  Verify SHA256 on Windows
                </Link>
              </div>
            </div>

            <aside className="surface-elevated rounded-[1.75rem] p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Release summary
              </p>
              <p className="mt-3 font-display text-2xl font-semibold text-ink">
                {github.latestReleaseName}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{github.releaseNotes}</p>

              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-line bg-paper/70 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Full build
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-ink">
                    {formatMegabytes(github.fullSetupSize)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-line bg-paper/70 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Lite build
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-ink">
                    {formatMegabytes(github.liteSetupSize)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-line bg-paper/70 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Checksum sample
                  </dt>
                  <dd className="mt-2 break-all text-sm font-medium text-ink">
                    {shortenDigest(github.checksumDigest)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-line bg-paper/70 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Public source
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-ink">GitHub Releases</dd>
                </div>
              </dl>
            </aside>
          </ScrollReveal>

          <section className="pt-16 sm:pt-20">
            <div className="section-divider mb-12" />

            <ScrollReveal className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
              <article className="install-card-primary overflow-hidden rounded-[1.9rem] p-6 sm:p-7">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-mint-strong">
                  Recommended
                </div>
                <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-lg">
                    <h2 className="font-display text-3xl font-semibold text-ink">Full build</h2>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
                      Best first install for most users. This is the path for people who want the
                      cleanest setup flow and less manual dependency handling.
                    </p>
                  </div>
                  <span className="rounded-full border border-sky-strong/30 bg-sky px-3 py-1 text-xs font-semibold text-sky-strong">
                    {formatMegabytes(github.fullSetupSize)}
                  </span>
                </div>

                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    "Recommended for most users",
                    "Smoother first-run path",
                    "Best fit for a straightforward desktop install",
                    "Still paired with GitHub Releases and SHA256 verification",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-line bg-paper/60 p-4 text-sm text-ink-soft"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-strong" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={github.fullSetupUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                  >
                    Download Full
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <a
                    href={github.latestReleaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-paper-strong px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper"
                  >
                    View GitHub Release
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </article>

              <div className="grid gap-5">
                <article className="install-card-secondary rounded-[1.6rem] p-6">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-sky px-3 py-1 text-xs font-semibold text-sky-strong">
                    Power users
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-semibold text-ink">Lite build</h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    Better when you want more direct control over yt-dlp, ffmpeg, aria2, and the
                    wider toolchain boundary.
                  </p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    {formatMegabytes(github.liteSetupSize)}
                  </p>
                  <a
                    href={github.liteSetupUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper-strong px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper"
                  >
                    Download Lite
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </article>

                <article className="install-card-secondary rounded-[1.6rem] p-6">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink-muted">
                    <Package className="h-3.5 w-3.5" />
                    Package manager
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-semibold text-ink">WinGet</h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    Best for convenience and updates. Good option, but do not treat it as the most
                    authoritative or fastest path to the newest release.
                  </p>
                  <div className="mt-5">
                    <CopyCommand command={SITE_LINKS.wingetCommand} />
                  </div>
                </article>
              </div>
            </ScrollReveal>
          </section>

          <section className="pt-16 sm:pt-20">
            <div className="section-divider mb-12" />

            <ScrollReveal className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky">
                    <ShieldCheck className="h-5 w-5 text-sky-strong" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      Verify before first run
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      The trust path should be explicit. Download from GitHub Releases, inspect the
                      attached checksum file, and then decide how to handle any SmartScreen warning.
                    </p>
                  </div>
                </div>

                <ol className="mt-6 space-y-3">
                  {[
                    "Download from the Full or Lite release asset, or open the GitHub Release page directly.",
                    "Open SHA256SUMS.txt and verify the installer checksum before first run.",
                    "If SmartScreen warns, verify source plus checksum before continuing.",
                  ].map((item, index) => (
                    <li key={item} className="rounded-2xl border border-line bg-paper/70 p-4">
                      <div className="flex gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky text-xs font-semibold text-sky-strong">
                          {index + 1}
                        </span>
                        <p className="text-sm leading-relaxed text-ink-soft">{item}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={github.checksumsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-ink-soft"
                  >
                    View SHA256SUMS.txt
                    <FileCheck2 className="h-4 w-4" />
                  </a>
                  <a
                    href={SITE_LINKS.supportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink"
                  >
                    Support docs
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </article>

              <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint">
                    <Github className="h-5 w-5 text-mint-strong" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">Public release facts</h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      Releases, source, checksums, and issue tracking all stay tied to one public
                      origin.
                    </p>
                  </div>
                </div>

                <dl className="mt-6 space-y-3">
                  {[
                    { label: "Latest release", value: `${github.latestVersion} · ${github.latestReleaseLabel}` },
                    { label: "First public release", value: `${github.firstPublicVersion} · ${github.firstPublicReleaseLabel}` },
                    { label: "Checksum sample", value: shortenDigest(github.checksumDigest) },
                    { label: "Canonical source", value: "GitHub Releases" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-line bg-paper/70 p-4">
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                        {item.label}
                      </dt>
                      <dd className="mt-2 break-all text-sm font-medium leading-relaxed text-ink">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <a
                    href={SITE_LINKS.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between rounded-2xl border border-line bg-paper/60 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper"
                  >
                    Inspect source
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href={github.latestReleaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between rounded-2xl border border-line bg-paper/60 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper"
                  >
                    Latest release
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </article>
            </ScrollReveal>
          </section>

          <section className="pt-16 sm:pt-20">
            <div className="section-divider mb-10" />

            <ScrollReveal className="flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-line bg-paper/70 p-6 sm:p-7">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Next steps
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
                  Install now, then use the changelog and trust path if you want more proof.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  The home page explains the product, this page handles download decisions, and the
                  changelog gives release-by-release proof.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/trust/verify-checksum"
                  className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-strong"
                >
                  Verify checksums
                </Link>
                <Link
                  href="/changelog"
                  className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-strong"
                >
                  View changelog
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
