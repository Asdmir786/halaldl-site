import Link from "next/link";
import { BadgeCheck, CalendarClock, Download, Github, ShieldCheck, Sparkles } from "lucide-react";
import { ThemedScreenshot } from "@/components/themed-screenshot";
import type { GitHubSnapshot } from "@/lib/github";
import { SITE_LINKS } from "@/lib/site";
import { trustSignals } from "@/components/home/home-data";
import { SignalBand, type SignalBandItem, TrustChip, formatCompactNumber } from "@/components/home/home-shared";

export function HeroSection({ github }: { github: GitHubSnapshot }) {
  const signalBandItems: SignalBandItem[] = [
    {
      icon: Download,
      label: "Latest release",
      value: github.latestVersion,
      detail: `Published ${github.latestReleaseLabel}`,
    },
    {
      icon: CalendarClock,
      label: "Public since",
      value: github.firstPublicVersion,
      detail: github.firstPublicReleaseLabel,
    },
    {
      icon: Github,
      label: "GitHub stars",
      value: formatCompactNumber(github.stars),
      detail: "Source, issues, and releases stay public",
    },
    {
      icon: ShieldCheck,
      label: "License",
      value: github.licenseName,
      detail: "MIT licensed with public GitHub releases",
    },
  ];

  return (
    <section className="relative flex flex-col pt-8 sm:pt-12 lg:min-h-[calc(100vh-7rem)] lg:justify-center lg:pt-20">
      <div className="hero-glow" aria-hidden="true" />

      <div className="grid gap-8 sm:gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-12 xl:gap-16">
        <div className="hero-copy-enter max-w-xl lg:max-w-none lg:pr-4">
          <div className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Open-source Windows downloader
          </div>

          <h1 className="mt-6 font-display text-[2.6rem] font-semibold leading-[0.98] tracking-[-0.05em] text-ink sm:text-[3.35rem] lg:text-[4rem] xl:text-[4.35rem]">
            The yt-dlp interface
            <br className="hidden sm:block" />
            <span className="block text-ink-soft sm:inline">Windows deserves.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Quick tray flow instead of repeated shell work. Subtitle-aware presets, visible raw
            logs, and safer app-update checks. Download from GitHub Releases, then verify SHA256
            if you want the extra trust step before first run.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/download"
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-ink px-6 py-3.5 text-[0.95rem] font-semibold text-paper shadow-[0_18px_36px_rgba(12,25,41,0.16)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_46px_rgba(12,25,41,0.2)]"
            >
              <Download className="h-4 w-4" />
              Download {github.latestVersion}
            </Link>
            <a
              href={SITE_LINKS.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line-strong bg-paper-strong px-5 py-3.5 text-[0.95rem] font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-ink/20 hover:bg-paper-elevated"
            >
              <Github className="h-4 w-4" />
              View Source
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {trustSignals.map((signal) => (
              <TrustChip key={signal.label} {...signal} />
            ))}
          </div>
        </div>

        <div className="hero-stage-enter relative lg:pl-2">
          <div className="screenshot-frame hero-stage-shell p-3 sm:p-4">
            <div className="screenshot-inner hero-screenshot-inner">
              <ThemedScreenshot
                lightSrc="/releases/0.4.0/promo/hero.png"
                darkSrc="/releases/0.4.0/promo/hero-dark.png"
                alt="HalalDL 0.4.0 hero art showing quick flow, presets, and update experience"
                sizes="(min-width: 1280px) 680px, (min-width: 1024px) 52vw, 100vw"
                priority
                renderMode="paired"
                className="inset-0"
                imageClassName="border border-line-strong bg-paper-strong object-cover object-left-top"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)]">
            <div className="surface-elevated rounded-2xl px-4 py-3 shadow-[0_18px_38px_rgba(12,25,41,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Latest release
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-ink">{github.latestVersion}</p>
              <p className="text-sm text-ink-soft">{github.latestReleaseLabel}</p>
            </div>

            <div className="surface-elevated rounded-2xl px-4 py-3 shadow-[0_18px_40px_rgba(12,25,41,0.14)]">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint">
                  <BadgeCheck className="h-4.5 w-4.5 text-mint-strong" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">Public GitHub releases</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                    Open the release assets, then verify SHA256 before first run if you want the
                    extra check.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-band-enter mt-10 lg:mt-12">
        <SignalBand items={signalBandItems} animated={false} />
      </div>

      {github.source === "fallback" && (
        <p className="mt-8 rounded-lg border border-amber bg-amber/50 px-4 py-3 text-sm text-ink-soft">
          Live GitHub data is temporarily unavailable. Showing the last checked release snapshot
          instead.
        </p>
      )}
    </section>
  );
}
