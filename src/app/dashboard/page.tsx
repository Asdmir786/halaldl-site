import type { Metadata } from "next";
import { Activity, MousePointerClick, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardData } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Overview Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "No events yet";
  }

  return new Date(value).toLocaleString("en-US");
}

function ChangePill({ change }: { change: number | null }) {
  if (change === null) {
    return <span className="text-xs font-medium text-slate-400">No prior week yet</span>;
  }

  const positive = change >= 0;
  return (
    <span
      className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
        positive ? "bg-mint text-mint-strong" : "bg-coral/15 text-coral-strong"
      }`}
    >
      {positive ? "+" : ""}
      {formatNumber(change)} vs previous 7 days
    </span>
  );
}

function MetricBarList({
  items,
  emptyLabel,
}: {
  items: Array<{ label: string; value: number }>;
  emptyLabel: string;
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 0);

  if (items.length === 0) {
    return <p className="text-sm text-slate-300">{emptyLabel}</p>;
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => {
        const width = maxValue > 0 ? `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 0)}%` : "0%";

        return (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/6 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-300">{item.label}</span>
              <span className="text-sm font-semibold text-white">{formatNumber(item.value)}</span>
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

export default async function DashboardPage() {
  const data = await getDashboardData();
  const hasMeaningfulData = data.totalEvents > 5;
  const statusCards = [
    {
      label: "Events stored",
      value: formatNumber(data.totalEvents),
      detail: "Total raw analytics events in the last 30 days",
      icon: Activity,
    },
    {
      label: "Last event",
      value: formatDateTime(data.lastEventAt),
      detail: "Most recent analytics write seen by the dashboard",
      icon: Sparkles,
    },
    {
      label: "Tracked surfaces",
      value: `${data.eventTypeBreakdown.filter((item) => item.value > 0).length}/4`,
      detail: "Page, CTA, command-copy, and section-view coverage",
      icon: ShieldCheck,
    },
  ];

  return (
    <DashboardShell currentPage="overview" generatedAt={data.generatedAt}>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.label}
              className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                  {card.label}
                </p>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sky-100">
                  <Icon className="h-4.5 w-4.5" />
                </span>
              </div>
              <p className="mt-4 font-display text-2xl font-semibold text-white">{card.value}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{card.detail}</p>
            </article>
          );
        })}
      </div>

      {!data.enabled ? (
        <section className="mt-8 rounded-[1.75rem] border border-amber bg-amber/30 p-6">
          <h2 className="font-display text-2xl font-semibold text-ink">Dashboard setup is incomplete.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">
            Add `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` to your
            Vercel project. Once deployed, page views and CTA events will start filling this dashboard automatically.
          </p>
        </section>
      ) : (
        <>
          {!hasMeaningfulData && (
            <section className="mt-8 rounded-[1.75rem] border border-sky-400/20 bg-sky-400/8 p-6 text-white">
              <div className="flex items-start gap-4">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-300/20 text-sky-100">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-semibold">Tracking is on, but the dataset is tiny.</h2>
                  <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-200">
                    The dashboard currently has only {formatNumber(data.totalEvents)} recorded event
                    {data.totalEvents === 1 ? "" : "s"}. Right now that means the dashboard is not broken; it just does not
                    have enough real traffic and click data yet to make the tables feel rich.
                  </p>
                </div>
              </div>
            </section>
          )}

          <section className="mt-8 grid gap-4 lg:grid-cols-5">
            {data.metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                  {metric.label}
                </p>
                <p className="mt-3 font-display text-3xl font-semibold text-white">
                  {formatNumber(metric.value)}
                </p>
                <div className="mt-3">
                  <ChangePill change={metric.change} />
                </div>
              </article>
            ))}
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                Weekly trend
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-white">
                Are more people discovering HalalDL?
              </h2>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-200">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="pb-3 pr-4 font-medium">Week</th>
                      <th className="pb-3 pr-4 font-medium">Visits</th>
                      <th className="pb-3 pr-4 font-medium">Unique</th>
                      <th className="pb-3 pr-4 font-medium">Views</th>
                      <th className="pb-3 font-medium">Download clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.weeklyTrend.map((point) => (
                      <tr key={point.weekStart} className="border-t border-white/8">
                        <td className="py-3 pr-4 text-slate-300">{point.weekStart}</td>
                        <td className="py-3 pr-4 font-medium text-white">{formatNumber(point.visits)}</td>
                        <td className="py-3 pr-4 font-medium text-white">{formatNumber(point.uniqueVisitors)}</td>
                        <td className="py-3 pr-4 font-medium text-white">{formatNumber(point.pageViews)}</td>
                        <td className="py-3 font-medium text-white">{formatNumber(point.downloadClicks)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                Tracking health
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-white">
                Which event types are actually landing?
              </h2>
              <div className="mt-6">
                <MetricBarList items={data.eventTypeBreakdown} emptyLabel="No analytics events have been written yet." />
              </div>
            </article>
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-100">
                  <MousePointerClick className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                    Download intent
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-semibold text-white">
                    Which acquisition clicks are closest to install intent?
                  </h2>
                </div>
              </div>
              <div className="mt-6">
                <MetricBarList items={data.downloadIntent} emptyLabel="No download-intent events yet." />
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                Recent events
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-white">
                What the collector actually saw
              </h2>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-200">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="pb-3 pr-4 font-medium">Time</th>
                      <th className="pb-3 pr-4 font-medium">Type</th>
                      <th className="pb-3 pr-4 font-medium">Label</th>
                      <th className="pb-3 font-medium">Page</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentEvents.map((event) => (
                      <tr key={`${event.createdAt}-${event.label}`} className="border-t border-white/8">
                        <td className="py-3 pr-4 text-slate-300">{new Date(event.createdAt).toLocaleString("en-US")}</td>
                        <td className="py-3 pr-4 font-medium text-white">{event.eventType}</td>
                        <td className="py-3 pr-4 text-slate-200">{event.label}</td>
                        <td className="py-3 text-slate-300">{event.pagePath ?? "n/a"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </>
      )}
    </DashboardShell>
  );
}
