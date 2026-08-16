"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Download, ShieldCheck, Sparkles } from "lucide-react";
import { GitHubIcon } from "@/components/icons/github-icon";
import { LocalControlRoom } from "@/components/home/local-control-room";
import { CURRENT_RELEASE } from "@/content/releases/registry";
import type { GitHubSnapshot } from "@/lib/github";
import { SITE_LINKS } from "@/lib/site";
import { usePrefersReducedMotion } from "@/components/experience/use-prefers-reduced-motion";

gsap.registerPlugin(useGSAP);

const RELEASE_HOME = CURRENT_RELEASE.homepage!;

function HeroCopy({ github }: { github: GitHubSnapshot }) {
  const copyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = copyRef.current;
      if (!root || reducedMotion) return;

      const headline = root.querySelector<HTMLElement>(".control-room-headline");
      const eyebrow = root.querySelector(".control-room-eyebrow");
      const supporting = root.querySelector(".control-room-supporting");
      const actions = root.querySelectorAll(".control-room-action");
      const proof = root.querySelector(".control-room-proof");
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (eyebrow) timeline.fromTo(eyebrow, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.42 }, 0);
      if (headline) timeline.fromTo(headline, { y: 18, filter: "blur(3px)" }, { y: 0, filter: "blur(0px)", duration: 0.62 }, 0.08);
      if (supporting) timeline.fromTo(supporting, { opacity: 0, y: 17 }, { opacity: 1, y: 0, duration: 0.5 }, 0.28);
      if (actions.length) timeline.fromTo(actions, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.07 }, 0.43);
      if (proof) timeline.fromTo(proof, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 }, 0.58);
    },
    { scope: copyRef, dependencies: [reducedMotion] },
  );

  return (
    <div ref={copyRef} className="local-control-copy">
      <div className="control-room-eyebrow eyebrow">
        <Sparkles className="h-3.5 w-3.5" />
        {RELEASE_HOME.eyebrow}
      </div>

      <h1 className="control-room-headline mt-6 font-display text-[2.55rem] font-semibold leading-[0.98] tracking-[-0.04em] text-ink sm:text-[3.45rem] lg:text-[4.25rem] xl:text-[4.85rem]">
        Choose it.
        <br />
        <span className="text-ink-soft">Keep it local.</span>
      </h1>

      <p className="control-room-supporting mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
        HalalDL is a local yt-dlp GUI for Windows. Preview supported links, select what matters, choose your output, and keep completed media under your control.
      </p>

      <div className="control-room-capabilities mt-5" aria-label="Core product capabilities">
        <span>Playlist control</span>
        <span>Video & audio output</span>
        <span>Download Doctor</span>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link href="/download" className="control-room-action glass-cta inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-3.5 text-[0.95rem] font-semibold transition-all hover:-translate-y-0.5">
          <Download className="h-4 w-4" />
          Download {github.latestVersion}
        </Link>
        <a
          href={SITE_LINKS.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="control-room-action inline-flex items-center justify-center gap-2 rounded-2xl border border-line-strong bg-paper-strong px-5 py-3.5 text-[0.95rem] font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-ink/20 hover:bg-paper-elevated"
        >
          <GitHubIcon className="h-4 w-4" />
          View Source
        </a>
      </div>

      <div className="control-room-proof mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-muted">
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-mint-strong" /> Free & local</span>
        <span>No account</span>
        <span>No telemetry</span>
        <span>{github.latestVersion} · {github.latestReleaseLabel}</span>
      </div>
    </div>
  );
}

export function HeroSection({ github }: { github: GitHubSnapshot }) {
  return (
    <section id="hero" className="local-control-hero relative overflow-hidden pt-8 sm:pt-12 lg:min-h-[calc(100vh-6.5rem)] lg:pt-20">
      <div className="local-control-hero-noise" aria-hidden="true" />
      <div className="local-control-hero-depth" aria-hidden="true" />

      <div className="local-control-layout grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-6 xl:gap-10">
        <HeroCopy github={github} />
        <LocalControlRoom github={github} />
      </div>

      {github.source === "fallback" && (
        <p className="mt-8 rounded-lg border border-amber bg-amber/50 px-4 py-3 text-sm text-ink-soft">
          Live GitHub data is temporarily unavailable. Showing the last checked release snapshot instead.
        </p>
      )}
    </section>
  );
}
