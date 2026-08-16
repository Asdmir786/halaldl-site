import Link from "next/link";
import { ArrowUpRight, CopyCheck, Crown, ExternalLink, FolderArchive } from "lucide-react";
import { InstallCardsScroll } from "@/components/experience/install-cards-scroll";
import { MotionField } from "@/components/ui/motion-field";
import { SectionIntro, SectionShell, formatMegabytes } from "@/components/home/home-shared";
import type { GitHubSnapshot } from "@/lib/github";

export function InstallSection({ github }: { github: GitHubSnapshot }) {
  return (
    <SectionShell>
      <div className="section-divider mb-16" />

      <div className="grid gap-10">
        <MotionField className="install-intro-reveal max-w-3xl">
          <SectionIntro
            id="install"
            eyebrow="Install"
            title="Portable, Lite, or Full."
            accent="See each path, then pick the one that fits."
            body="Full is the easy default. Lite keeps the engines explicit. Portable keeps the app, tools, and settings in one folder."
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
              href="/download"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-ink-soft"
            >
              All download options
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </MotionField>

        <InstallCardsScroll>
          {/* Finale row order: Full → Lite → Portable */}
          <article
            data-install-card="full"
            className="install-card-primary overflow-hidden rounded-[1.5rem] p-6"
          >
            <div className="relative flex h-full flex-col">
              <div
                data-install-crown=""
                className="install-crown absolute -top-1 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-mint text-mint-strong shadow-[0_10px_28px_rgba(14,116,104,0.35)]"
                aria-hidden="true"
              >
                <Crown className="h-5 w-5" />
              </div>

              <div className="flex items-center justify-between gap-3 pr-12">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-mint-strong">
                  Recommended
                </div>
                <span className="rounded-full border border-sky-strong/30 bg-sky px-3 py-1 text-xs font-semibold text-sky-strong">
                  {formatMegabytes(github.fullSetupSize)}
                </span>
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold text-ink">Full build</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                The recommended Windows path: less setup, fewer missing dependencies.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "Bundled setup for Windows",
                  "Public releases and checksums",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ink-soft">
                    <CopyCheck className="mt-0.5 h-4 w-4 shrink-0 text-mint-strong" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto grid gap-3 pt-6">
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

          <article
            data-install-card="lite"
            className="install-card-secondary rounded-[1.5rem] p-6"
          >
            <div className="flex h-full flex-col">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sky px-3 py-1 text-xs font-semibold text-sky-strong">
                Power users
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">Lite build</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Bring your own yt-dlp, FFmpeg, aria2, and related tools.
              </p>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
                {formatMegabytes(github.liteSetupSize)}
              </p>
              <a
                href={github.liteSetupUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-paper-strong px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper"
              >
                Download Lite
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </article>

          <article
            data-install-card="portable"
            className="install-card-secondary rounded-[1.5rem] p-6"
          >
            <div className="flex h-full flex-col">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink-muted">
                <FolderArchive className="h-3.5 w-3.5" />
                No-install ZIP
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">Portable</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                No install: keep the app, settings, and managed tools in one folder.
              </p>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
                {formatMegabytes(github.portableZipSize)}
              </p>
              <a
                href={github.portableZipUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-paper-strong px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper"
              >
                Download Portable
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </article>
        </InstallCardsScroll>
      </div>
    </SectionShell>
  );
}
