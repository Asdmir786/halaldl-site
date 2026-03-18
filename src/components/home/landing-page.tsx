import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  Github,
  LaptopMinimal,
  Package,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Wrench,
} from "lucide-react";
import { FeatureShowcase } from "@/components/feature-showcase";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemedScreenshot } from "@/components/themed-screenshot";
import type { GitHubSnapshot } from "@/lib/github";
import { FAQ_ITEMS, FEATURE_STORIES, SITE_LINKS } from "@/lib/site";

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
    return "Attached with release";
  }

  const digest = input.replace("sha256:", "");
  return `${digest.slice(0, 8)}...${digest.slice(-6)}`;
}

const trustSignals = [
  { label: "MIT License", icon: FileCheck },
  { label: "No Account", icon: Eye },
  { label: "No Telemetry", icon: ShieldCheck },
  { label: "Windows 10/11", icon: LaptopMinimal },
];

const workflowSteps = [
  {
    num: "01",
    title: "Paste and choose a preset",
    body: "URL input and preset selection happen on one surface. No flags, no guessing.",
  },
  {
    num: "02",
    title: "Queue or start immediately",
    body: "The download flow stays explicit. See what is active, waiting, and completed.",
  },
  {
    num: "03",
    title: "Review logs and history",
    body: "Raw output stays visible. The app is diagnosable, not a mystery.",
  },
];

const valueProps = [
  {
    icon: Download,
    title: "Cleaner GUI over yt-dlp",
    body: "Removes repeated flag work without hiding the engine underneath.",
  },
  {
    icon: TerminalSquare,
    title: "Visible raw logs",
    body: "Raw output stays available because clarity beats vague progress.",
  },
  {
    icon: Sparkles,
    title: "Preset-driven workflow",
    body: "Common targets become practical while keeping choices legible.",
  },
  {
    icon: Wrench,
    title: "Full vs Lite is explicit",
    body: "Different users want different control over the toolchain.",
  },
];

type LandingPageProps = {
  github: GitHubSnapshot;
};

