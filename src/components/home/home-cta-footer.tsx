import Link from "next/link";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { MotionField } from "@/components/ui/motion-field";
import { FooterReveal } from "@/components/home/footer-reveal";
import { HOME_FOOTER_GROUPS } from "@/components/home/home-footer-data";
import type { GitHubSnapshot } from "@/lib/github";
import { SITE_LINKS } from "@/lib/site";

export function HomeCtaFooter({ github }: { github: GitHubSnapshot }) {
  return (
    <>
      <MotionField className="homepage-cta-reveal pt-28 sm:pt-32">
        <section className="surface-elevated overflow-hidden rounded-[2rem] p-8 sm:p-10 lg:p-12" aria-labelledby="ready-heading">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <div className="eyebrow">Ready</div>
              <h2 id="ready-heading" className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">
                Pick the build, then install with confidence.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
                Latest public release is <strong className="text-ink">{github.latestVersion}</strong>, published {github.latestReleaseLabel}.
                Public releases have been available since <strong className="text-ink">{github.firstPublicVersion}</strong>.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/download" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3.5 text-[0.95rem] font-semibold text-paper transition-all hover:-translate-y-0.5">
                Download latest
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={SITE_LINKS.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line-strong px-5 py-3.5 text-[0.95rem] font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-ink/20">
                View on GitHub
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </MotionField>

      <FooterReveal>
        <div className="home-footer-shell">
          <div className="home-footer-main">
            <div className="home-footer-brand">
              <Link href="/" className="inline-flex items-center gap-2.5" aria-label="HalalDL home">
                <BrandLogo size={30} />
                <span className="font-display text-lg font-semibold tracking-[-0.02em] text-ink">HalalDL</span>
              </Link>
              <p>
                A local-first yt-dlp GUI for Windows. Free, open source, account-free, and designed to keep the download workflow understandable.
              </p>
              <div className="home-footer-release" aria-label="Latest release information">
                <span>Latest release</span>
                <strong>{github.latestVersion}</strong>
                <span>{github.latestReleaseLabel}</span>
              </div>
              <div className="home-footer-actions">
                <a href={SITE_LINKS.latestReleaseUrl} target="_blank" rel="noreferrer" className="home-footer-primary-link">
                  <Download className="h-4 w-4" />
                  Download latest
                </a>
                <a href={SITE_LINKS.repoUrl} target="_blank" rel="noreferrer" className="home-footer-secondary-link">
                  <ArrowUpRight className="h-4 w-4" />
                  Source code
                </a>
              </div>
            </div>

            <nav className="home-footer-nav" aria-label="Footer navigation">
              {HOME_FOOTER_GROUPS.map((group) => (
                <div className="home-footer-nav-group" key={group.label}>
                  <p>{group.label}</p>
                  <ul>
                    {group.links.map((link) => (
                      <li key={link.label}>
                        {link.external ? (
                          <a href={link.href} target="_blank" rel="noreferrer">
                            {link.label}
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        ) : (
                          <Link href={link.href}>{link.label}</Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="home-footer-bottom">
            <p>© 2026 HalalDL. Released under the MIT License.</p>
            <div>
              <span>Windows 10/11 x64</span>
              <span aria-hidden="true">•</span>
              <span>No account</span>
              <span aria-hidden="true">•</span>
              <span>No telemetry</span>
            </div>
          </div>
        </div>
      </FooterReveal>
    </>
  );
}
