import { ChevronRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionShell } from "@/components/home/home-shared";
import { FAQ_ITEMS } from "@/lib/site";

export function FaqSection() {
  return (
    <SectionShell id="faq">
      <div className="section-divider mb-16" />

      <ScrollReveal className="max-w-2xl">
        <div className="eyebrow">FAQ</div>
        <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
          Common questions.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-ink-soft">
          The answers here should remove the practical uncertainty: install path, SmartScreen,
          telemetry, Windows support, and where updates really ship first.
        </p>
      </ScrollReveal>

      <div className="mt-10 grid gap-3 lg:grid-cols-2">
        {FAQ_ITEMS.map((item, index) => (
          <ScrollReveal key={item.question} delay={(index % 6) * 0.03}>
            <details className="faq-item group rounded-2xl p-5">
              <summary className="flex cursor-pointer items-start justify-between gap-4">
                <span className="font-display text-base font-semibold text-ink">{item.question}</span>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.answer}</p>
            </details>
          </ScrollReveal>
        ))}
      </div>
    </SectionShell>
  );
}