export function LandingPage({ github }: LandingPageProps) {
  return (
    <main id="main-content" className="overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-4 sm:px-8">
        <header className="header-bar sticky top-3 z-40 rounded-xl px-4 py-2.5 sm:px-5">
          <div className="flex items-center justify-between">
            <Link className="flex items-center gap-2.5" href="/">
              <Image src="/brand/icon.png" alt="HalalDL" width={26} height={26} className="rounded" />
              <span className="font-display text-[0.9375rem] font-semibold tracking-tight text-ink">
                HalalDL
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
              {["Features", "Install", "Trust", "FAQ"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-line hover:text-ink"
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <a
                href={SITE_LINKS.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-line hover:text-ink lg:flex"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
              <a
                href="/download"
                className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition-all hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </a>
            </div>
          </div>
        </header>

        <section className="relative pt-16 sm:pt-20 lg:pt-24">
          <div className="hero-glow" aria-hidden="true" />

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            <div className="max-w-xl lg:max-w-none lg:pt-4">
              <div className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                Open Source Windows GUI
              </div>

              <h1 className="mt-6 font-display text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]">
                The yt-dlp interface
                <br className="hidden sm:block" />
                <span className="text-ink-soft">Windows deserves.</span>
              </h1>

              <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg sm:leading-relaxed lg:max-w-lg">
                Presets instead of flags. Visible raw logs instead of vague progress. Full vs Lite
                install choices. Downloads anchored to GitHub Releases.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="/download"
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-ink px-6 py-3.5 text-[0.9375rem] font-semibold text-paper shadow-lg shadow-ink/10 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ink/15"
                >
                  <Download className="h-4 w-4" />
                  Download {github.latestVersion}
                </a>
                <a
                  href={SITE_LINKS.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-paper-strong px-5 py-3.5 text-[0.9375rem] font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-ink/20 hover:bg-paper-elevated"
                >
                  <Github className="h-4 w-4" />
                  View Source
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {trustSignals.map((signal) => (
                  <span
                    key={signal.label}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper-strong/60 px-3 py-1.5 text-xs font-medium text-ink-soft"
                  >
                    <signal.icon className="h-3.5 w-3.5" />
                    {signal.label}
                  </span>
                ))}
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-8">
                <div>
                  <p className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                    {github.latestVersion}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">Latest release</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                    {formatCompactNumber(github.stars)}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">GitHub stars</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                    {github.licenseName.split(" ")[0]}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">License</p>
                </div>
              </div>
            </div>

            <div className="relative lg:-mr-8 xl:-mr-16">
              <div className="screenshot-frame p-3 sm:p-4">
                <div className="screenshot-inner">
                  <ThemedScreenshot
                    lightSrc="/screenshots/light/halaldl-downloads.png"
                    darkSrc="/screenshots/halaldl-downloads.png"
                    alt="HalalDL downloads screen showing queue management and preset selection"
                    sizes="(min-width: 1280px) 640px, (min-width: 1024px) 50vw, 100vw"
                    imageClassName="origin-top scale-[1.12] border border-line-strong object-cover object-[28%_0%]"
                  />
                </div>
              </div>

              <div className="absolute -bottom-4 left-4 right-4 sm:left-6 sm:right-auto">
                <div className="surface-elevated inline-flex items-center gap-3 rounded-xl px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mint">
                    <BadgeCheck className="h-4 w-4 text-mint-strong" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">Released {github.latestReleaseLabel}</p>
                    <p className="text-xs text-ink-muted">GitHub Releases is canonical</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {github.source === "fallback" && (
            <p className="mt-10 rounded-lg border border-amber bg-amber/50 px-4 py-3 text-sm text-ink-soft">
              Live GitHub data temporarily unavailable. Showing cached release info.
            </p>
          )}
        </section>

        <section id="features" className="pt-28 sm:pt-32">
          <div className="section-divider mb-16" />

          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div>
              <div className="eyebrow">Why HalalDL</div>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
                Keep yt-dlp&apos;s power.
                <br />
                <span className="text-ink-soft">Drop the shell workflow.</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-soft lg:max-w-md">
                HalalDL stays deliberately grounded. A clear GUI for Windows users, visible engine
                output, and honest install tradeoffs.
              </p>
              <a
                href="#install"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-ink-soft"
              >
                See install options
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {workflowSteps.map((step) => (
                <article key={step.num} className="surface-card rounded-2xl p-5">
                  <span className="font-display text-xs font-semibold text-ink-muted">{step.num}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {valueProps.map((prop) => (
              <article key={prop.title} className="surface-card rounded-2xl p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky">
                  <prop.icon className="h-5 w-5 text-sky-strong" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-ink">{prop.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{prop.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pt-28 sm:pt-32">
          <div className="section-divider mb-16" />

          <div className="max-w-2xl">
            <div className="eyebrow">Product Proof</div>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
              The interface speaks for itself.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-soft">
              Downloads, presets, tools, raw logs, settings, and history. The screenshots are the
              proof.
            </p>
          </div>

          <div className="mt-12">
            <FeatureShowcase stories={FEATURE_STORIES} />
          </div>
        </section>

        <section id="install" className="pt-28 sm:pt-32">
          <div className="section-divider mb-16" />

          <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
            <div>
              <div className="eyebrow">Install</div>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
                Full, Lite, or WinGet.
                <br />
                <span className="text-ink-soft">Pick your path.</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-soft lg:max-w-md">
                Full is the default for most. Lite if you manage your own tooling. WinGet works but
                may lag behind GitHub Releases.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <article className="install-card-primary relative overflow-hidden rounded-2xl p-5">
                <div className="relative">
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-mint px-2 py-1 text-xs font-semibold text-mint-strong">
                    Recommended
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold text-ink">Full</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Easiest setup. App-managed tools.
                  </p>
                  <p className="mt-4 text-xs font-medium text-ink-muted">
                    {formatMegabytes(github.fullSetupSize)}
                  </p>
                  <a
                    href={github.fullSetupUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition-all hover:opacity-90"
                  >
                    Download Full
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>

              <article className="install-card-secondary rounded-2xl p-5">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-sky px-2 py-1 text-xs font-semibold text-sky-strong">
                  Power Users
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">Lite</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Manage yt-dlp, ffmpeg yourself.
                </p>
                <p className="mt-4 text-xs font-medium text-ink-muted">
                  {formatMegabytes(github.liteSetupSize)}
                </p>
                <a
                  href={github.liteSetupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-line-strong bg-paper-strong px-4 py-2.5 text-sm font-semibold text-ink transition-all hover:border-ink/20"
                >
                  Download Lite
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </article>

              <article className="install-card-secondary rounded-2xl p-5">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-paper-elevated px-2 py-1 text-xs font-semibold text-ink-muted">
                  <Package className="h-3 w-3" />
                  Package Manager
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">WinGet</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  May lag behind releases.
                </p>
                <div className="mt-4 rounded-lg border border-line bg-paper-elevated p-3">
                  <code className="block overflow-x-auto text-xs font-medium text-ink">
                    {SITE_LINKS.wingetCommand}
                  </code>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="trust" className="pt-28 sm:pt-32">
          <div className="section-divider mb-16" />

          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div>
              <div className="eyebrow">Trust</div>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
                Direct about downloads.
                <br />
                <span className="text-ink-soft">Clear verification path.</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-soft lg:max-w-md">
                GitHub Releases is canonical. Checksums are present. SmartScreen may warn because
                installers aren&apos;t code-signed yet.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="surface-card-static rounded-2xl p-6">
                <h3 className="font-display text-lg font-semibold text-ink">Safe install flow</h3>
                <ol className="mt-5 space-y-4">
                  {[
                    "Download only from GitHub Releases",
                    "Check SHA256SUMS.txt before first run",
                    "If SmartScreen warns, verify checksum",
                  ].map((step, i) => (
                    <li key={step} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky text-xs font-semibold text-sky-strong">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-ink-soft">{step}</span>
                    </li>
                  ))}
                </ol>
                <a
                  href={github.checksumsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-ink-soft"
                >
                  View SHA256SUMS.txt
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </article>

              <article className="surface-card-static rounded-2xl p-6">
                <h3 className="font-display text-lg font-semibold text-ink">Live repo signals</h3>
                <dl className="mt-5 space-y-4">
                  {[
                    { label: "Repository", value: "github.com/Asdmir786/HalalDL" },
                    { label: "Latest", value: github.latestVersion },
                    { label: "License", value: github.licenseName },
                    { label: "Checksum", value: shortenDigest(github.checksumDigest) },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4">
                      <dt className="text-sm text-ink-muted">{item.label}</dt>
                      <dd className="text-right text-sm font-medium text-ink">{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <a
                  href={SITE_LINKS.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-ink-soft"
                >
                  Inspect the source
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </article>
            </div>
          </div>
        </section>

        <section id="faq" className="pt-28 sm:pt-32">
          <div className="section-divider mb-16" />

          <div className="max-w-2xl">
            <div className="eyebrow">FAQ</div>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
              Common questions.
            </h2>
          </div>

          <div className="mt-10 grid gap-3 lg:grid-cols-2">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="faq-item group rounded-xl p-5">
                <summary className="flex cursor-pointer items-start justify-between gap-4">
                  <span className="font-display text-base font-semibold text-ink">{item.question}</span>
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="pt-28 sm:pt-32">
          <div className="surface-elevated overflow-hidden rounded-2xl p-8 sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">
                  Ready to download?
                </h2>
                <p className="mt-3 max-w-lg text-base leading-relaxed text-ink-soft">
                  Latest release is <strong className="text-ink">{github.latestVersion}</strong>,
                  published {github.latestReleaseLabel}. Checksums attached.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <a
                  href="/download"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-[0.9375rem] font-semibold text-paper transition-all hover:-translate-y-0.5"
                >
                  Download Latest
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={SITE_LINKS.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong px-5 py-3.5 text-[0.9375rem] font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-ink/20"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-16 flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-muted">
            HalalDL is a Windows-first, local-first desktop GUI for yt-dlp.
          </p>
          <nav className="flex flex-wrap gap-5 text-sm" aria-label="Footer navigation">
            <a
              href={SITE_LINKS.supportUrl}
              target="_blank"
              rel="noreferrer"
              className="text-ink-soft hover:text-ink"
            >
              Support
            </a>
            <a
              href={SITE_LINKS.issuesUrl}
              target="_blank"
              rel="noreferrer"
              className="text-ink-soft hover:text-ink"
            >
              Issues
            </a>
            <a
              href={SITE_LINKS.latestReleaseUrl}
              target="_blank"
              rel="noreferrer"
              className="text-ink-soft hover:text-ink"
            >
              Releases
            </a>
          </nav>
        </footer>
      </div>
    </main>
  );
}
