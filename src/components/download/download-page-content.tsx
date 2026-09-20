import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck2,
  FolderArchive,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { CURRENT_RELEASE } from "@/content/releases/registry";
import type { GitHubSnapshot } from "@/lib/github";
import { SITE_LINKS } from "@/lib/site";
import { ThemedScreenshot } from "@/components/themed-screenshot";
import { SiteHeader } from "@/components/home/home-header";
import { ProductRelatedGuides } from "@/components/guides/product-related-guides";
import { MotionField } from "@/components/ui/motion-field";
import { CopyCommand } from "@/components/ui/copy-command";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { TrackedAnchor } from "@/components/analytics/tracked-link";
import { OpenInHalalDl } from "@/components/handoff/open-in-halaldl";
import { formatMegabytes, shortenDigest } from "@/components/home/home-shared";


type DownloadPageContentProps = {
  github: GitHubSnapshot;
};

const verificationSteps = [
  {
    label: "Use the release page",
    body: "Start with the Full, Lite, or Portable asset attached to the official GitHub Release.",
    icon: Download,
  },
  {
    label: "Match the checksum",
    body: "Open SHA256SUMS.txt from that same release when you want an integrity check before first run.",
    icon: FileCheck2,
  },
  {
    label: "Keep the source visible",
    body: "If Windows asks for confirmation, verify the source and checksum before deciding how to continue.",
    icon: ShieldCheck,
  },
];

