import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Download,
  ExternalLink,
  Eye,
  Github,
  LaptopMinimal,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Wrench,
} from "lucide-react";
import { FeatureShowcase } from "@/components/feature-showcase";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemedScreenshot } from "@/components/themed-screenshot";
import { getGitHubSnapshot } from "@/lib/github";
import { FAQ_ITEMS, FEATURE_STORIES, getSiteUrl, SITE_LINKS } from "@/lib/site";

function formatCompactNumber(input: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(input);
}

function formatMegabytes(input: number | null) {
  if (!input) {
    return "Size varies";
  }

  return `${(input / (1024 * 1024)).toFixed(1)} MB`;
}

function shortenDigest(input: string | null) {
  if (!input) {
    return "Attached with each release";
  }

  const digest = input.replace("sha256:", "");
  return `${digest.slice(0, 10)}...${digest.slice(-8)}`;
}

export default async function Home() {
  const github = await getGitHubSnapshot();
  const siteUrl = getSiteUrl();

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "HalalDL",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Windows 10, Windows 11",
    softwareVersion: github.latestVersion,
    headline: "Windows-first yt-dlp GUI for local-first downloads",
    description:
      "HalalDL is an open-source Windows desktop GUI for yt-dlp with presets, visible raw logs, Full and Lite installers, and no telemetry.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    isAccessibleForFree: true,
    license: "https://opensource.org/licenses/MIT",
    downloadUrl: SITE_LINKS.latestReleaseUrl,
    installUrl: SITE_LINKS.latestReleaseUrl,
    releaseNotes: github.releaseNotes,
    sameAs: [SITE_LINKS.repoUrl, SITE_LINKS.supportUrl, SITE_LINKS.issuesUrl],
    screenshot: [
      new URL("/screenshots/halaldl-downloads.png", siteUrl).toString(),
      new URL("/screenshots/halaldl-presets.png", siteUrl).toString(),
      new URL("/screenshots/halaldl-tools.png", siteUrl).toString(),
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const buttonPrimary =
    "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-paper transition-transform duration-200 hover:-translate-y-0.5";
  const buttonPrimaryHeader =
    "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-paper transition-transform duration-200 hover:-translate-y-0.5 sm:px-6 sm:py-3.5";
  const buttonSecondary =
    "inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-paper-strong/70 px-6 py-3.5 text-sm font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5";

  return (
    <main id="main-content" className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto max-w-[90rem] px-4 pb-20 pt-5 sm:px-6 lg:px-8">
        <header className="glass-panel sticky top-4 z-40 rounded-full px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link className="flex items-center gap-3 text-sm font-semibold text-ink" href="/">
              <Image src="/brand/icon.png" alt="HalalDL icon" width={28} height={28} />
              <span className="font-display text-base tracking-tight">HalalDL</span>
            </Link>

            <nav className="hidden items-center gap-6 text-sm text-ink-soft md:flex">
              <a href="#why">Why</a>
              <a href="#workflow">How it works</a>
              <a href="#install">Install</a>
              <a href="#trust">Trust</a>
              <a href="#faq">FAQ</a>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <a className="hidden sm:inline-flex text-sm font-medium text-ink-soft" href={SITE_LINKS.repoUrl}>
                GitHub
              </a>
              <Link className={buttonPrimaryHeader} href="/download">
                <Download className="h-4 w-4" />
                <span className="sm:hidden">Download</span>
                <span className="hidden sm:inline">Download Latest Release</span>
              </Link>
            </div>
          </div>
        </header>

        <section className="relative pt-10 sm:pt-14">
          <div className="hero-atmosphere absolute inset-x-6 top-20 -z-10 h-[38rem] rounded-[3rem] blur-2xl" />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.14fr)_minmax(20rem,0.86fr)] lg:items-center">
            <div className="max-w-none">
              <div className="eyebrow">
                <Sparkles className="h-4 w-4" />
                Windows-first yt-dlp GUI
              </div>
              <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold tracking-[-0.05em] text-ink text-balance sm:text-5xl lg:text-[4.35rem] lg:leading-[0.92]">
                A Windows-first yt-dlp GUI for local-first desktop downloads.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-ink-soft sm:text-lg">
                HalalDL gives Windows users a cleaner path into yt-dlp: presets instead of repeated
                flags, visible raw logs instead of vague progress, honest Full vs Lite install
                choices, and none of the fake SaaS positioning this kind of utility does not need.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link className={buttonPrimary} href="/download">
                  <Download className="h-4 w-4" />
                  Download Latest Release
                </Link>
                <a
                  className={buttonSecondary}
                  href={SITE_LINKS.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Open source",
                  "No account",
                  "No telemetry",
                  "Windows 10 and 11 x64",
                  "Checksums on releases",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-line-strong bg-paper-strong/70 px-4 py-2 text-sm font-medium text-ink-soft"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="glass-card rounded-[1.75rem] p-5">
                  <p className="text-sm font-medium text-ink-soft">Latest release</p>
                  <p className="mt-3 font-display text-2xl font-semibold text-ink">
                    {github.latestVersion}
                  </p>
                  <p className="mt-2 text-sm text-ink-soft">Published {github.latestReleaseLabel}</p>
                </div>
                <div className="glass-card rounded-[1.75rem] p-5 hero-float hero-float-delay">
                  <p className="text-sm font-medium text-ink-soft">Public repo</p>
                  <p className="mt-3 font-display text-2xl font-semibold text-ink">
                    {formatCompactNumber(github.stars)} stars
                  </p>
                  <p className="mt-2 text-sm text-ink-soft">MIT and visible release history</p>
                </div>
                <div className="glass-card rounded-[1.75rem] p-5 hero-float-slow">
                  <p className="text-sm font-medium text-ink-soft">Install trust</p>
                  <p className="mt-3 font-display text-2xl font-semibold text-ink">SHA256</p>
                  <p className="mt-2 text-sm text-ink-soft">SmartScreen note is stated openly</p>
                </div>
              </div>
            </div>

            <div className="relative lg:max-w-[35rem] lg:justify-self-end lg:pl-2">
              <div className="glass-panel relative rounded-[2.3rem] p-3 sm:p-4">
                <div className="ambient-grid absolute inset-0 rounded-[2.3rem] opacity-55" />
                <div className="relative overflow-hidden rounded-[1.8rem] border border-line-strong bg-paper-strong/70 p-2 shadow-[0_28px_70px_rgba(81,108,140,0.18)]">
                  <div className="screen-shell relative aspect-[1.58/1] overflow-hidden rounded-[1.35rem]">
                    <ThemedScreenshot
                      lightSrc="/screenshots/light/halaldl-downloads.png"
                      darkSrc="/screenshots/halaldl-downloads.png"
                      alt="HalalDL downloads screen"
                      priority
                      sizes="(min-width: 1280px) 39rem, (min-width: 1024px) 35rem, 100vw"
                      imageClassName="object-cover object-top"
                    />
                  </div>
                </div>

                <div className="glass-card hero-float absolute -left-3 top-10 w-52 rounded-[1.6rem] p-4 sm:-left-10 sm:w-60">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
                    Release
                  </p>
                  <p className="mt-2 font-display text-xl font-semibold text-ink">
                    {github.latestReleaseName}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-ink-soft">{github.releaseNotes}</p>
                </div>

                <div className="glass-card hero-float hero-float-delay absolute -right-3 top-8 w-44 rounded-[1.4rem] p-4 sm:-right-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
                    Install paths
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-ink-soft">
                    <p className="rounded-2xl bg-mint/[0.55] px-3 py-2 font-medium text-ink">Full: recommended</p>
                    <p className="rounded-2xl bg-sky/[0.55] px-3 py-2 font-medium text-ink">Lite: power users</p>
                    <p className="rounded-2xl border border-line bg-paper-strong/70 px-3 py-2 font-medium text-ink">WinGet: can lag</p>
                  </div>
                </div>

                <div className="glass-card hero-float-slow absolute bottom-6 left-5 max-w-[16rem] rounded-[1.5rem] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
                    Trust note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    Installers are not code-signed yet. Download from GitHub Releases and verify the
                    checksum before first run.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {[
              {
                title: github.latestVersion,
                body: `Release published ${github.latestReleaseLabel}`,
                icon: BadgeCheck,
              },
              {
                title: github.licenseName,
                body: "Open-source repo with public issue flow",
                icon: Github,
              },
              {
                title: "Windows 10/11 x64",
                body: "Scope is explicit. No fake cross-platform promise.",
                icon: LaptopMinimal,
              },
              {
                title: "No account. No telemetry.",
                body: "Local-first product story backed by the current docs.",
                icon: Eye,
              },
              {
                title: "SHA256SUMS.txt",
                body: `Digest file present: ${shortenDigest(github.checksumDigest)}`,
                icon: ShieldCheck,
              },
              {
                title: `${github.openIssues} open issues`,
                body: `Main branch pushed ${github.lastPushedLabel}`,
                icon: TerminalSquare,
              },
            ].map((item) => (
              <div key={item.title} className="glass-card rounded-[1.6rem] p-5">
                <item.icon className="h-5 w-5 text-ink" />
                <p className="mt-4 font-display text-lg font-semibold text-ink">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{item.body}</p>
              </div>
            ))}
          </div>
          {github.source === "fallback" ? (
            <p className="mt-4 text-sm text-ink-soft">
              Live GitHub metadata is temporarily unavailable. The page is using a checked static
              release snapshot so links and trust notes still resolve correctly.
            </p>
          ) : null}
        </section>

        <section id="why" className="pt-24">
          <div className="max-w-3xl">
            <div className="eyebrow">Why HalalDL</div>
            <h2 className="mt-6 font-display text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">
              Built for people who want the strength of yt-dlp without a terminal-first workflow.
            </h2>
            <p className="mt-6 text-lg leading-8 text-ink-soft">
              The product is deliberately practical. It does not pretend to be a cloud platform. It
              gives Windows users a clean GUI, preserves the raw engine output, and stays honest
              about install tradeoffs.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Cleaner GUI over yt-dlp",
                body: "Paste a URL, pick a preset, choose queue or start now, and keep the rest readable.",
                icon: Download,
              },
              {
                title: "Visible raw logs",
                body: "The project's trust posture is to show the engine output instead of smoothing it into vague status text.",
                icon: TerminalSquare,
              },
              {
                title: "Preset-driven workflow",
                body: "Good defaults matter. Presets reduce repetitive flag setup without hiding what the app is doing.",
                icon: Sparkles,
              },
              {
                title: "Tools and packaging stay explicit",
                body: "Full and Lite exist because different users want different levels of control over the toolchain.",
                icon: Wrench,
              },
            ].map((item) => (
              <article key={item.title} className="glass-card rounded-[1.9rem] p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky/[0.65]">
                  <item.icon className="h-5 w-5 text-ink" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-ink-soft">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="pt-24">
          <div className="flex max-w-3xl flex-col gap-6">
            <div className="eyebrow">How It Works</div>
            <h2 className="font-display text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">
              Explain the workflow in under a minute, then prove it with the interface.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Paste a URL and pick the right preset.",
                body: "HalalDL starts with an obvious entry point instead of assuming the user already knows the CLI flags.",
              },
              {
                step: "02",
                title: "Choose queue or immediate start.",
                body: "The workflow stays explicit. You can see what is queued, what is active, and what is next.",
              },
              {
                step: "03",
                title: "Inspect output, installs, and history in one app.",
                body: "Presets, tools, logs, and later history all live in the same utility instead of across scattered docs and shells.",
              },
            ].map((item) => (
              <article key={item.step} className="glass-card rounded-[1.9rem] p-6 sm:p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink-soft">
                  {item.step}
                </p>
                <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-ink-soft">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pt-24">
          <div className="max-w-3xl">
            <div className="eyebrow">Feature Story</div>
            <h2 className="mt-6 font-display text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">
              A modern open-source landing page should show the product, not just describe it.
            </h2>
            <p className="mt-6 text-lg leading-8 text-ink-soft">
              This section stays screenshot-led. The art direction is polished, but the proof still
              comes from the actual workflow: downloads, presets, tool management, and visible raw
              logs.
            </p>
          </div>

          <div className="mt-10">
            <FeatureShowcase stories={FEATURE_STORIES} />
          </div>
        </section>

        <section id="install" className="pt-24">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="max-w-2xl">
              <div className="eyebrow">Install Choices</div>
              <h2 className="mt-6 font-display text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">
                Full, Lite, and WinGet all belong on the page because they answer different trust questions.
              </h2>
              <p className="mt-6 text-lg leading-8 text-ink-soft">
                The safest marketing posture here is clarity. Full is recommended for most users.
                Lite is for people who want to manage their own tooling. WinGet is convenient, but
                it can lag behind the latest GitHub release.
              </p>
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
              <article className="glass-card rounded-[2rem] p-6">
                <div className="eyebrow bg-mint/[0.55]">Recommended</div>
                <h3 className="mt-5 font-display text-2xl font-semibold text-ink">Full build</h3>
                <p className="mt-3 text-base leading-7 text-ink-soft">
                  Best for most users. Easier setup, app-managed tools, and the clearest install
                  path.
                </p>
                <p className="mt-5 text-sm font-medium text-ink-soft">
                  Current setup file: {formatMegabytes(github.fullSetupSize)}
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <a
                    className={buttonPrimary}
                    href={github.fullSetupUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download Full Setup
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <a
                    className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft"
                    href={SITE_LINKS.latestReleaseUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View release page <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </article>

              <article className="glass-card rounded-[2rem] p-6">
                <div className="eyebrow bg-sky/[0.55]">Power Users</div>
                <h3 className="mt-5 font-display text-2xl font-semibold text-ink">Lite build</h3>
                <p className="mt-3 text-base leading-7 text-ink-soft">
                  Best if you prefer managing yt-dlp, ffmpeg, aria2, and optional runtime support
                  yourself.
                </p>
                <p className="mt-5 text-sm font-medium text-ink-soft">
                  Current setup file: {formatMegabytes(github.liteSetupSize)}
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <a
                    className={buttonSecondary}
                    href={github.liteSetupUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download Lite Setup
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <a
                    className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft"
                    href={SITE_LINKS.supportUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read support notes <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </article>

              <article className="glass-card rounded-[2rem] p-6">
                <div className="eyebrow bg-paper-strong/70">Convenience</div>
                <h3 className="mt-5 font-display text-2xl font-semibold text-ink">WinGet</h3>
                <p className="mt-3 text-base leading-7 text-ink-soft">
                  Useful for people who already trust package managers, but the catalog can lag
                  behind the newest GitHub release.
                </p>
                <div className="mt-5 rounded-[1.35rem] border border-line-strong bg-paper-strong/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft">
                    Command
                  </p>
                  <code className="mt-3 block overflow-x-auto text-sm font-semibold text-ink">
                    {SITE_LINKS.wingetCommand}
                  </code>
                </div>
                <p className="mt-4 text-sm leading-6 text-ink-soft">
                  Fastest path to the newest build is still GitHub Releases.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="trust" className="pt-24">
          <div className="max-w-3xl">
            <div className="eyebrow">Trust And Safety</div>
            <h2 className="mt-6 font-display text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">
              State the risk profile clearly, then give the user a safe verification path.
            </h2>
            <p className="mt-6 text-lg leading-8 text-ink-soft">
              The right trust posture is direct: GitHub Releases is canonical, checksums are present,
              and Windows SmartScreen may warn because installers are not code-signed yet.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <article className="glass-card rounded-[2rem] p-7">
              <h3 className="font-display text-2xl font-semibold text-ink">Safe install flow</h3>
              <ol className="mt-6 space-y-5">
                {[
                  "Download only from GitHub Releases or the /download shortcut on this site.",
                  "Check the attached SHA256SUMS.txt file before first run.",
                  "If SmartScreen appears, verify the source and checksum before continuing.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky/[0.65] font-semibold text-ink">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-base leading-7 text-ink-soft">{step}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  className={buttonSecondary}
                  href={github.checksumsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View SHA256SUMS.txt
                </a>
                <a
                  className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft"
                  href={SITE_LINKS.supportUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Support docs <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </article>

            <article className="glass-card rounded-[2rem] p-7">
              <h3 className="font-display text-2xl font-semibold text-ink">Trust signals on the live repo</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: "Repo URL",
                    value: "github.com/Asdmir786/HalalDL",
                  },
                  {
                    label: "Latest release",
                    value: `${github.latestVersion} on ${github.latestReleaseLabel}`,
                  },
                  {
                    label: "License",
                    value: github.licenseName,
                  },
                  {
                    label: "Last pushed",
                    value: github.lastPushedLabel,
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.4rem] border border-line-strong bg-paper-strong/72 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft">
                      {item.label}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-ink">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  className={buttonSecondary}
                  href={SITE_LINKS.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Inspect the source
                </a>
                <a
                  className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft"
                  href={SITE_LINKS.issuesUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Report a bug <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </article>
          </div>
        </section>

        <section id="faq" className="pt-24">
          <div className="max-w-3xl">
            <div className="eyebrow">FAQ</div>
            <h2 className="mt-6 font-display text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">
              The answers people need before they trust a Windows download utility.
            </h2>
          </div>

          <div className="mt-10 grid gap-4">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="glass-card rounded-[1.7rem] p-6">
                <summary className="cursor-pointer list-none font-display text-2xl font-semibold text-ink">
                  {item.question}
                </summary>
                <p className="mt-4 max-w-4xl text-base leading-7 text-ink-soft">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="pt-24">
          <div className="glass-panel rounded-[2.4rem] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="max-w-3xl">
                <div className="eyebrow">Final CTA</div>
                <h2 className="mt-6 font-display text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">
                  Download from the canonical source and start with the build that matches your setup style.
                </h2>
                <p className="mt-5 text-lg leading-8 text-ink-soft">
                  Latest release is <strong className="text-ink">{github.latestVersion}</strong>,
                  published {github.latestReleaseLabel}. GitHub Releases stays canonical, and the
                  checksum file stays attached on every release.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link className={buttonPrimary} href="/download">
                  Download Latest Release
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  className={buttonSecondary}
                  href={SITE_LINKS.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-line pt-10 text-sm text-ink-soft md:flex-row md:items-center md:justify-between">
          <p>HalalDL is a Windows-first, local-first desktop GUI for yt-dlp.</p>
          <div className="flex flex-wrap gap-4">
            <a href={SITE_LINKS.supportUrl} target="_blank" rel="noreferrer">
              Support
            </a>
            <a href={SITE_LINKS.issuesUrl} target="_blank" rel="noreferrer">
              Issues
            </a>
            <a href={SITE_LINKS.latestReleaseUrl} target="_blank" rel="noreferrer">
              Releases
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
