import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleHelp, Download, FolderArchive, Layers3, Settings2, ShieldCheck } from "lucide-react";
import type { GitHubSnapshot } from "@/lib/github";
import { SiteHeader } from "@/components/home/home-header";
import { SubpageRouteStrip } from "@/components/site/subpage-route-strip";
import { ProductRelatedGuides } from "@/components/guides/product-related-guides";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { formatMegabytes } from "@/components/home/home-shared";

type BuildComparisonContentProps = { github: GitHubSnapshot };

const comparisonRows = [
  { label: "Best for", full: "Most people who want to install and begin.", lite: "People who already manage the wider toolchain.", portable: "People who prefer a self-contained app folder." },
  { label: "Setup feel", full: "Lower-friction first-run path.", lite: "More explicit decisions from the beginning.", portable: "Extract, keep the folder together, and update it manually." },
  { label: "Main tradeoff", full: "Less control over how the setup boundary is handled.", lite: "More setup responsibility when dependencies need attention.", portable: "No traditional installer path and manual folder replacement on updates." },
];

const decisionCards = [
  { title: "I want the least friction.", label: "Choose Full", tone: "mint", body: "You want a clear first run and do not need to actively manage every supporting tool.", icon: CheckCircle2 },
  { title: "I manage my own tools.", label: "Choose Lite", tone: "sky", body: "You already care about yt-dlp, ffmpeg, aria2, or the rest of the local toolchain remaining explicit.", icon: Settings2 },
  { title: "I want a self-contained folder.", label: "Choose Portable", tone: "paper", body: "You prefer a folder you can carry, keep separate, or replace when a new release arrives.", icon: FolderArchive },
];

