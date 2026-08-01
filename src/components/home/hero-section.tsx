"use client";

import Link from "next/link";

import dynamic from "next/dynamic";
import { BadgeCheck, CalendarClock, Download, ShieldCheck, Sparkles } from "lucide-react";
import { GitHubIcon } from "@/components/icons/github-icon";
import { ThemedScreenshot } from "@/components/themed-screenshot";
import { HeroAtmosphere } from "@/components/home/hero-atmosphere";
import type { GitHubSnapshot } from "@/lib/github";
import { SITE_LINKS } from "@/lib/site";
import { trustSignals } from "@/components/home/home-data";
import { SignalBand, type SignalBandItem, TrustChip, formatCompactNumber } from "@/components/home/home-shared";
import { usePrefersReducedMotion } from "@/components/experience/use-prefers-reduced-motion";

const ProductScrollScene = dynamic(
  () =>
    import("@/components/experience/product-scroll-scene").then((m) => m.ProductScrollSceneCanvas),
  { ssr: false, loading: () => null },
);

function HeroVisualStage({ github }: { github: GitHubSnapshot }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="hero-stage-enter relative lg:pl-2">
      {/* Mobile / reduced motion: real screenshot for LCP + clarity */}
      <div className={reducedMotion ? "block" : "lg:hidden"}>
        <div className="screenshot-frame hero-stage-shell p-3 sm:p-4">
          <div className="screenshot-inner hero-screenshot-inner">
            <ThemedScreenshot
              lightSrc="/releases/0.5.1/promo/hero-light.png"
              darkSrc="/releases/0.5.1/promo/hero-dark.png"
              alt="HalalDL 0.5.1 hero art showing Install Trust, Copy Diagnostics, and support prompts"
              sizes="(min-width: 1024px) 52vw, 100vw"
              priority
              renderMode="active"
              className="inset-0"
              imageClassName="border border-line-strong bg-paper-strong object-cover object-left-top"
            />
          </div>
        </div>
      </div>

      {/* Desktop 3D product stage — replaces the flat screenshot */}
      {!reducedMotion ? (
        <div
          data-hero-3d-stage=""
          className="hero-3d-stage relative hidden overflow-hidden lg:block"
        >
          <ProductScrollScene className="hero-3d-canvas" />
          <div className="hero-3d-stage-fade" aria-hidden="true" />
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)]">
        <div className="surface-elevated rounded-2xl px-4 py-3 shadow-[0_18px_38px_rgba(8,14,23,0.12)] sm:min-w-[9.5rem]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Latest release
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-ink">{github.latestVersion}</p>
          <p className="whitespace-nowrap text-sm text-ink-soft">{github.latestReleaseLabel}</p>
        </div>

        <div className="surface-elevated rounded-2xl px-4 py-3 shadow-[0_18px_40px_rgba(8,14,23,0.14)]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint">
              <BadgeCheck className="h-4.5 w-4.5 text-mint-strong" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Public GitHub releases</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                Open the release assets, then verify SHA256 before first run if you want the extra
                check.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      icon: GitHubIcon,
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
    <section
      id="hero"
      className="relative flex flex-col pt-8 sm:pt-12 lg:min-h-[calc(100vh-7rem)] lg:justify-center lg:pt-20"
    >
      <div className="hero-glow" aria-hidden="true" />
      <HeroAtmosphere />

      <div className="hero-content grid gap-8 sm:gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-10 xl:gap-14">
        <div className="hero-copy-stagger relative z-[1] max-w-xl lg:max-w-none lg:pr-2">
          <div className="hero-copy-item eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Free open-source yt-dlp GUI for Windows
          </div>

          <h1 className="hero-copy-item mt-6 font-display text-[2.45rem] font-semibold leading-[1.02] tracking-normal text-ink sm:text-[3.35rem] lg:text-[4rem] xl:text-[4.35rem]">
            Download media without
            <br className="hidden sm:block" />
            <span className="block text-ink-soft sm:inline">the command line.</span>
          </h1>

          <p className="hero-copy-item mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            A local-first yt-dlp GUI for Windows 10/11 — free, no account, with reusable presets,
            visible logs, and optional tool management.
          </p>

          <div className="hero-copy-item mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/download"
              className="glass-cta inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-3.5 text-[0.95rem] font-semibold transition-all hover:-translate-y-0.5"
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
              <GitHubIcon className="h-4 w-4" />
              View Source
            </a>
          </div>

          <div className="hero-copy-item mt-8 flex flex-wrap gap-2.5">
            {trustSignals.map((signal) => (
              <TrustChip key={signal.label} {...signal} />
            ))}
          </div>
        </div>

        <HeroVisualStage github={github} />
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
