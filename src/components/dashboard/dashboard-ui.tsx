import { AlertCircle, ArrowUpRight, Minus } from "lucide-react";

type NamedMetric = {
  label: string;
  value: number;
};

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "No events yet";
  }

  return new Date(value).toLocaleString("en-US");
}

export function ChangeBadge({ change }: { change: number | null }) {
  if (change === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/6 px-2.5 py-1 text-xs font-medium text-slate-400">
        <Minus className="h-3.5 w-3.5" />
        No prior week
      </span>
    );
  }

  const positive = change >= 0;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        positive ? "bg-mint/18 text-mint-strong" : "bg-coral/18 text-coral-strong"
      }`}
    >
      <ArrowUpRight className={`h-3.5 w-3.5 ${positive ? "" : "rotate-90"}`} />
      {positive ? "+" : ""}
      {formatNumber(change)} vs previous 7 days
    </span>
  );
}

export function DashboardPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`relative rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-6 ${className}`}
    >
      {children}
    </article>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: string;
  detail?: string;
}) {
  return (
    <div>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-[1.7rem] font-semibold tracking-[-0.03em] text-white">
        {title}
      </h2>
      {detail ? <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">{detail}</p> : null}
    </div>
  );
}

export function SummaryCard({
  label,
  value,
  detail,
  accent = "sky",
}: {
  label: string;
  value: string;
  detail: string;
  accent?: "sky" | "mint" | "amber";
}) {
  const accentClasses =
    accent === "mint"
      ? "from-mint/16 to-transparent text-mint-strong"
      : accent === "amber"
        ? "from-amber/16 to-transparent text-amber-strong"
        : "from-sky/16 to-transparent text-sky-100";

  return (
    <DashboardPanel className="overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${accentClasses} opacity-80`} />
      <div className="relative">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
        <p className="mt-4 font-display text-3xl font-semibold text-white">{value}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{detail}</p>
      </div>
    </DashboardPanel>
  );
}

export function MetricBarList({
  items,
  emptyLabel,
  tone = "sky",
}: {
  items: NamedMetric[];
  emptyLabel: string;
  tone?: "sky" | "mint";
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 0);
  const fillClass = tone === "mint" ? "bg-mint-strong/90" : "bg-sky-300";

  if (items.length === 0) {
    return <p className="text-sm leading-relaxed text-slate-300">{emptyLabel}</p>;
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => {
        const width = maxValue > 0 ? `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 0)}%` : "0%";

        return (
          <div key={item.label} className="rounded-2xl border border-white/8 bg-white/6 p-4">
            <div className="flex items-start justify-between gap-4">
              <span className="max-w-[75%] text-sm leading-relaxed text-slate-200">{item.label}</span>
              <span className="shrink-0 text-sm font-semibold text-white">{formatNumber(item.value)}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className={`h-2 rounded-full ${fillClass}`} style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function WeeklyBars({
  points,
}: {
  points: Array<{
    weekStart: string;
    visits: number;
    uniqueVisitors: number;
    pageViews: number;
    downloadClicks: number;
  }>;
}) {
  const maxVisits = Math.max(...points.map((point) => point.visits), 0);

  if (points.length === 0) {
    return <p className="text-sm leading-relaxed text-slate-300">No weekly trend data yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {points.map((point) => {
        const width = maxVisits > 0 ? `${Math.max((point.visits / maxVisits) * 100, point.visits > 0 ? 10 : 0)}%` : "0%";

        return (
          <div key={point.weekStart} className="rounded-2xl border border-white/8 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{point.weekStart}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">
                  {formatNumber(point.uniqueVisitors)} unique · {formatNumber(point.pageViews)} views
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{formatNumber(point.visits)} visits</p>
                <p className="mt-1 text-xs text-slate-400">{formatNumber(point.downloadClicks)} download clicks</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-sky-300" style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DataTable({
  headers,
  rows,
  emptyLabel,
}: {
  headers: string[];
  rows: Array<Array<React.ReactNode>>;
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm leading-relaxed text-slate-300">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm text-slate-200">
        <thead className="text-slate-400">
          <tr>
            {headers.map((header) => (
              <th key={header} className="pb-3 pr-4 font-medium last:pr-0">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-white/8 align-top">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-3 pr-4 last:pr-0">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DiagnosticsCallout({
  title,
  body,
  tone = "sky",
}: {
  title: string;
  body: string;
  tone?: "sky" | "amber";
}) {
  const toneClasses =
    tone === "amber"
      ? "border-amber/35 bg-amber/12 text-slate-100"
      : "border-sky-400/20 bg-sky-400/8 text-white";

  return (
    <div className={`rounded-[1.5rem] border p-5 ${toneClasses}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
          <AlertCircle className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-xl font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">{body}</p>
        </div>
      </div>
    </div>
  );
}
