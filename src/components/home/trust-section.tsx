import { ExternalLink, Github, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionIntro, SectionShell, shortenDigest } from "@/components/home/home-shared";
import type { GitHubSnapshot } from "@/lib/github";
import { SITE_LINKS } from "@/lib/site";

export function TrustSection({ github }: { github: GitHubSnapshot }) {
  const repoSignals = [
    { label: "Repository", value: "github.com/Asdmir786/HalalDL" },
    { label: "Latest release", value: `${github.latestVersion} · ${github.latestReleaseLabel}` },
    {
      label: "First public release",
      value: `${github.firstPublicVersion} · ${github.firstPublicReleaseLabel}`,
    },
    { label: "Checksum sample", value: shortenDigest(github.checksumDigest) },
  ];

  return (
    <SectionShell>
      <div className="section-divider mb-16" />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16">
        <SectionIntro
          id="trust"
          eyebrow="Trust"
          title="Direct about downloads."
          accent="Clear verification path."
          body="GitHub Releases is canonical. SHA256SUMS.txt is attached. SmartScreen may warn because the installers are not code-signed yet. That should read like a practical checklist, not a vague reassurance panel."
          className="lg:max-w-md"
        />

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <ScrollReveal>
            <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky">
                  <ShieldCheck className="h-5 w-5 text-sky-strong" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">Download path</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    The safe path is visible: download from GitHub Releases, verify SHA256, then
                    decide how you want to handle the SmartScreen warning.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  "Download only from the GitHub Releases page.",
                  "Open SHA256SUMS.txt and verify the installer before first run.",
                  "If SmartScreen warns, verify source plus checksum before continuing.",
                ].map((item, index) => (
                  <div key={item} className="rounded-2xl border border-line bg-paper/70 p-4">
                    <div className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky text-xs font-semibold text-sky-strong">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-ink-soft">{item}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/trust/verify-checksum"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-ink-soft"
                >
                  Windows verification guide
                </Link>
                <a
                  href={github.checksumsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-ink-soft"
                >
                  View SHA256SUMS.txt
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href={SITE_LINKS.supportUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
                >
                  Support docs
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          </ScrollReveal>

          <ScrollReveal delay={0.06}>
            <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint">
                  <Github className="h-5 w-5 text-mint-strong" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">Public repo facts</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Source, release history, and issue tracking stay tied to one public origin.
                  </p>
                </div>
              </div>

              <dl className="mt-6 space-y-3">
                {repoSignals.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-line bg-paper/70 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      {item.label}
                    </dt>
                    <dd className="mt-2 break-all text-sm font-medium leading-relaxed text-ink">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a
                  href={SITE_LINKS.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between rounded-2xl border border-line bg-paper/60 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper"
                >
                  Inspect source
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href={SITE_LINKS.issuesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between rounded-2xl border border-line bg-paper/60 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper"
                >
                  Open issues
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </article>
          </ScrollReveal>
        </div>
      </div>
    </SectionShell>
  );
}
