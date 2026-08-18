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

const trustSteps = [
  {
    label: "GitHub Releases only",
    body: "Start from the official release page, not a mirror or repost.",
  },
  {
    label: "Match SHA256SUMS",
    body: "Compare the exact installer with the checksum file attached to that same release.",
  },
  {
    label: "Open the verified build",
    body: "Once the source and digest line up, launch the build with confidence.",
  },
];

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
            body="Use the official release, match its SHA256, then open the verified build. The order is simple on purpose."
            className="max-w-3xl"
          />

          <div className="grid items-start gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            <ScrollReveal>
              <article className="trust-card trust-card-path surface-card-static rounded-[1.75rem] p-6 sm:p-7 lg:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky">
                      <ShieldCheck className="h-5 w-5 text-sky-strong" />
                    </div>
                    <div>
                      <p className="trust-card-kicker">A calm install path</p>
                      <h3 className="mt-1 font-display text-xl font-semibold text-ink">Verify in three steps</h3>
                      <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">
                        Official release first. Check the checksum before opening it.
                      </p>
                    </div>
                  </div>
                  <span className="trust-card-badge">3 checks</span>
                </div>

                <ol className="trust-path-steps mt-7">
                  {trustSteps.map((step, index) => (
                    <li key={step.label} className="trust-path-step">
                      <span>{index + 1}</span>
                      <div className="trust-path-step-copy">
                        <strong>{step.label}</strong>
                        <p>{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="trust-card-footer mt-7">
                  <div>
                    <p className="text-sm font-semibold text-ink">Need the exact command?</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">The verification guide walks through the installer and SHA256 file together.</p>
                  </div>
                  <Link
                    href="/trust/verify-checksum"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2.5 text-sm font-semibold text-paper transition-opacity hover:opacity-85"
                  >
                    Verification guide
                  </Link>
                </div>

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-ink-soft">
                  <a href={github.checksumsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-ink">
                    SHA256SUMS
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a href={SITE_LINKS.supportUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-ink">
                    Support
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            </ScrollReveal>

            <ScrollReveal delay={0.06}>
              <article className="trust-card trust-card-signals surface-card-static rounded-[1.75rem] p-6 sm:p-7 lg:p-8">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint">
                    <GitHubIcon className="h-5 w-5 text-mint-strong" />
                  </div>
                  <div>
                    <p className="trust-card-kicker">Public by default</p>
                    <h3 className="mt-1 font-display text-xl font-semibold text-ink">Project facts</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      Official source, releases, and issues in one place.
                    </p>
                  </div>
                </div>

                <dl className="mt-7 grid gap-3 sm:grid-cols-2">
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

                <div className="trust-source-note mt-6 rounded-2xl border border-mint-strong/20 bg-mint/35 p-4">
                  <p className="text-sm font-semibold text-ink">Inspect the source, not just the promise.</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">The repository, release assets, and issue history are public and connected from here.</p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