export function DownloadPageContent({ github }: DownloadPageContentProps) {
  const heroMedia = CURRENT_RELEASE.changelogMedia!;

  return (
    <main id="main-content" className="overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pb-20">
        <SiteHeader currentPage="download" />
        <nav aria-label="Breadcrumb" className="mt-6 flex items-center gap-2 text-sm text-ink-muted">
          <Link href="/" className="transition-colors hover:text-ink">Home</Link>
          <span>/</span>
          <span className="font-medium text-ink">Download</span>
        </nav>

        <MotionField className="download-hero-reveal relative mt-7 overflow-hidden rounded-[2rem] border border-line bg-paper/65 p-6 sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-mint/70 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-56 w-56 rounded-full bg-sky/80 blur-3xl" aria-hidden="true" />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div className="max-w-xl">
              <div className="eyebrow">
                <BadgeCheck className="h-3.5 w-3.5" />
                Official GitHub releases
              </div>
              <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl lg:text-[3.65rem]">
                Download HalalDL
                <span className="block text-ink-soft">for Windows.</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
                Full is the recommended first install. Lite is for people who want more control over the toolchain. Portable stays self-contained when you prefer a folder you can carry and replace yourself.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-mint-strong/25 bg-mint px-3 py-1.5 text-sm font-semibold text-mint-strong">
                  {github.latestVersion} · {github.latestReleaseLabel}
                </span>
                <span className="rounded-full border border-line bg-paper-strong/85 px-3 py-1.5 text-sm text-ink-soft">Windows 10/11 x64</span>
                <span className="rounded-full border border-line bg-paper-strong/85 px-3 py-1.5 text-sm text-ink-soft">MIT licensed</span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <TrackedAnchor analyticsEvent={{ name: "download_channel_select", properties: { channel: "full", surface: "download_hero" } }} href={github.fullSetupUrl} target="_blank" rel="noreferrer" className="glass-cta inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all hover:-translate-y-0.5">
                  <Download className="h-4 w-4" />
                  Download Full
                  <ArrowUpRight className="h-4 w-4" />
                </TrackedAnchor>
                <TrackedAnchor analyticsEvent={{ name: "download_channel_select", properties: { channel: "checksums", surface: "download_hero" } }} href={github.checksumsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-paper-strong px-5 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-paper">
                  <FileCheck2 className="h-4 w-4" />
                  Verify SHA256
                </TrackedAnchor>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-ink-soft">
                <Link href="/compare/full-vs-lite" className="hover:text-ink">Compare Full vs Lite</Link>
                <Link href="/install/windows" className="hover:text-ink">Windows install guide</Link>
                <Link href="/changelog" className="hover:text-ink">What changed in {github.latestVersion}</Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="screenshot-frame p-3 shadow-[0_24px_64px_rgba(8,14,23,0.2)]">
                <div className="feature-stage min-h-[15rem] sm:min-h-[21rem]">
                  <ThemedScreenshot
                    lightSrc={heroMedia.lightSrc}
                    darkSrc={heroMedia.darkSrc}
                    alt={heroMedia.alt}
                    sizes="(min-width: 1024px) 620px, 100vw"
                    renderMode="active"
                    className="inset-0"
                    imageClassName="border border-line-strong bg-paper-strong object-contain"
                  />
                </div>
              </div>
              <div className="absolute -bottom-4 -left-3 hidden rounded-2xl border border-line bg-paper-strong/95 px-4 py-3 shadow-lg sm:block">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">Current release</p>
                <p className="mt-1 text-sm font-semibold text-ink">{CURRENT_RELEASE.title}</p>
              </div>
            </div>
          </div>
        </MotionField>

        <section className="pt-16 sm:pt-20">
          <ScrollReveal>
            <div className="max-w-2xl">
              <div className="eyebrow"><PackageCheck className="h-3.5 w-3.5" /> Choose your build</div>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">One recommended path. Two deliberate alternatives.</h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft">Start with what you need today. Every option comes from the same public release, and verification stays available beside the install path.</p>
            </div>
          </ScrollReveal>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.9fr_0.9fr]">
            <ScrollReveal delay={0.04} className="install-card-primary rounded-[1.9rem] p-6 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full bg-mint px-3 py-1 text-xs font-semibold text-mint-strong">Recommended</span>
                  <h3 className="mt-5 font-display text-3xl font-semibold text-ink">Full build</h3>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft sm:text-base">The best first install for most people. It keeps the setup path smoother so you can focus on the app rather than toolchain decisions.</p>
                </div>
                <span className="rounded-full border border-mint-strong/20 bg-paper-strong/60 px-3 py-1 text-xs font-semibold text-mint-strong">{formatMegabytes(github.fullSetupSize)}</span>
              </div>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {["Recommended default", "Smoother first-run path", "Official GitHub release", "SHA256 available"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-ink-soft"><CheckCircle2 className="h-4 w-4 shrink-0 text-mint-strong" />{item}</li>
                ))}
              </ul>
              <TrackedAnchor analyticsEvent={{ name: "download_channel_select", properties: { channel: "full", surface: "download_builds" } }} href={github.fullSetupUrl} target="_blank" rel="noreferrer" className="glass-cta mt-7 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5">Download Full <ArrowUpRight className="h-4 w-4" /></TrackedAnchor>
            </ScrollReveal>

            <ScrollReveal delay={0.11} className="surface-card-static rounded-[1.75rem] p-6">
              <span className="inline-flex rounded-full bg-sky px-3 py-1 text-xs font-semibold text-sky-strong">Hands-on setup</span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-ink">Lite build</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">For people who already prefer to manage yt-dlp, ffmpeg, aria2, and their wider setup boundary directly.</p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{formatMegabytes(github.liteSetupSize)}</p>
              <TrackedAnchor analyticsEvent={{ name: "download_channel_select", properties: { channel: "lite", surface: "download_builds" } }} href={github.liteSetupUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-ink-soft">Download Lite <ArrowUpRight className="h-4 w-4" /></TrackedAnchor>
            </ScrollReveal>

            <ScrollReveal delay={0.18} className="surface-card-static rounded-[1.75rem] p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink-muted"><FolderArchive className="h-3.5 w-3.5" /> Self-contained</span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-ink">Portable</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">A self-contained folder when you prefer to carry the app or replace the release folder manually when you update.</p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{formatMegabytes(github.portableZipSize)}</p>
              <TrackedAnchor analyticsEvent={{ name: "download_channel_select", properties: { channel: "portable", surface: "download_builds" } }} href={github.portableZipUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-ink-soft">Download Portable <ArrowUpRight className="h-4 w-4" /></TrackedAnchor>
            </ScrollReveal>
          </div>
        </section>

        <OpenInHalalDl surface="download_page" className="mt-12" />

        <section className="pt-16 sm:pt-20">
          <details className="rounded-[1.75rem] border border-line bg-paper/55 p-5 sm:p-7">
            <summary className="cursor-pointer list-none font-display text-2xl font-semibold text-ink [&::-webkit-details-marker]:hidden">Other install and discovery options</summary>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">Open this for WinGet and Chocolatey commands, plus the AlternativeTo listing.</p>
          <div>
            <div className="mt-8 max-w-2xl">
              <div className="eyebrow"><ExternalLink className="h-3.5 w-3.5" /> Other ways to find HalalDL</div>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">Package-manager installs and independent discovery.</h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft">GitHub Releases remains the canonical source. WinGet covers every build, Chocolatey provides the Full build, and AlternativeTo helps people compare HalalDL with other tools.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">WinGet package IDs</p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ink">Choose the build you want to install.</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">The catalog can lag behind GitHub Releases, especially when a new Portable manifest is still propagating.</p>
              <div className="mt-5 grid gap-3">
                <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">Full</p><CopyCommand command={SITE_LINKS.wingetCommands.full} /></div>
                <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">Lite</p><CopyCommand command={SITE_LINKS.wingetCommands.lite} /></div>
                <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">Portable</p><CopyCommand command={SITE_LINKS.wingetCommands.portable} /></div>
              </div>
            </article>

            <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Discovery and comparison</p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ink">Find HalalDL on AlternativeTo.</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">See the public HalalDL profile, compare similar software, and help people discover the project outside package catalogs.</p>
              <a href={SITE_LINKS.alternativeToUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper-strong px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper">Open AlternativeTo listing <ExternalLink className="h-4 w-4" /></a>
              <div className="mt-6 rounded-xl border border-line bg-paper/65 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">Chocolatey · Full build</p>
                <div className="mt-3"><CopyCommand command={SITE_LINKS.chocolateyCommand} /></div>
                <a href={SITE_LINKS.chocolateyUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-ink hover:text-ink-soft">View the approved package <ExternalLink className="h-3.5 w-3.5" /></a>
                <p className="mt-3 text-xs leading-relaxed text-ink-muted">Community moderation can make Chocolatey trail the newest GitHub release.</p>
              </div>
            </article>
          </div>
          </details>
        </section>

        <section className="pt-16 sm:pt-20">
          <div className="section-divider mb-12" />
          <ScrollReveal className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div>
              <div className="eyebrow"><ShieldCheck className="h-3.5 w-3.5" /> Verify before first run</div>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">Three quiet checks. No vague trust pitch.</h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft">The practical path is direct: use the official release, compare the checksum if you want an integrity check, and keep the public source visible when Windows asks for confirmation.</p>
              <div className="mt-6 rounded-2xl border border-line bg-paper/70 p-4 text-sm text-ink-soft">
                <span className="font-semibold text-ink">Checksum sample:</span> <span className="break-all">{shortenDigest(github.checksumDigest)}</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={github.checksumsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper-strong px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper">Open SHA256SUMS.txt <ExternalLink className="h-4 w-4" /></a>
                <Link href="/trust/verify-checksum" className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-strong">Windows verification guide</Link>
              </div>
            </div>
            <div className="grid gap-3">
              {verificationSteps.map((step, index) => {
                const Icon = step.icon;
                return <article key={step.label} className="surface-card-static flex gap-4 rounded-2xl p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky text-sm font-semibold text-sky-strong">0{index + 1}</div>
                  <div><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-mint-strong" /><h3 className="font-semibold text-ink">{step.label}</h3></div><p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p></div>
                </article>;
              })}
            </div>
          </ScrollReveal>
        </section>

        <section className="pt-16 sm:pt-20">
          <ScrollReveal className="flex flex-wrap items-center justify-between gap-5 rounded-[1.75rem] border border-line bg-paper/70 p-6 sm:p-7">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Public release trail</p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-ink">See the source, release notes, and support path.</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{github.latestReleaseName} is published through the same public GitHub origin as the source code, checksums, and issue tracker.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={github.latestReleaseUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90">View release <ExternalLink className="h-4 w-4" /></a>
              <a href={SITE_LINKS.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper-strong px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper">Inspect source <ExternalLink className="h-4 w-4" /></a>
            </div>
          </ScrollReveal>
        </section>

        <ProductRelatedGuides slug="best-yt-dlp-gui-windows" />
      </div>
    </main>
  );
}
