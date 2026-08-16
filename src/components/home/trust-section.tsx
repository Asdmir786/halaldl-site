import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { GitHubIcon } from "@/components/icons/github-icon";
import { MotionField } from "@/components/ui/motion-field";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionIntro, SectionShell, shortenDigest } from "@/components/home/home-shared";
import type { GitHubSnapshot } from "@/lib/github";
import { SITE_LINKS } from "@/lib/site";

function TrustAtmosphere() {
  return (
    <div className="trust-atmosphere" aria-hidden="true">
      <span className="trust-atmosphere-orb trust-atmosphere-orb-a" />
      <span className="trust-atmosphere-orb trust-atmosphere-orb-b" />
      <span className="trust-atmosphere-node trust-atmosphere-node-a" />
      <span className="trust-atmosphere-node trust-atmosphere-node-b" />
      <span className="trust-atmosphere-node trust-atmosphere-node-c" />
    </div>
  );
}

export function TrustSection({ github }: { github: GitHubSnapshot }) {
  const repoSignals = [
    { label: "Repository", value: "Asdmir786/HalalDL" },
    { label: "Latest release", value: `${github.latestVersion} · ${github.latestReleaseLabel}` },
    {
      label: "First public release",
      value: `${github.firstPublicVersion} · ${github.firstPublicReleaseLabel}`,
    },
    { label: "Checksum sample", value: shortenDigest(github.checksumDigest) },
  ];

  return (
    <SectionShell>
      <MotionField className="trust-experience relative isolate overflow-hidden rounded-[2rem] px-0 py-1">
        <TrustAtmosphere />
        <div className="relative z-10 section-divider mb-16" />

        <div className="relative z-10 grid gap-10">
          <SectionIntro
            id="trust"
            eyebrow="Trust"
            title="Verify before first run."
            accent="Three quick checks."
            body="Use the official release, match its SHA256, then open the verified build."
            className="max-w-3xl"
          />

          <div className="grid items-stretch gap-4 lg:grid-cols-2">
            <ScrollReveal>
              <article className="trust-card trust-card-path surface-card-static h-full rounded-[1.75rem] p-6 sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky">
                    <ShieldCheck className="h-5 w-5 text-sky-strong" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink">Verify in three steps</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      Official release first. Check the checksum before opening it.
                    </p>
                  </div>
                </div>

                <ol className="trust-path-steps mt-6">
                  {[
                    "GitHub Releases only",
                    "Match SHA256SUMS",
                    "Open the verified build",
                  ].map((item, index) => (
                    <li key={item} className="trust-path-step">
                      <span>{index + 1}</span>
                      <strong>{item}</strong>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/trust/verify-checksum"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-ink-soft"
                  >
                    Verification guide
                  </Link>
                  <a
                    href={github.checksumsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-ink-soft"
                  >
                    SHA256SUMS
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={SITE_LINKS.supportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
                  >
                    Support
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            </ScrollReveal>

            <ScrollReveal delay={0.06}>
              <article className="trust-card trust-card-signals surface-card-static h-full rounded-[1.75rem] p-6 sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint">
                    <GitHubIcon className="h-5 w-5 text-mint-strong" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink">Project facts</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      Official source, releases, and issues in one place.
                    </p>
                  </div>
                </div>

                <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                  {repoSignals.map((item) => (
                    <div key={item.label} className="trust-repo-signal rounded-2xl border border-line bg-paper/70 p-4">
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                        {item.label}
                      </dt>
                      <dd className="mt-2 text-sm font-medium leading-relaxed text-ink [overflow-wrap:anywhere]">
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
      </MotionField>
    </SectionShell>
  );
}
