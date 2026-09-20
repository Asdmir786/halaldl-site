import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MotionField } from "@/components/ui/motion-field";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionShell } from "@/components/home/home-shared";
import { FAQ_ITEMS } from "@/lib/site";

export function FaqSection() {
  return (
    <SectionShell>
      <MotionField className="faq-experience" id="faq">
        <div className="section-divider mb-16" />

        <div className="max-w-2xl scroll-mt-24 sm:scroll-mt-28">
          <ScrollReveal>
            <div className="eyebrow">FAQ</div>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
              Common questions.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-soft">
              The answers here should remove the practical uncertainty: install path, SmartScreen,
              telemetry, Windows support, and where updates really ship first.
            </p>
          </ScrollReveal>
        </div>

        <div className="faq-grid mt-10 grid gap-3 lg:grid-cols-2">
          {FAQ_ITEMS.slice(0, 6).map((item, index) => (
            <ScrollReveal key={item.question} delay={(index % 6) * 0.03}>
              <details className="faq-item group rounded-2xl p-5">
                <summary className="flex cursor-pointer items-start justify-between gap-4">
                  <span className="font-display text-base font-semibold text-ink">{item.question}</span>
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-90" />
                </summary>
                <div className="faq-answer-grid">
                  <p className="faq-answer-content text-sm leading-relaxed text-ink-soft">{item.answer}</p>
                </div>
              </details>
            </ScrollReveal>
          ))}
        </div>

        {FAQ_ITEMS.length > 6 ? (
          <details className="mt-5 rounded-2xl border border-line bg-paper/55 p-4 sm:p-5">
            <summary className="cursor-pointer font-semibold text-ink">Show {FAQ_ITEMS.length - 6} more questions</summary>
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {FAQ_ITEMS.slice(6).map((item) => (
                <details key={item.question} className="faq-item group rounded-2xl p-5">
                  <summary className="flex cursor-pointer items-start justify-between gap-4">
                    <span className="font-display text-base font-semibold text-ink">{item.question}</span>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="faq-answer-grid">
                    <p className="faq-answer-content text-sm leading-relaxed text-ink-soft">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </details>
        ) : null}

        <ScrollReveal className="mt-8">
          <nav
            aria-label="Related HalalDL guides"
            className="faq-guides flex flex-wrap gap-3 rounded-lg border border-line bg-paper/70 p-4"
          >
            {[
              { href: "/download", label: "Download HalalDL" },
              {
                href: "/guides/best-yt-dlp-gui-windows",
                label: "Best yt-dlp GUI for Windows",
              },
              { href: "/compare/full-vs-lite", label: "Compare Full vs Lite" },
              { href: "/install/windows", label: "Install on Windows" },
              { href: "/trust/verify-checksum", label: "Verify SHA256" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-line bg-paper-strong px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-paper"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </ScrollReveal>
      </MotionField>
    </SectionShell>
  );
}
