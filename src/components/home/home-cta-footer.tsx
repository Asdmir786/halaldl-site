import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { GitHubSnapshot } from "@/lib/github";
import { SITE_LINKS } from "@/lib/site";

export function HomeCtaFooter({ github }: { github: GitHubSnapshot }) {
  return (
    <>
      <ScrollReveal className="pt-28 sm:pt-32">
        <div className="surface-elevated overflow-hidden rounded-[2rem] p-8 sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <div className="eyebrow">Ready</div>
              <h2 className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">
                Download the latest build with the trust path intact.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
                Latest public release is <strong className="text-ink">{github.latestVersion}</strong>,
                published {github.latestReleaseLabel}. Public release history goes back to{" "}
                <strong className="text-ink">{github.firstPublicVersion}</strong> on{" "}
                {github.firstPublicReleaseLabel}.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href="/download"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3.5 text-[0.95rem] font-semibold text-paper transition-all hover:-translate-y-0.5"
              >
                Download latest
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={SITE_LINKS.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line-strong px-5 py-3.5 text-[0.95rem] font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-ink/20"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <footer className="mt-16 border-t border-line pt-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
          <div className="rounded-[1.75rem] border border-line bg-paper-strong/75 p-6 sm:p-7">
            <div className="flex items-center gap-2.5">
              <Image src="/brand/icon.png" alt="HalalDL" width={24} height={24} className="rounded" />
              <span className="font-display text-base font-semibold text-ink">HalalDL</span>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Windows-first, local-first desktop GUI for yt-dlp. Open source, GitHub Releases
              distributed, and built around visible workflow state instead of hidden shell logic.
            </p>
            <p className="mt-3 text-sm text-ink-muted">
              © 2026 HalalDL. MIT licensed. Latest release {github.latestVersion}.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-line bg-paper-strong/75 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Explore
              </p>
              <nav className="mt-3 flex flex-col gap-2 text-sm" aria-label="Footer navigation">
                <Link href="/download" className="text-ink-soft transition-colors hover:text-ink">
                  Download
                </Link>
                <Link href="/changelog" className="text-ink-soft transition-colors hover:text-ink">
                  Changelog
                </Link>
                <Link
                  href="/compare/full-vs-lite"
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  Full vs Lite
                </Link>
                <Link
                  href="/install/windows"
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  Install on Windows
                </Link>
                <Link
                  href="/trust/verify-checksum"
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  Verify checksums
                </Link>
                <a href="#features" className="text-ink-soft transition-colors hover:text-ink">
                  Features
                </a>
                <a href="#install" className="text-ink-soft transition-colors hover:text-ink">
                  Install
                </a>
                <a href="#trust" className="text-ink-soft transition-colors hover:text-ink">
                  Trust
                </a>
              </nav>
            </div>
            <div className="rounded-[1.5rem] border border-line bg-paper-strong/75 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Project
              </p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <a
                  href={SITE_LINKS.latestReleaseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  Releases
                </a>
                <a
                  href={SITE_LINKS.issuesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  Issues
                </a>
                <a
                  href={SITE_LINKS.supportUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  Support
                </a>
                <a
                  href={SITE_LINKS.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
