import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  FileCheck2,
  ShieldCheck,
  TerminalSquare,
} from "lucide-react";
import { SiteHeader } from "@/components/home/home-header";
import { SubpageRouteStrip } from "@/components/site/subpage-route-strip";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CopyCommand } from "@/components/ui/copy-command";
import { getGitHubSnapshot } from "@/lib/github";
import { getSiteUrl, SITE_LINKS } from "@/lib/site";
import { shortenDigest } from "@/components/home/home-shared";

export const metadata: Metadata = {
  title: "How to Verify HalalDL SHA256 Checksums on Windows",
  description:
    "Verify HalalDL SHA256 checksums on Windows before first run. Compare GitHub Release assets against SHA256SUMS.txt and handle SmartScreen correctly.",
  alternates: {
    canonical: "/trust/verify-checksum",
  },
  openGraph: {
    title: "How to Verify HalalDL SHA256 Checksums | HalalDL",
    description:
      "Verify HalalDL installers on Windows with SHA256SUMS.txt before first run.",
    url: "/trust/verify-checksum",
    type: "article",
  },
  twitter: {
    title: "How to Verify HalalDL SHA256 Checksums | HalalDL",
    description:
      "Verify HalalDL installers on Windows with SHA256SUMS.txt before first run.",
  },
};

function getDownloadFileName(downloadUrl: string, fallbackName: string) {
  try {
    const parsed = new URL(downloadUrl);
    return decodeURIComponent(parsed.pathname.split("/").at(-1) ?? fallbackName);
  } catch {
    return fallbackName;
  }
}

export default async function VerifyChecksumPage() {
  const github = await getGitHubSnapshot();
  const siteUrl = getSiteUrl();
  const fullSetupName = getDownloadFileName(github.fullSetupUrl, "HalalDL-Full-setup.exe");
  const liteSetupName = getDownloadFileName(github.liteSetupUrl, "HalalDL-Lite-setup.exe");
  const fullHashCommand = `Get-FileHash "$env:USERPROFILE\\Downloads\\${fullSetupName}" -Algorithm SHA256`;

  const verificationSteps = [
    {
      title: "Download the installer from GitHub Releases",
      body: "Use the Full or Lite asset from the latest public release. That keeps the file source tied directly to the published release notes and attached checksum file.",
    },
    {
      title: "Open SHA256SUMS.txt from the same release",
      body: "The checksum file must come from the same GitHub Release as the installer you downloaded. Do not compare against an older release.",
    },
    {
      title: "Compute the SHA256 hash on your Windows machine",
      body: "Use PowerShell with Get-FileHash and compare the output to the matching installer line in SHA256SUMS.txt.",
    },
    {
      title: "Only continue after the values match",
      body: "If the hashes do not match, delete the file and download it again from the canonical release page before running anything.",
    },
  ];

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to verify HalalDL SHA256 checksums on Windows",
    description:
      "Compare the HalalDL installer hash against SHA256SUMS.txt on Windows before first run.",
    step: verificationSteps.map((step, index) => ({
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
        name: "Why should I verify the installer checksum?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Verifying the checksum confirms that the file you downloaded matches the release asset published on GitHub Releases.",
        },
      },
      {
        "@type": "Question",
        name: "What if SmartScreen warns on first run?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Current installers are not code-signed yet. Verify the GitHub release source and SHA256 checksum before deciding whether to continue.",
        },
      },
      {
        "@type": "Question",
        name: "Should I verify Lite differently from Full?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The process is the same. You just compare the hash for the installer file you actually downloaded against the matching line in SHA256SUMS.txt.",
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
        name: "Verify SHA256",
        item: `${siteUrl.origin}/trust/verify-checksum`,
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
            <SubpageRouteStrip currentPage="trust" />
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
              <span className="font-medium text-ink">Verify SHA256</span>
            </nav>
          </ScrollReveal>

          <ScrollReveal
            className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start"
            y={22}
          >
            <div className="max-w-2xl">
              <div className="eyebrow">
                <ShieldCheck className="h-3.5 w-3.5" />
                Trust guide
              </div>
              <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">
                How to verify HalalDL SHA256 checksums on Windows.
              </h1>
              <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
                The rule is simple: download from GitHub Releases, open the SHA256SUMS file from
                the same release, compute the local hash, and only continue when both values match.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-ink-soft">
                <span className="rounded-full border border-line bg-paper-strong/80 px-3 py-1.5">
                  Latest release {github.latestVersion}
                </span>
                <span className="rounded-full border border-line bg-paper-strong/80 px-3 py-1.5">
                  Checksum sample {shortenDigest(github.checksumDigest)}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={github.checksumsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                >
                  Open SHA256SUMS.txt
                  <ExternalLink className="h-4 w-4" />
                </a>
                <Link
                  href="/download"
                  className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-paper px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-strong"
                >
                  Back to download page
                </Link>
              </div>
            </div>

            <aside className="surface-elevated rounded-[1.75rem] p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Example PowerShell command
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                This example assumes the installer is still in your Downloads folder.
              </p>
              <div className="mt-5">
                <CopyCommand command={fullHashCommand} />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-ink-muted">
                If you downloaded Lite instead, replace the file name with{" "}
                <span className="font-medium text-ink">{liteSetupName}</span>.
              </p>
            </aside>
          </ScrollReveal>

          <section className="pt-16 sm:pt-20">
            <div className="section-divider mb-12" />

            <ScrollReveal className="grid gap-4 lg:grid-cols-2">
              {verificationSteps.map((step, index) => (
                <article key={step.title} className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky text-sm font-semibold text-sky-strong">
                      {index + 1}
                    </span>
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-ink">{step.title}</h2>
                      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </ScrollReveal>
          </section>

          <section className="pt-16 sm:pt-20">
            <div className="section-divider mb-12" />

            <ScrollReveal className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
              <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky">
                    <TerminalSquare className="h-5 w-5 text-sky-strong" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      What matching looks like
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      The SHA256 value returned by PowerShell should match the exact line for the
                      installer you downloaded in SHA256SUMS.txt.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-line bg-paper/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Example installer
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-ink">{fullSetupName}</p>
                </div>

                <div className="mt-4 rounded-2xl border border-line bg-paper/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Example digest format
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-ink">
                    {shortenDigest(github.checksumDigest)}
                  </p>
                </div>
              </article>

              <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint">
                    <FileCheck2 className="h-5 w-5 text-mint-strong" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      If SmartScreen warns
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      That warning does not replace checksum verification. It is exactly why the
                      source and hash should be explicit before first run.
                    </p>
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {[
                    "Confirm the file came from the latest GitHub Release.",
                    "Compare against SHA256SUMS.txt from the same release.",
                    "Only continue when the values match.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-ink-soft">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-mint-strong" />
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
                  Verify first, then install.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  If the checksum matches, go back to the download page or inspect the public
                  release source directly on GitHub.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/download"
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                >
                  Go to download page
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={SITE_LINKS.latestReleaseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-strong"
                >
                  View GitHub Releases
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </ScrollReveal>
          </section>
        </div>
      </main>
    </>
  );
}
