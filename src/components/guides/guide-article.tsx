import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { TrackedLink } from "@/components/analytics/tracked-link";
import type { GuideBlock, GuideCta } from "@/lib/guides/types";

function CalloutTone({
  tone,
  title,
  body,
}: {
  tone: "mint" | "sky" | "amber" | "coral";
  title: string;
  body: string;
}) {
  const styles = {
    mint: "border-mint-strong/25 bg-mint/60 text-mint-strong",
    sky: "border-sky-strong/25 bg-sky/60 text-sky-strong",
    amber: "border-amber-strong/30 bg-amber/60 text-amber-strong",
    coral: "border-coral-strong/25 bg-coral/60 text-coral-strong",
  } as const;

  return (
    <aside className={`rounded-2xl border px-4 py-3 ${styles[tone]}`}>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
    </aside>
  );
}

export function GuideCtaButton({
  cta,
  className,
  analyticsSurface = "guide",
}: {
  cta: GuideCta;
  className?: string;
  analyticsSurface?: string;
}) {
  const analyticsEvent = cta.eventCta.startsWith("compare_")
    ? {
        name: "comparison_interaction" as const,
        properties: { action: cta.eventCta, surface: analyticsSurface },
      }
    : {
        name: "download_cta_click" as const,
        properties: { cta: cta.eventCta, surface: analyticsSurface },
      };

  return (
    <TrackedLink
      href={cta.href}
      analyticsEvent={analyticsEvent}
      className={
        className ??
        "glass-cta inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
      }
    >
      {cta.label}
    </TrackedLink>
  );
}

export function GuideBlocks({
  blocks,
}: {
  blocks: GuideBlock[];
}) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        switch (block.type) {
          case "heading":
            if (block.level === 2) {
              return (
                <h2
                  key={key}
                  id={block.id}
                  className="scroll-mt-28 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <h3
                key={key}
                id={block.id}
                className="scroll-mt-28 font-display text-xl font-semibold tracking-tight text-ink"
              >
                {block.text}
              </h3>
            );
          case "paragraph":
            return (
              <p key={key} className="text-base leading-relaxed text-ink-soft">
                {block.text}
              </p>
            );
          case "list":
            if (block.ordered) {
              return (
                <ol key={key} className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-soft sm:text-base">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              );
            }
            return (
              <ul key={key} className="space-y-2">
                {block.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft sm:text-base">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-mint-strong" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          case "callout":
            return (
              <CalloutTone
                key={key}
                tone={block.tone}
                title={block.title}
                body={block.body}
              />
            );
          case "table":
            return (
              <div
                key={key}
                role="region"
                aria-label={block.caption ?? "Guide comparison table"}
                tabIndex={0}
                className="max-w-full overflow-x-auto rounded-2xl border border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-strong/60"
              >
                {block.caption ? (
                  <p className="border-b border-line bg-paper/70 px-4 py-3 text-xs text-ink-muted">
                    {block.caption}
                  </p>
                ) : null}
                <table className="w-full min-w-[48rem] text-left text-sm">
                  <thead className="bg-paper-strong/80 text-ink">
                    <tr>
                      {block.table.headers.map((header) => (
                        <th key={header} className="px-3 py-2.5 font-semibold">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.table.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t border-line text-ink-soft">
                        {row.map((cell, cellIndex) => (
                          <td key={`${rowIndex}-${cellIndex}`} className="px-3 py-2.5 align-top">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "faq":
            return (
              <div key={key} className="space-y-3">
                {block.items.map((item) => (
                  <details key={item.question} className="faq-item rounded-2xl px-4 py-3">
                    <summary className="font-display text-base font-semibold text-ink">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.answer}</p>
                  </details>
                ))}
              </div>
            );
          case "cta":
            return (
              <div key={key} className="pt-2">
                <GuideCtaButton cta={block.cta} analyticsSurface="guide_body" />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export function RelatedGuides({
  guides,
}: {
  guides: Array<{ title: string; description: string; canonicalPath: string }>;
}) {
  if (guides.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="section-divider mb-8" />
      <h2 className="font-display text-2xl font-semibold text-ink">Related guides</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <Link
            key={guide.canonicalPath}
            href={guide.canonicalPath}
            className="rounded-2xl border border-line bg-paper/70 p-4 transition-colors hover:bg-paper-strong"
          >
            <p className="font-display text-base font-semibold text-ink">{guide.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{guide.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
