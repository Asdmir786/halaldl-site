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

  const heroChips = [
    "MIT licensed",
    "No account",
    "No telemetry",
    "Windows 10 and 11 x64",
  ];

  const productSignals = [
    {
      title: github.latestVersion,
      body: `Release verified ${github.latestReleaseLabel}`,
      icon: BadgeCheck,
    },
    {
      title: github.licenseName,
      body: "Public source, visible issues, visible releases",
      icon: Github,
    },
    {
      title: "Windows 10/11 x64",
      body: "Scope stays explicit instead of pretending to be universal.",
      icon: LaptopMinimal,
    },
    {
      title: "No account. No telemetry.",
      body: "The product story stays local-first and practical.",
      icon: Eye,
    },
    {
      title: "SHA256SUMS.txt",
      body: `Checksum asset present: ${shortenDigest(github.checksumDigest)}`,
      icon: ShieldCheck,
    },
    {
      title: `${github.openIssues} open issues`,
      body: `Main branch pushed ${github.lastPushedLabel}`,
      icon: TerminalSquare,
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Paste the link and choose a preset.",
      body: "The entry point feels like a desktop utility, not a flags-first wrapper around a CLI.",
    },
    {
      step: "02",
      title: "Queue it or start immediately.",
      body: "The download flow stays explicit so you can see what is active, what is waiting, and what comes next.",
    },
    {
      step: "03",
      title: "Review logs, tools, and history in one place.",
      body: "The app stays diagnosable and honest instead of smoothing real state into a fake SaaS dashboard tone.",
    },
  ];

  const valueCards = [
    {
      title: "Cleaner GUI over yt-dlp",
      body: "HalalDL removes repeated flag work without pretending the engine underneath does not exist.",
      icon: Download,
      accent: "bg-sky/[0.82]",
    },
    {
      title: "Visible raw logs",
      body: "The raw output stays available because trust is better served by clarity than by vague progress text.",
      icon: TerminalSquare,
      accent: "bg-coral/[0.8]",
    },
    {
      title: "Preset-driven workflow",
      body: "Presets make common targets practical while still keeping the choices legible for power users.",
      icon: Sparkles,
      accent: "bg-mint/[0.8]",
    },
    {
      title: "Tools and packaging stay explicit",
      body: "Full and Lite exist because different users want different levels of control over the toolchain.",
      icon: Wrench,
      accent: "bg-sky/[0.82]",
    },
  ];

  const repoFacts = [
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
  ];

  const buttonPrimary =
    "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-paper shadow-[0_18px_38px_rgba(12,26,44,0.16)] transition-transform duration-200 hover:-translate-y-0.5";
  const buttonPrimaryHeader =
    "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-paper shadow-[0_18px_38px_rgba(12,26,44,0.14)] transition-transform duration-200 hover:-translate-y-0.5 sm:px-6 sm:py-3.5";
  const buttonSecondary =
    "inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-paper-strong/82 px-6 py-3.5 text-sm font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5";

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
            <Link className="flex shrink-0 items-center gap-3 text-sm font-semibold text-ink" href="/">
              <Image src="/brand/icon.png" alt="HalalDL icon" width={28} height={28} />
              <span className="font-display text-base tracking-tight">HalalDL</span>
            </Link>

            <nav className="hidden items-center gap-7 text-sm text-ink-soft md:flex">
              <a href="#why">Why</a>
              <a href="#proof">Proof</a>
              <a href="#install">Install</a>
              <a href="#trust">Trust</a>
              <a href="#faq">FAQ</a>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <a className="hidden text-sm font-medium text-ink-soft lg:inline-flex" href={SITE_LINKS.repoUrl}>
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

        <section className="relative pt-8 sm:pt-12">
          <div className="hero-atmosphere absolute inset-x-8 top-10 -z-10 h-[42rem] rounded-[3rem] blur-3xl" />

          <div className="grid gap-10 xl:grid-cols-[minmax(0,0.86fr)_minmax(34rem,0.82fr)] xl:items-start">
            <div className="max-w-[45rem] pt-4">
              <div className="eyebrow">
                <Sparkles className="h-4 w-4" />
                Windows-first yt-dlp GUI
              </div>

              <h1 className="mt-6 max-w-[11ch] font-display text-4xl font-semibold tracking-[-0.06em] text-ink text-balance sm:text-[4.2rem] sm:leading-[0.92]">
                The Windows-first yt-dlp GUI that feels like a real desktop product.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-ink-soft sm:text-lg">
                HalalDL gives Windows users a cleaner path into yt-dlp: presets instead of repeated
                flags, visible raw logs instead of vague progress, honest Full vs Lite install
                choices, and a download path that stays anchored to GitHub Releases.
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
                {heroChips.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-line bg-paper-strong/82 px-4 py-2 text-sm font-medium text-ink-soft"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="glass-card rounded-[1.7rem] p-5">
                  <p className="text-sm font-medium text-ink-soft">Latest release</p>
                  <p className="mt-3 font-display text-2xl font-semibold text-ink">
                    {github.latestVersion}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    Published {github.latestReleaseLabel}
                  </p>
                </div>
                <div className="glass-card rounded-[1.7rem] p-5">
                  <p className="text-sm font-medium text-ink-soft">Public repo</p>
                  <p className="mt-3 font-display text-2xl font-semibold text-ink">
                    {formatCompactNumber(github.stars)} stars
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    Open source with visible issue and release history
                  </p>
                </div>
                <div className="glass-card rounded-[1.7rem] p-5">
                  <p className="text-sm font-medium text-ink-soft">Canonical source</p>
                  <p className="mt-3 font-display text-2xl font-semibold text-ink">GitHub</p>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    Checksums attached. SmartScreen note stated openly.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="glass-panel relative rounded-[2.6rem] p-4 sm:p-5 lg:p-6">
                <div className="ambient-grid absolute inset-0 rounded-[2.6rem] opacity-35" />
                <div className="relative flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
                  <div className="max-w-[33rem]">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-soft">
                      Live release sync
                    </p>
                    <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-[2.2rem]">
                      {github.latestReleaseName}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-ink-soft sm:text-base">
                      {github.releaseNotes}
                    </p>
                  </div>
                  <div className="rounded-full border border-line-strong bg-paper-strong/82 px-4 py-2 text-sm font-medium text-ink-soft">
                    Published {github.latestReleaseLabel}
                  </div>
                </div>

                <div className="mt-5 rounded-[2rem] border border-line-strong bg-paper-strong/82 p-3 shadow-[0_30px_80px_rgba(86,118,156,0.12)]">
                  <div className="screen-shell relative aspect-[1.46/1] overflow-hidden rounded-[1.65rem]">
                    <ThemedScreenshot
                      lightSrc="/screenshots/light/halaldl-downloads.png"
                      darkSrc="/screenshots/halaldl-downloads.png"
                      alt="HalalDL downloads screen"
                      priority
                      sizes="(min-width: 1280px) 41rem, (min-width: 1024px) 36rem, 100vw"
                      imageClassName="object-cover object-top"
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.45rem] border border-line bg-paper-strong/84 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft">
                      Recommended
                    </p>
                    <p className="mt-2 text-base font-semibold text-ink">Full build</p>
                    <p className="mt-2 text-sm leading-6 text-ink-soft">
                      Best for most users and the clearest setup path.
                    </p>
                  </div>
                  <div className="rounded-[1.45rem] border border-line bg-paper-strong/84 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft">
                      Power users
                    </p>
                    <p className="mt-2 text-base font-semibold text-ink">Lite build</p>
                    <p className="mt-2 text-sm leading-6 text-ink-soft">
                      Manage your own tooling if you want tighter control.
                    </p>
                  </div>
                  <div className="rounded-[1.45rem] border border-line bg-paper-strong/84 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft">
                      Verify first
                    </p>
                    <p className="mt-2 text-base font-semibold text-ink">SHA256SUMS.txt</p>
                    <p className="mt-2 text-sm leading-6 text-ink-soft">
                      Confirm the checksum before first run if SmartScreen appears.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-10 sm:pt-12">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {productSignals.map((item) => (
              <article key={item.title} className="glass-card rounded-[1.6rem] p-5">
                <item.icon className="h-5 w-5 text-ink" />
                <p className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{item.body}</p>
              </article>
            ))}
          </div>
          {github.source === "fallback" ? (
            <p className="mt-4 text-sm text-ink-soft">
              Live GitHub metadata is temporarily unavailable. The site is using its checked static
              fallback snapshot so trust notes and release links still resolve correctly.
            </p>
          ) : null}
        </section>

        <section id="why" className="pt-24">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] xl:items-start">
            <div className="max-w-3xl">
              <div className="eyebrow">Why HalalDL</div>
              <h2 className="mt-6 font-display text-4xl font-semibold tracking-[-0.05em] text-ink text-balance sm:text-5xl">
                Keep the power of yt-dlp. Drop the shell-heavy workflow.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-soft">
                The product position is deliberately grounded. HalalDL does not pretend to be a
                cloud platform. It gives Windows users a clear GUI, keeps the raw engine output
                visible, and stays honest about install tradeoffs.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {workflowSteps.map((item) => (
                <article key={item.step} className="glass-card rounded-[1.8rem] p-5 sm:p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink-soft">
                    {item.step}
                  </p>
                  <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-ink-soft sm:text-base">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {valueCards.map((item) => (
              <article key={item.title} className="glass-card rounded-[1.85rem] p-6">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.accent}`}>
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

        <section id="proof" className="pt-24">
          <div className="max-w-3xl">
            <div className="eyebrow">Product Proof</div>
            <h2 className="mt-6 font-display text-4xl font-semibold tracking-[-0.05em] text-ink text-balance sm:text-5xl">
              Show the interface clearly. Let the product do the convincing.
            </h2>
            <p className="mt-6 text-lg leading-8 text-ink-soft">
              The strongest part of the site should be the actual workflow: downloads, presets,
              tools, raw logs, theme settings, and completed history. The motion stays restrained so
              the screenshots remain the main proof.
            </p>
          </div>

          <div className="mt-10">
            <FeatureShowcase stories={FEATURE_STORIES} />
          </div>
        </section>

        <section id="install" className="pt-24">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] xl:items-start">
            <div className="max-w-3xl">
              <div className="eyebrow">Install Choices</div>
              <h2 className="mt-6 font-display text-4xl font-semibold tracking-[-0.05em] text-ink text-balance sm:text-5xl">
                Full, Lite, and WinGet each answer a different trust question.
              </h2>
              <p className="mt-6 text-lg leading-8 text-ink-soft">
                Full is the default recommendation for most people. Lite is for users who prefer to
                manage their own tooling. WinGet stays useful, but the fastest path to the newest
                build is still GitHub Releases.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <article className="glass-card rounded-[2rem] p-6">
                <div className="eyebrow bg-mint/[0.72]">Recommended</div>
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
                <div className="eyebrow bg-sky/[0.74]">Power Users</div>
                <h3 className="mt-5 font-display text-2xl font-semibold text-ink">Lite build</h3>
                <p className="mt-3 text-base leading-7 text-ink-soft">
                  Best if you want to manage `yt-dlp`, `ffmpeg`, `aria2`, and optional runtime
                  support yourself.
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
                <div className="eyebrow bg-paper-strong/82">Package Manager</div>
                <h3 className="mt-5 font-display text-2xl font-semibold text-ink">WinGet</h3>
                <p className="mt-3 text-base leading-7 text-ink-soft">
                  Good for people who already trust package managers, but the catalog can lag behind
                  the newest GitHub release.
                </p>
                <div className="mt-5 rounded-[1.45rem] border border-line-strong bg-paper-strong/84 p-4">
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
          <div className="grid gap-10 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] xl:items-start">
            <div className="max-w-3xl">
              <div className="eyebrow">Trust And Safety</div>
              <h2 className="mt-6 font-display text-4xl font-semibold tracking-[-0.05em] text-ink text-balance sm:text-5xl">
                Keep the trust posture direct, then give people a safe verification path.
              </h2>
              <p className="mt-6 text-lg leading-8 text-ink-soft">
                The site should not dance around the reality of Windows downloads. GitHub Releases is
                canonical, checksums are present, and SmartScreen may warn because installers are not
                code-signed yet.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="glass-card rounded-[2rem] p-7">
                <h3 className="font-display text-2xl font-semibold text-ink">Safe install flow</h3>
                <ol className="mt-6 space-y-5">
                  {[
                    "Download only from GitHub Releases or the /download shortcut on this site.",
                    "Check the attached SHA256SUMS.txt file before first run.",
                    "If SmartScreen appears, verify the source and checksum before continuing.",
                  ].map((step, index) => (
                    <li key={step} className="flex gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky/[0.78] font-semibold text-ink">
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
                <h3 className="font-display text-2xl font-semibold text-ink">
                  Trust signals on the live repo
                </h3>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {repoFacts.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1.4rem] border border-line bg-paper-strong/84 p-4"
                    >
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
          </div>
        </section>

        <section id="faq" className="pt-24">
          <div className="max-w-3xl">
            <div className="eyebrow">FAQ</div>
            <h2 className="mt-6 font-display text-4xl font-semibold tracking-[-0.05em] text-ink text-balance sm:text-5xl">
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
          <div className="glass-panel rounded-[2.5rem] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="max-w-3xl">
                <div className="eyebrow">Final CTA</div>
                <h2 className="mt-6 font-display text-4xl font-semibold tracking-[-0.05em] text-ink text-balance sm:text-5xl">
                  Download from the canonical source and pick the build that matches your setup style.
                </h2>
                <p className="mt-5 text-lg leading-8 text-ink-soft">
                  Latest release is <strong className="text-ink">{github.latestVersion}</strong>,
                  published {github.latestReleaseLabel}. GitHub Releases stays canonical, and the
                  checksum file remains attached on every release.
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

        <footer className="mt-10 flex flex-col gap-4 border-t border-line pt-10 text-sm text-ink-soft md:flex-row md:items-center md:justify-between">
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
