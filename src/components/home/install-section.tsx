import { ArrowUpRight, CopyCheck, ExternalLink, Package } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CopyCommand } from "@/components/ui/copy-command";
import { SectionIntro, SectionShell, formatMegabytes } from "@/components/home/home-shared";
import type { GitHubSnapshot } from "@/lib/github";
import { SITE_LINKS } from "@/lib/site";

export function InstallSection({ github }: { github: GitHubSnapshot }) {
  return (
    <SectionShell>
      <div className="section-divider mb-16" />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="lg:max-w-md">
          <SectionIntro
            id="install"
            eyebrow="Install"
            title="Full, Lite, or WinGet."
            accent="Pick the path that matches how hands-on you want to be."
            body="Full is the default for most users. Lite is for people who want direct control over yt-dlp, ffmpeg, aria2, and optional runtime pieces. WinGet is convenient, but the download page is the better place to choose deliberately."
          />
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/compare/full-vs-lite"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-ink-soft"
            >
              Compare Full vs Lite
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/install/windows"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-ink-soft"
            >
              Windows install guide
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <ScrollReveal className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="install-card-primary overflow-hidden rounded-[1.75rem] p-6">
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-mint-strong">
                Recommended
              </div>
              <div className="mt-5 flex items-start justify-between gap-5">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-ink">Full build</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                    Best first install for most people. The app handles more of the setup path so
                    you spend less time chasing binaries.
                  </p>
                </div>
                <span className="hidden rounded-full border border-sky-strong/30 bg-sky px-3 py-1 text-xs font-semibold text-sky-strong sm:inline-flex">
                  {formatMegabytes(github.fullSetupSize)}
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {[
                  "Recommended for most users",
                  "Smoother first-run path",
                  "Matches the site's trust-first install story",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ink-soft">
                    <CopyCheck className="mt-0.5 h-4 w-4 shrink-0 text-mint-strong" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={github.fullSetupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper transition-all hover:opacity-90"
                >
                  Download Full
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href={github.checksumsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-paper-strong px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper"
                >
                  Open SHA256SUMS.txt
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </article>

          <div className="grid gap-4">
            <article className="install-card-secondary rounded-[1.5rem] p-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-sky px-3 py-1 text-xs font-semibold text-sky-strong">
                Power users
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">Lite build</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Better when you already manage your own yt-dlp, ffmpeg, aria2, or related tooling
                and want that boundary to stay explicit.
              </p>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
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

            <article className="install-card-secondary rounded-[1.5rem] p-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink-muted">
                <Package className="h-3.5 w-3.5" />
                Package manager
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">WinGet</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Good for convenience and easy updates. Just do not assume it is the fastest path
                to the newest release.
              </p>
              <div className="mt-5">
                <CopyCommand command={SITE_LINKS.wingetCommand} />
              </div>
            </article>
          </div>
        </ScrollReveal>
      </div>
    </SectionShell>
  );
}
