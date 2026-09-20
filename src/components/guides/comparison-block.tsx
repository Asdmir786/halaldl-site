"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, ArrowUpRight, Check } from "lucide-react";
import { TrackedAnchor } from "@/components/analytics/tracked-link";
import { trackAnalyticsEvent } from "@/lib/analytics";
import type { AnalyticsSurface, ComparisonToolId } from "@/lib/analytics";
import type {
  GuideComparisonBlock as GuideComparisonBlockModel,
  GuideComparisonTool,
} from "@/lib/guides/types";

type Criterion = { label: string; key: keyof GuideComparisonTool };

const essentialCriteria: Criterion[] = [
  { label: "Platforms", key: "platforms" },
  { label: "Installation", key: "installation" },
  { label: "yt-dlp / FFmpeg", key: "toolManagement" },
  { label: "Playlists", key: "playlists" },
  { label: "Queue", key: "queues" },
  { label: "Best use", key: "bestFor" },
];

const technicalCriteria: Criterion[] = [
  { label: "Subtitles", key: "subtitles" },
  { label: "Cookies", key: "cookies" },
  { label: "Presets", key: "presets" },
  { label: "Raw logs", key: "rawLogs" },
  { label: "Archive workflows", key: "archiveWorkflows" },
  { label: "License", key: "license" },
  { label: "Telemetry / account", key: "telemetryAndAccount" },
  { label: "Release activity", key: "releaseActivity" },
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

function ComparisonRows({
  halaldl,
  competitor,
  criteria,
}: {
  halaldl: GuideComparisonTool;
  competitor: GuideComparisonTool;
  criteria: Criterion[];
}) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {criteria.map((criterion) => (
          <article key={criterion.label} className="rounded-2xl border border-line bg-paper/60 p-4">
            <h4 className="text-sm font-semibold text-ink">{criterion.label}</h4>
            <dl className="mt-3 grid gap-3">
              {[halaldl, competitor].map((tool) => (
                <div key={tool.id} className="rounded-xl border border-line bg-paper-strong/65 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">{tool.name}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">{String(tool[criterion.key])}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[38%]" />
            <col className="w-[38%]" />
          </colgroup>
          <thead>
            <tr className="bg-paper-strong/95">
              <th className="border-b border-r border-line px-4 py-4 font-semibold text-ink">Compare</th>
              {[halaldl, competitor].map((tool) => (
                <th key={tool.id} scope="col" className="border-b border-line px-4 py-4 align-top">
                  <p className="font-display text-base font-semibold text-ink">{tool.name}</p>
                  <p className="mt-1 text-xs font-normal leading-relaxed text-ink-muted">{tool.summary}</p>
                  <div className="mt-3"><OfficialLink tool={tool} surface="comparison_table" /></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((criterion, rowIndex) => (
              <tr key={criterion.label} className={rowIndex % 2 === 0 ? "bg-paper/35" : "bg-transparent"}>
                <th scope="row" className="border-r border-t border-line bg-paper-strong/80 px-4 py-3 font-semibold text-ink">
                  {criterion.label}
                </th>
                {[halaldl, competitor].map((tool) => (
                  <td key={tool.id} className="break-words border-t border-line px-4 py-3 align-top leading-relaxed text-ink-soft">
                    {String(tool[criterion.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function GuideComparisonBlock({ block }: { block: GuideComparisonBlockModel }) {
  const halaldl = block.tools.find((tool) => tool.id === "halaldl") ?? block.tools[0];
  const competitors = useMemo(
    () => block.tools.filter((tool) => tool.id !== halaldl.id),
    [block.tools, halaldl.id],
  );
  const [selectedToolId, setSelectedToolId] = useState<ComparisonToolId>(
    (competitors[0]?.id ?? halaldl.id) as ComparisonToolId,
  );
  const competitor = useMemo(
    () => competitors.find((tool) => tool.id === selectedToolId) ?? competitors[0] ?? halaldl,
    [competitors, halaldl, selectedToolId],
  );

  const chooseTool = (tool: GuideComparisonTool) => {
    setSelectedToolId(tool.id);
    trackAnalyticsEvent({
      name: "comparison_interaction",
      properties: { action: "compare_tool", surface: "flagship_comparison", tool: tool.id },
    });
  };

  return (
    <section aria-labelledby="comparison-experience-title" className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mint-strong">Answer first</p>
        <h2 id="comparison-experience-title" className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {block.title}
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">{block.description}</p>
        <p className="mt-3 text-xs text-ink-muted">Evidence reviewed {block.verifiedAt}.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Best tools by use case">
        {block.useCases.map((useCase) => {
          const tool = block.tools.find((candidate) => candidate.id === useCase.toolId);
          if (!tool) return null;
          return (
            <article key={useCase.label} className="rounded-2xl border border-line bg-paper/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{useCase.label}</p>
              <p className="mt-2 font-display text-lg font-semibold text-ink">{tool.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{useCase.reason}</p>
            </article>
          );
        })}
      </div>

      <div className="rounded-2xl border border-line bg-paper/60 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <ArrowLeftRight className="h-4 w-4 text-mint-strong" aria-hidden="true" />
          Compare HalalDL with one tool
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">Pick the alternative you are actually considering. HalalDL stays in the first column.</p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Choose a tool to compare with HalalDL">
          {competitors.map((tool) => {
            const selected = competitor.id === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                aria-pressed={selected}
                onClick={() => chooseTool(tool)}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-strong/70 ${selected ? "border-mint-strong/35 bg-mint text-mint-strong" : "border-line-strong bg-paper-strong text-ink-soft hover:text-ink"}`}
              >
                {selected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                {tool.name}
              </button>
            );
          })}
        </div>
      </div>

      <ComparisonRows halaldl={halaldl} competitor={competitor} criteria={essentialCriteria} />

      <details className="rounded-2xl border border-line bg-paper/55 p-4 sm:p-5">
        <summary className="cursor-pointer font-semibold text-ink">Show 9 technical details</summary>
        <div className="mt-5"><ComparisonRows halaldl={halaldl} competitor={competitor} criteria={technicalCriteria} /></div>
      </details>

      <details className="rounded-2xl border border-line bg-paper/60 p-5">
        <summary className="cursor-pointer font-display text-lg font-semibold text-ink">Official sources for every tool</summary>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {block.tools.map((tool) => (
            <div key={tool.id}>
              <p className="text-sm font-semibold text-ink">{tool.name}</p>
              <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
                {tool.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-4 hover:text-ink">{source.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
