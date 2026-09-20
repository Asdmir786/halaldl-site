import Link from "next/link";
import { ArrowUpRight, FileStack, GitPullRequestArrow, ShieldCheck, Sparkles } from "lucide-react";
import { CURRENT_RELEASE } from "@/content/releases/registry";
import type { ChangelogEntry } from "@/lib/changelog";
import { SiteHeader } from "@/components/home/home-header";
import { ThemedScreenshot } from "@/components/themed-screenshot";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

type ChangelogPageContentProps = {
  featured: ChangelogEntry;
  entries: ChangelogEntry[];
};

const groups = [
  { key: "added", label: "Added", accent: "text-mint-strong" },
  { key: "improved", label: "Improved", accent: "text-sky-strong" },
  { key: "fixed", label: "Fixed", accent: "text-coral-strong" },
] as const;

export function ChangelogPageContent({ featured, entries }: ChangelogPageContentProps) {
  const releaseHistory = [featured, ...entries];
  const earliestRelease = releaseHistory.at(-1);
  const releaseStory = CURRENT_RELEASE.changelog;

  return (
    <main id="main-content" className="secondary-page overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pb-20">
        <SiteHeader currentPage="changelog" />
        <nav aria-label="Breadcrumb" className="mt-6 flex items-center gap-2 text-sm text-ink-muted">
          <Link href="/" className="transition-colors hover:text-ink">Home</Link>
          <span>/</span>
          <span className="font-medium text-ink">Changelog</span>
        </nav>

        <section className="secondary-hero relative mt-7 overflow-hidden rounded-[2rem] border border-line bg-paper/65 p-6 sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-20 h-64 w-64 rounded-full bg-mint/60 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-20 left-1/4 h-52 w-52 rounded-full bg-sky/65 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:items-end">
            <div className="max-w-3xl">
              <div className="eyebrow"><FileStack className="h-3.5 w-3.5" /> Release archive</div>
              <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl lg:text-[3.65rem]">
                What changed—and why it matters.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
                A readable release trail for HalalDL: the practical story first, the complete change set next, and the canonical GitHub notes always one click away.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl border border-line bg-paper-strong/80 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Latest</p><p className="mt-2 font-display text-xl font-semibold text-ink">{featured.version}</p><p className="mt-1 text-sm text-ink-soft">{featured.date}</p></div>
              <div className="rounded-2xl border border-line bg-paper-strong/80 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Archive</p><p className="mt-2 font-display text-xl font-semibold text-ink">{releaseHistory.length} releases</p><p className="mt-1 text-sm text-ink-soft">Public history</p></div>
              <div className="rounded-2xl border border-line bg-paper-strong/80 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Current story</p><p className="mt-2 font-display text-xl font-semibold text-ink">{CURRENT_RELEASE.title}</p><p className="mt-1 text-sm text-ink-soft">{earliestRelease?.version} → now</p></div>
            </div>
          </div>
        </section>

        <section className="pt-16 sm:pt-20">
          <ScrollReveal className="grid gap-7 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-start">
            <div className="screenshot-frame min-h-[17rem] p-3 sm:min-h-[27rem]">
              <div className="feature-stage min-h-[15rem] sm:min-h-[25rem]">
                {featured.media?.type === "image" ? <ThemedScreenshot lightSrc={featured.media.lightSrc} darkSrc={featured.media.darkSrc} alt={featured.media.alt} sizes="(min-width: 1024px) 650px, 100vw" renderMode="active" className="inset-0" imageClassName="border border-line-strong bg-paper object-contain" /> : <div className="flex h-full items-center justify-center bg-paper"><p className="text-sm text-ink-muted">Release visual unavailable</p></div>}
              </div>
            </div>
            <article className="surface-card-static rounded-[1.8rem] p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-mint-strong"><Sparkles className="h-3.5 w-3.5" /> Latest release</span><span className="text-sm text-ink-muted">{featured.date}</span></div>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">{featured.version}</h2>
              <p className="mt-2 font-display text-xl font-semibold text-ink">{CURRENT_RELEASE.title}</p>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">{releaseStory?.intro ?? featured.summary}</p>
              <div className="mt-7 flex flex-wrap gap-3"><a href={featured.releaseUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90">Open GitHub Release <ArrowUpRight className="h-4 w-4" /></a><Link href="/guides/halaldl-0-6-1" className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper-strong px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper">Read the {featured.version} guide</Link><Link href="/download" className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper-strong px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper">Download latest</Link></div>
            </article>
          </ScrollReveal>
        </section>

        {releaseStory ? <section className="pt-12 sm:pt-16">
          <ScrollReveal>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow"><GitPullRequestArrow className="h-3.5 w-3.5" /> Complete release notes</div><h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">The {featured.version} change set, in full.</h2></div><p className="max-w-md text-sm leading-relaxed text-ink-soft">Grouped by the job each change does, so the release is easier to scan without losing the details.</p></div>
            <div className="overflow-hidden rounded-[1.6rem] border border-line bg-paper/70">
              <div className="hidden grid-cols-[0.72fr_1.28fr] border-b border-line bg-paper-strong/80 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted sm:grid"><div className="px-5 py-4">Area</div><div className="border-l border-line px-5 py-4">What changed</div></div>
              {releaseStory.sections.map((section) => <div key={section.title} className="grid gap-2 border-b border-line px-5 py-5 last:border-b-0 sm:grid-cols-[0.72fr_1.28fr] sm:gap-0"><div><p className="text-sm font-semibold text-ink">{section.title}</p></div><div className="sm:border-l sm:border-line sm:pl-5"><ul className="space-y-2 text-sm leading-relaxed text-ink-soft">{section.items.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mint-strong" />{item}</li>)}</ul></div></div>)}
            </div>
          </ScrollReveal>
        </section> : null}

        {releaseStory ? <section className="pt-12 sm:pt-16"><ScrollReveal className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="surface-card-static rounded-[1.6rem] p-6 sm:p-7"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky"><ShieldCheck className="h-5 w-5 text-sky-strong" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-strong">Before you install</p><h2 className="mt-2 font-display text-2xl font-semibold text-ink">The practical boundaries.</h2><ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">{releaseStory.beforeYouInstall.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-strong" />{item}</li>)}</ul></div></div></article>
          <article className="rounded-[1.6rem] border border-mint-strong/20 bg-mint/25 p-6 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-mint-strong">Developer note</p><h2 className="mt-2 font-display text-2xl font-semibold text-ink">Local-first by design.</h2><p className="mt-4 text-sm leading-relaxed text-ink-soft">{releaseStory.developerNote}</p><a href={featured.releaseUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-ink-soft">Read the canonical notes <ArrowUpRight className="h-4 w-4" /></a></article>
        </ScrollReveal></section> : null}

        <section className="pt-16 sm:pt-20">
          <div className="section-divider mb-12" />
          <ScrollReveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><div className="eyebrow"><GitPullRequestArrow className="h-3.5 w-3.5" /> Older releases</div><h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">Open only the release you need.</h2></div>
              <p className="max-w-md text-sm leading-relaxed text-ink-soft">The latest release is explained above. Older change sets stay collapsed until you choose one.</p>
            </div>
          </ScrollReveal>
          <div className="mt-8 grid gap-3">
            {entries.map((entry) => (
              <details key={entry.version} className="surface-card-static group rounded-[1.55rem] p-5 sm:p-6">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h3 className="font-display text-2xl font-semibold text-ink">{entry.version}</h3><span className="text-sm text-ink-muted">{entry.date}</span></div>
                      <p className="mt-2 font-medium text-ink">{entry.headline}</p>
                      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">{entry.summary}</p>
                    </div>
                    <span className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink-muted group-open:text-ink">View details</span>
                  </div>
                </summary>
                <div className="mt-5 border-t border-line pt-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    {groups.map((group) => {
                      const items = entry[group.key];
                      if (!items?.length) return null;
                      return <div key={group.key}><p className={`text-xs font-semibold uppercase tracking-[0.12em] ${group.accent}`}>{group.label}</p><ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-soft">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
                    })}
                  </div>
                  {entry.notes?.length ? <div className="mt-5 rounded-xl border border-line bg-paper/60 p-4 text-sm leading-relaxed text-ink-soft"><span className="font-semibold text-ink">Notes:</span> {entry.notes.join(" · ")}</div> : null}
                  <a href={entry.releaseUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-ink-soft">Open GitHub Release <ArrowUpRight className="h-4 w-4" /></a>
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
