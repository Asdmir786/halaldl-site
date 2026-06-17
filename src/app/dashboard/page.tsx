import type { Metadata } from "next";
import {
  Activity,
  BarChart3,
  Globe2,
  MousePointerClick,
  PanelsTopLeft,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getDashboardData } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Analytics Dashboard",
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
    return <span className="text-xs font-medium text-ink-muted">No prior week yet</span>;
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
    return <p className="text-sm text-ink-muted">{emptyLabel}</p>;
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => {
        const width = maxValue > 0 ? `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 0)}%` : "0%";

        return (
          <div key={item.label} className="rounded-2xl border border-line bg-paper/60 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-ink-soft">{item.label}</span>
              <span className="text-sm font-semibold text-ink">{formatNumber(item.value)}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-line/70">
              <div
                className="h-2 rounded-full bg-ink"
                style={{ width }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetricList({
  items,
  emptyLabel,
}: {
  items: Array<{ label: string; value: number }>;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-muted">{emptyLabel}</p>;
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-paper/70 px-4 py-3"
        >
          <span className="text-sm text-ink-soft">{item.label}</span>
          <span className="text-sm font-semibold text-ink">{formatNumber(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/dashboard/login");
  }

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
    <main id="main-content" className="overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(90,157,255,0.11),transparent_26%),linear-gradient(180deg,#0b1220_0%,#0f1726_55%,#11192c_100%)] text-paper">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/6 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100/85">
                <BarChart3 className="h-3.5 w-3.5" />
                Internal analytics
              </div>
              <h1 className="mt-4 font-display text-3xl font-semibold text-white sm:text-5xl">
                HalalDL growth dashboard
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
                One private view for traffic, page attention, referrers, download interest, and
                whether people reach the download section without taking the next step.
              </p>
            </div>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/dashboard/login" });
              }}
            >
              <button
                type="submit"
                className="inline-flex rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/12"
              >
                Log out
              </button>
            </form>
          </div>

          <p className="mt-5 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
            Last 30 days · Updated {new Date(data.generatedAt).toLocaleString("en-US")}
          </p>

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
        </section>

        {!data.enabled ? (
          <section className="mt-8 rounded-[1.75rem] border border-amber bg-amber/30 p-6">
            <h2 className="font-display text-2xl font-semibold text-ink">Dashboard setup is incomplete.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">
              Add `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and
              `AUTH_GOOGLE_SECRET` to your Vercel project. Once deployed, page views and CTA
              events will start filling this dashboard automatically.
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
                      {data.totalEvents === 1 ? "" : "s"}. Right now that means the dashboard is not broken;
                      it just does not have enough real traffic and click data yet to make the tables feel rich.
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
                          <td className="py-3 pr-4 font-medium text-white">
                            {formatNumber(point.uniqueVisitors)}
                          </td>
                          <td className="py-3 pr-4 font-medium text-white">{formatNumber(point.pageViews)}</td>
                          <td className="py-3 font-medium text-white">
                            {formatNumber(point.downloadClicks)}
                          </td>
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
                  <MetricBarList
                    items={data.eventTypeBreakdown}
                    emptyLabel="No analytics events have been written yet."
                  />
                </div>
              </article>
            </section>

            <section className="mt-8 grid gap-5 lg:grid-cols-3">
              <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                  Key page visits
                </p>
                <div className="mt-5">
                  <MetricBarList items={data.keyPageVisits} emptyLabel="No tracked page visits yet." />
                </div>
              </article>
              <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                  Top pages
                </p>
                <div className="mt-5">
                  <MetricBarList items={data.topPages} emptyLabel="No top pages yet." />
                </div>
              </article>
              <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                  Traffic sources
                </p>
                <div className="mt-5">
                  <MetricBarList items={data.topSources} emptyLabel="No referrer data yet." />
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
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-100">
                    <PanelsTopLeft className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                      Full CTA coverage
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-semibold text-white">
                      Everything you said you want tracked
                    </h2>
                  </div>
                </div>
                <div className="mt-6 max-h-[28rem] overflow-auto pr-1">
                  <MetricList items={data.keyCtaClicks} emptyLabel="No CTA clicks yet." />
                </div>
              </article>
            </section>

            <section className="mt-8 grid gap-5 lg:grid-cols-3">
              <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                  Country
                </p>
                <div className="mt-5">
                  <MetricBarList items={data.countryBreakdown} emptyLabel="No country data yet." />
                </div>
              </article>
              <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                  Device
                </p>
                <div className="mt-5">
                  <MetricBarList items={data.deviceBreakdown} emptyLabel="No device data yet." />
                </div>
              </article>
              <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                  Browser
                </p>
                <div className="mt-5">
                  <MetricBarList items={data.browserBreakdown} emptyLabel="No browser data yet." />
                </div>
              </article>
            </section>

            <section className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-100">
                    <Globe2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                      Acquisition read
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-semibold text-white">
                      Is source quality obvious yet?
                    </h2>
                  </div>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300">
                  <p>
                    Direct traffic, referrer quality, and download click mix become useful only after a few
                    more real visits. Right now the dashboard can already tell whether tracking is healthy, even
                    before the marketing read becomes interesting.
                  </p>
                  <p>
                    The current dataset is small enough that you should treat this as instrumentation validation,
                    not growth analysis yet.
                  </p>
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
                          <td className="py-3 pr-4 text-slate-300">
                            {new Date(event.createdAt).toLocaleString("en-US")}
                          </td>
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
      </div>
    </main>
  );
}