export function BuildComparisonContent({ github }: BuildComparisonContentProps) {
  return (
    <main id="main-content" className="secondary-page overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pb-20">
        <SiteHeader currentPage="compare" />
        <SubpageRouteStrip currentPage="compare" />

        <nav aria-label="Breadcrumb" className="mt-6 flex items-center gap-2 text-sm text-ink-muted">
          <Link href="/" className="transition-colors hover:text-ink">Home</Link>
          <span>/</span>
          <span className="font-medium text-ink">Full vs Lite</span>
        </nav>

        <section className="secondary-hero relative mt-7 overflow-hidden rounded-[2rem] border border-line bg-paper/65 p-6 sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-sky/80 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-mint/50 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center">
            <div className="max-w-xl">
              <div className="eyebrow"><Layers3 className="h-3.5 w-3.5" /> Build comparison</div>
              <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl lg:text-[3.65rem]">The right build is about the <span className="text-ink-soft">setup boundary.</span></h1>
              <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">This is not a Pro-versus-Basic split. Full is the recommended default. Lite gives you more direct responsibility for the toolchain. Portable keeps the app in one self-contained folder.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={github.fullSetupUrl} target="_blank" rel="noreferrer" className="glass-cta inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all hover:-translate-y-0.5"><Download className="h-4 w-4" />Download Full<ArrowRight className="h-4 w-4" /></a>
                <Link href="/download" className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-paper-strong px-5 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-paper">See all download options</Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1.25fr_1fr]">
              <article className="rounded-[1.6rem] border border-mint-strong/35 bg-paper-strong/75 p-5 shadow-[0_18px_44px_rgba(11,127,114,0.12)] sm:row-span-2">
                <span className="inline-flex rounded-full bg-mint px-3 py-1 text-xs font-semibold text-mint-strong">Recommended for most people</span>
                <h2 className="mt-5 font-display text-3xl font-semibold text-ink">Full</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">The cleanest first-run path. Start here unless you already know why you need one of the alternatives.</p>
                <div className="mt-6 rounded-2xl border border-line bg-paper/70 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Release size</p><p className="mt-2 font-display text-xl font-semibold text-ink">{formatMegabytes(github.fullSetupSize)}</p></div>
              </article>
              <article className="rounded-[1.45rem] border border-line bg-paper-strong/75 p-5"><span className="inline-flex rounded-full bg-sky px-3 py-1 text-xs font-semibold text-sky-strong">More direct control</span><h2 className="mt-4 font-display text-2xl font-semibold text-ink">Lite</h2><p className="mt-2 text-sm leading-relaxed text-ink-soft">Bring more of the toolchain boundary under your own management.</p><p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{formatMegabytes(github.liteSetupSize)}</p></article>
              <article className="rounded-[1.45rem] border border-line bg-paper-strong/75 p-5"><span className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink-muted"><FolderArchive className="h-3.5 w-3.5" /> Self-contained</span><h2 className="mt-4 font-display text-2xl font-semibold text-ink">Portable</h2><p className="mt-2 text-sm leading-relaxed text-ink-soft">Keep one app folder and replace it manually when you update.</p><p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{formatMegabytes(github.portableZipSize)}</p></article>
            </div>
          </div>
        </section>

        <section className="pt-16 sm:pt-20">
          <ScrollReveal>
            <div className="max-w-2xl"><div className="eyebrow"><CircleHelp className="h-3.5 w-3.5" /> Decision guide</div><h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">Pick the sentence that sounds most like you.</h2></div>
          </ScrollReveal>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {decisionCards.map((card, index) => {
              const Icon = card.icon;
              const toneClass = card.tone === "mint" ? "bg-mint text-mint-strong" : card.tone === "sky" ? "bg-sky text-sky-strong" : "bg-paper text-ink-muted";
              return <ScrollReveal key={card.label} delay={index * 0.08} className="surface-card-static rounded-[1.6rem] p-6"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}><Icon className="h-5 w-5" /></div><p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{card.label}</p><h3 className="mt-2 font-display text-2xl font-semibold text-ink">{card.title}</h3><p className="mt-3 text-sm leading-relaxed text-ink-soft">{card.body}</p></ScrollReveal>;
            })}
          </div>
        </section>

        <section className="pt-16 sm:pt-20">
          <div className="section-divider mb-12" />
          <ScrollReveal className="overflow-hidden rounded-[1.8rem] border border-line bg-paper/70">
            <div className="border-b border-line px-6 py-6 sm:px-7"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Compare the practical difference</p><h2 className="mt-3 font-display text-3xl font-semibold text-ink">Convenience, control, and portability.</h2></div>
            <div className="overflow-x-auto"><div className="min-w-[44rem]">
              <div className="grid grid-cols-[0.8fr_1fr_1fr_1fr] border-b border-line bg-paper-strong/85 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted"><div className="px-5 py-4">Decision point</div><div className="border-l border-line px-5 py-4">Full</div><div className="border-l border-line px-5 py-4">Lite</div><div className="border-l border-line px-5 py-4">Portable</div></div>
              {comparisonRows.map((row) => <div key={row.label} className="grid grid-cols-[0.8fr_1fr_1fr_1fr] border-b border-line last:border-b-0"><div className="px-5 py-5 text-sm font-semibold text-ink">{row.label}</div><div className="border-l border-line px-5 py-5 text-sm leading-relaxed text-ink-soft">{row.full}</div><div className="border-l border-line px-5 py-5 text-sm leading-relaxed text-ink-soft">{row.lite}</div><div className="border-l border-line px-5 py-5 text-sm leading-relaxed text-ink-soft">{row.portable}</div></div>)}
            </div></div>
          </ScrollReveal>
        </section>

        <section className="pt-16 sm:pt-20">
          <ScrollReveal className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber"><ShieldCheck className="h-5 w-5 text-amber-strong" /></div><div><h2 className="font-display text-2xl font-semibold text-ink">Installer size is not the point.</h2><p className="mt-2 text-sm leading-relaxed text-ink-soft">Full and Lite can look close in size because they are the same Windows desktop app. The useful distinction is who takes responsibility for more of the local setup path.</p></div></div></article>
            <article className="rounded-[1.75rem] border border-mint-strong/25 bg-mint/35 p-6 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-mint-strong">Still undecided?</p><h2 className="mt-3 font-display text-2xl font-semibold text-ink">Use Full.</h2><p className="mt-3 text-sm leading-relaxed text-ink-soft">It is the site’s clear default, and you can still inspect the GitHub release or verify SHA256 before first run.</p><a href={github.fullSetupUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-ink-soft">Download Full <ArrowRight className="h-4 w-4" /></a></article>
          </ScrollReveal>
        </section>

        <ProductRelatedGuides slug="full-vs-lite" />
      </div>
    </main>
  );
}
