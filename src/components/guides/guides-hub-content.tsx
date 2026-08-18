import Link from "next/link";
import { ArrowRight, BookOpen, Compass, FileStack, Sparkles } from "lucide-react";
import { CURRENT_RELEASE } from "@/content/releases/registry";
import { SiteHeader } from "@/components/home/home-header";
import { SubpageRouteStrip } from "@/components/site/subpage-route-strip";
import { ThemedScreenshot } from "@/components/themed-screenshot";
import { GuideIndexCard } from "@/components/guides/guide-index-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { GuideMeta } from "@/lib/guides/types";

type GuidesHubContentProps = {
  tier1: GuideMeta[];
  tier2: GuideMeta[];
  tier3: GuideMeta[];
  currentReleaseGuide?: GuideMeta;
};


export function GuidesHubContent({ tier1, tier2, tier3, currentReleaseGuide }: GuidesHubContentProps) {
  const featuredMedia = CURRENT_RELEASE.changelogMedia!;

  return (
    <main id="main-content" className="secondary-page overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pb-20">
        <SiteHeader currentPage="guides" />
        <SubpageRouteStrip currentPage="guides" />

        <nav aria-label="Breadcrumb" className="mt-6 flex items-center gap-2 text-sm text-ink-muted">
          <Link href="/" className="transition-colors hover:text-ink">Home</Link>
          <span>/</span>
          <span className="font-medium text-ink">Guides</span>
        </nav>

        <section className="secondary-hero relative mt-7 overflow-hidden rounded-[2rem] border border-line bg-paper/65 p-6 sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-sky/80 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-mint/60 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div className="max-w-xl">
              <div className="eyebrow"><BookOpen className="h-3.5 w-3.5" /> Practical Windows guides</div>
              <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl lg:text-[3.65rem]">Find the next step. <span className="text-ink-soft">Skip the filler.</span></h1>
              <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">Use these guides when you need to choose a frontend, install safely, understand a local workflow, or recover when the underlying tools change.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-line bg-paper-strong/80 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Start</p><p className="mt-2 text-sm font-semibold text-ink">Choose and install</p></div>
                <div className="rounded-2xl border border-line bg-paper-strong/80 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Learn</p><p className="mt-2 text-sm font-semibold text-ink">Use the product well</p></div>
                <div className="rounded-2xl border border-line bg-paper-strong/80 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Verify</p><p className="mt-2 text-sm font-semibold text-ink">Keep the source clear</p></div>
              </div>
            </div>

            {currentReleaseGuide ? <Link href={currentReleaseGuide.canonicalPath} className="group rounded-[1.6rem] border border-line bg-paper-strong/80 p-3 shadow-[0_20px_52px_rgba(8,14,23,0.12)] transition-transform hover:-translate-y-1">
              <div className="screenshot-frame min-h-[13rem] p-2 sm:min-h-[18rem]"><div className="feature-stage min-h-[11rem] sm:min-h-[16rem]"><ThemedScreenshot lightSrc={featuredMedia.lightSrc} darkSrc={featuredMedia.darkSrc} alt={featuredMedia.alt} sizes="(min-width: 1024px) 600px, 100vw" renderMode="active" className="inset-0" imageClassName="border border-line bg-paper object-contain" /></div></div>
              <div className="flex items-start justify-between gap-4 px-3 pb-2 pt-5"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-mint-strong">New in {CURRENT_RELEASE.tag}</p><h2 className="mt-2 font-display text-2xl font-semibold text-ink">{currentReleaseGuide.title}</h2><p className="mt-2 text-sm leading-relaxed text-ink-soft">{currentReleaseGuide.description}</p></div><ArrowRight className="mt-1 h-5 w-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-1" /></div>
            </Link> : null}
          </div>
        </section>

        <section className="pt-16 sm:pt-20">
          <ScrollReveal><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow"><Compass className="h-3.5 w-3.5" /> Start here</div><h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">Pick the question you actually have.</h2></div><p className="max-w-md text-sm leading-relaxed text-ink-soft">These are the highest-value reading paths: choosing a GUI, deciding on a build, installing, and verifying the release source.</p></div></ScrollReveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{tier1.map((guide, index) => <ScrollReveal key={guide.slug} delay={index * 0.05}><GuideIndexCard guide={guide} /></ScrollReveal>)}</div>
        </section>

        <section className="pt-16 sm:pt-20"><div className="section-divider mb-12" /><ScrollReveal><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow"><Sparkles className="h-3.5 w-3.5" /> Product depth</div><h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">From presets to recovery, the everyday workflow.</h2></div><p className="max-w-md text-sm leading-relaxed text-ink-soft">Go deeper when a workflow needs a little more context than a release note can provide.</p></div></ScrollReveal><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{tier2.map((guide, index) => <ScrollReveal key={guide.slug} delay={index * 0.04}><GuideIndexCard guide={guide} /></ScrollReveal>)}</div></section>

        <section className="pt-16 sm:pt-20"><ScrollReveal className="rounded-[1.75rem] border border-line bg-paper/70 p-6 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-2xl"><div className="eyebrow"><FileStack className="h-3.5 w-3.5" /> Broader local-first reading</div><h2 className="mt-5 font-display text-3xl font-semibold text-ink">Explore the surrounding Windows workflow.</h2><p className="mt-4 text-base leading-relaxed text-ink-soft">These guides are for broader questions around local-first media tools, formats, platform boundaries, and keeping the workflow understandable.</p></div><Link href="/download" className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper-strong px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper">Download HalalDL <ArrowRight className="h-4 w-4" /></Link></div><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{tier3.map((guide, index) => <ScrollReveal key={guide.slug} delay={index * 0.04}><GuideIndexCard guide={guide} /></ScrollReveal>)}</div></ScrollReveal></section>
      </div>
    </main>
  );
}
