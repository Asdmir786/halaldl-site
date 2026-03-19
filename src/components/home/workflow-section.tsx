import { ChevronRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { valueProps, workflowSteps } from "@/components/home/home-data";
import { SectionIntro, SectionShell } from "@/components/home/home-shared";

export function WorkflowSection() {
  return (
    <SectionShell>
      <div className="section-divider mb-16" />

      <div className="grid gap-12 lg:grid-cols-[minmax(17rem,0.74fr)_minmax(0,1.26fr)] lg:items-start lg:gap-16 xl:gap-20">
        <div data-workflow-copy className="lg:sticky lg:top-28 lg:max-w-md lg:pb-10">
          <SectionIntro
            id="features"
            eyebrow="Workflow"
            title="Keep yt-dlp's power."
            accent="Drop the shell routine."
            body="The goal is not to cosplay a terminal inside a card. The flow should feel guided enough for normal use, while keeping the underlying engine legible when you want to inspect it."
          />
          <a
            href="#install"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-ink-soft"
          >
            See install options
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <div className="workflow-rail space-y-5 lg:space-y-7 lg:pl-6">
          {workflowSteps.map((step, index) => (
            <ScrollReveal
              key={step.num}
              delay={index * 0.05}
              y={26}
              amount={0.28}
              margin="0px 0px 4% 0px"
            >
              <article className="workflow-card rounded-[1.6rem] p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      <span>{step.num}</span>
                      <span>{step.label}</span>
                    </div>
                    <h3 className="mt-4 max-w-2xl font-display text-xl font-semibold tracking-tight text-ink sm:text-[1.6rem]">
                      {step.title}
                    </h3>
                  </div>
                  <span className="hidden rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-ink-muted sm:inline-flex">
                    Step {step.num}
                  </span>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
                  {step.body}
                </p>
                <div className="mt-5 rounded-2xl border border-line bg-paper/70 px-4 py-3 text-sm text-ink-soft">
                  {step.detail}
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {valueProps.map((prop, index) => (
          <ScrollReveal key={prop.title} delay={index * 0.04} amount={0.42}>
            <article className="surface-card rounded-2xl p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky">
                <prop.icon className="h-5 w-5 text-sky-strong" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-ink">{prop.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{prop.body}</p>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </SectionShell>
  );
}
