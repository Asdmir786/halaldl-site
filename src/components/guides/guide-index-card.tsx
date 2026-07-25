import Link from "next/link";
import type { GuideMeta } from "@/lib/guides/types";

export function GuideIndexCard({ guide }: { guide: GuideMeta }) {
  return (
    <Link
      href={guide.canonicalPath}
      className="surface-card flex h-full flex-col rounded-[1.5rem] p-5 transition-all sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-line bg-paper px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {guide.eyebrow ?? `Tier ${guide.tier}`}
        </span>
        <span className="text-xs font-semibold text-ink-muted">T{guide.tier}</span>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">
        {guide.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{guide.description}</p>
      <p className="mt-4 text-xs font-medium text-mint-strong">Read guide →</p>
    </Link>
  );
}
