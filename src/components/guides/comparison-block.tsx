"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Check, SlidersHorizontal } from "lucide-react";
import { TrackedAnchor } from "@/components/analytics/tracked-link";
import { trackAnalyticsEvent } from "@/lib/analytics";
import type { AnalyticsSurface, ComparisonAction } from "@/lib/analytics";
import type {
  GuideComparisonBlock as GuideComparisonBlockModel,
  GuideComparisonTool,
} from "@/lib/guides/types";

type ComparisonFilter =
  | "all"
  | "windows"
  | "cross-platform"
  | "simple"
  | "power"
  | "archive"
  | "open-source";

const filters: Array<{ id: ComparisonFilter; label: string }> = [
  { id: "all", label: "All tools" },
  { id: "windows", label: "Windows" },
  { id: "cross-platform", label: "Cross-platform" },
  { id: "simple", label: "Simpler setup" },
  { id: "power", label: "Power workflows" },
  { id: "archive", label: "Archive workflows" },
  { id: "open-source", label: "Open source" },
];

const filterActions: Record<ComparisonFilter, ComparisonAction> = {
  all: "filter_all",
  windows: "filter_windows",
  "cross-platform": "filter_cross-platform",
  simple: "filter_simple",
  power: "filter_power",
  archive: "filter_archive",
  "open-source": "filter_open-source",
};

const criteria: Array<{ label: string; key: keyof GuideComparisonTool }> = [
  { label: "Platforms", key: "platforms" },
  { label: "Installation", key: "installation" },
  { label: "yt-dlp / FFmpeg", key: "toolManagement" },
  { label: "Playlists", key: "playlists" },
  { label: "Subtitles", key: "subtitles" },
  { label: "Cookies", key: "cookies" },
  { label: "Presets", key: "presets" },
  { label: "Queue", key: "queues" },
  { label: "Raw logs", key: "rawLogs" },
  { label: "Archive workflows", key: "archiveWorkflows" },
  { label: "License", key: "license" },
  { label: "Telemetry / account", key: "telemetryAndAccount" },
  { label: "Release activity", key: "releaseActivity" },
  { label: "Best use", key: "bestFor" },
  { label: "Limitations", key: "limitations" },
];

function OfficialLink({
  tool,
  surface,
}: {
  tool: GuideComparisonTool;
  surface: Extract<AnalyticsSurface, "comparison_table" | "comparison_card">;
}) {
  return (
    <TrackedAnchor
      href={tool.officialUrl}
      target="_blank"
      rel="noreferrer"
      analyticsEvent={{
        name: "comparison_interaction",
        properties: { action: "open_official_source", surface, tool: tool.id },
      }}
      className="inline-flex items-center gap-1 text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:text-mint-strong"
    >
      Official source <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
    </TrackedAnchor>
  );
}

export function GuideComparisonBlock({ block }: { block: GuideComparisonBlockModel }) {
  const [activeFilter, setActiveFilter] = useState<ComparisonFilter>("all");
  const tools = useMemo(
    () =>
      activeFilter === "all"
        ? block.tools
        : block.tools.filter((tool) => tool.filters.includes(activeFilter)),
    [activeFilter, block.tools],
  );

  const chooseFilter = (filter: ComparisonFilter) => {
    setActiveFilter(filter);
    trackAnalyticsEvent({
      name: "comparison_interaction",
      properties: { action: filterActions[filter], surface: "flagship_comparison" },
    });
  };

  return (
    <section aria-labelledby="comparison-experience-title" className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mint-strong">
          Answer first
        </p>
        <h2
          id="comparison-experience-title"
          className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
        >
          {block.title}
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">
          {block.description}
        </p>
        <p className="mt-3 text-xs text-ink-muted">Evidence reviewed {block.verifiedAt}.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Best tools by use case">
        {block.useCases.map((useCase) => {
          const tool = block.tools.find((candidate) => candidate.id === useCase.toolId);
          if (!tool) return null;

          return (
            <article key={useCase.label} className="rounded-2xl border border-line bg-paper/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
                {useCase.label}
              </p>
              <p className="mt-2 font-display text-lg font-semibold text-ink">{tool.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{useCase.reason}</p>
            </article>
          );
        })}
      </div>

      <div className="rounded-2xl border border-line bg-paper/60 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <SlidersHorizontal className="h-4 w-4 text-mint-strong" aria-hidden="true" />
          Filter the comparison
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Comparison filters">
          {filters.map((filter) => {
            const selected = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={selected}
                onClick={() => chooseFilter(filter.id)}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-strong/70 ${
                  selected
                    ? "border-mint-strong/35 bg-mint text-mint-strong"
                    : "border-line-strong bg-paper-strong text-ink-soft hover:text-ink"
                }`}
              >
                {selected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                {filter.label}
              </button>
            );
          })}
        </div>
        <p className="sr-only" aria-live="polite">
          Showing {tools.length} of {block.tools.length} tools.
        </p>
      </div>

      <div className="hidden lg:block">
        <div
          role="region"
          aria-label="Detailed yt-dlp tool comparison"
          tabIndex={0}
          className="max-w-full overflow-x-auto rounded-2xl border border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-strong/60"
        >
          <table className="w-full min-w-[72rem] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-paper-strong/95">
                <th className="sticky left-0 z-20 w-44 border-b border-r border-line bg-paper-strong px-4 py-4 font-semibold text-ink">
                  Compare
                </th>
                {tools.map((tool) => (
                  <th key={tool.id} scope="col" className="min-w-56 border-b border-line px-4 py-4 align-top">
                    <p className="font-display text-base font-semibold text-ink">{tool.name}</p>
                    <p className="mt-1 text-xs font-normal leading-relaxed text-ink-muted">{tool.summary}</p>
                    <div className="mt-3">
                      <OfficialLink tool={tool} surface="comparison_table" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion, rowIndex) => (
                <tr key={criterion.label} className={rowIndex % 2 === 0 ? "bg-paper/35" : "bg-transparent"}>
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-r border-t border-line bg-paper-strong/95 px-4 py-3 font-semibold text-ink"
                  >
                    {criterion.label}
                  </th>
                  {tools.map((tool) => (
                    <td key={tool.id} className="border-t border-line px-4 py-3 align-top leading-relaxed text-ink-soft">
                      {String(tool[criterion.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:hidden" aria-label="Mobile yt-dlp tool comparison">
        {tools.map((tool) => (
          <article key={tool.id} className="rounded-2xl border border-line bg-paper/65 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-ink">{tool.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{tool.summary}</p>
              </div>
              <OfficialLink tool={tool} surface="comparison_card" />
            </div>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {criteria.map((criterion) => (
                <div key={criterion.label} className="rounded-xl border border-line bg-paper/55 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    {criterion.label}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                    {String(tool[criterion.key])}
                  </dd>
                </div>
              ))}
            </dl>
            <details className="mt-4 rounded-xl border border-line px-3 py-2">
              <summary className="cursor-pointer text-sm font-semibold text-ink">Sources and verification</summary>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                {tool.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-ink">
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-ink-muted">Verified {tool.verifiedAt}</p>
            </details>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-paper/60 p-5">
        <h3 className="font-display text-lg font-semibold text-ink">Official sources used</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <div key={tool.id}>
              <p className="text-sm font-semibold text-ink">{tool.name}</p>
              <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
                {tool.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-4 hover:text-ink">
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
