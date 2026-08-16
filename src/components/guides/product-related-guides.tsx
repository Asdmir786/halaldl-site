import Link from "next/link";
import { getRelatedGuides } from "@/lib/guides";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

/** Related-guides strip for product canonical pages (install / trust / compare). */
export function ProductRelatedGuides({ slug }: { slug: string }) {
  const guides = getRelatedGuides(slug);
  if (guides.length === 0) return null;

  return (
    <ScrollReveal className="mt-14">
      <section>
      <div className="section-divider mb-8" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Guides
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Keep reading</h2>
        </div>
        <Link href="/guides" className="text-sm font-semibold text-mint-strong hover:text-ink">
          All guides →
        </Link>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={guide.canonicalPath}
            className="rounded-2xl border border-line bg-paper/70 p-4 transition-colors hover:bg-paper-strong"
          >
            <p className="font-display text-base font-semibold text-ink">{guide.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{guide.description}</p>
          </Link>
        ))}
      </div>
      </section>
    </ScrollReveal>
  );
}
