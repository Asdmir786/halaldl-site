import type { Metadata } from "next";
import { Activity, ArrowRight, MousePointerClick, ShieldCheck, Sparkles } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  ChangeBadge,
  DashboardPanel,
  DataTable,
  DiagnosticsCallout,
  MetricBarList,
  SectionHeading,
  SummaryCard,
  WeeklyBars,
  formatDateTime,
  formatNumber,
} from "@/components/dashboard/dashboard-ui";
import { getDashboardData } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Overview Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

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
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <DashboardPanel
              key={card.label}
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
            </DashboardPanel>
          );
        })}
      </div>

      {!data.enabled ? (
        <div className="mt-6">
          <DiagnosticsCallout
            title="Dashboard setup is incomplete."
            body="Add DATABASE_URL, AUTH_SECRET, AUTH_GOOGLE_ID, and AUTH_GOOGLE_SECRET in Vercel. Once deployed, page views and CTA events will start filling automatically."
            tone="amber"
          />
        </div>
      ) : (
        <>
          <section className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <DashboardPanel>
              <SectionHeading
                eyebrow="Growth signal"
                title="Are more people discovering HalalDL?"
                detail="This view keeps the core health question up front: traffic volume, weekly movement, and whether visits are translating into install intent."
              />
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <SummaryCard
                  label="Total visits"
                  value={formatNumber(data.metrics[0]?.value ?? 0)}
                  detail="Anonymous visits recorded in the last 30 days."
                />
                <SummaryCard
                  label="Unique visitors"
                  value={formatNumber(data.metrics[1]?.value ?? 0)}
                  detail="Privacy-friendly unique visitor count using stored anonymous IDs."
                  accent="mint"
                />
                <SummaryCard
                  label="Install intent"
                  value={formatNumber(data.metrics[3]?.value ?? 0)}
                  detail="Visits that reached a tracked download click or WinGet copy."
                  accent="amber"
                />
              </div>
            </DashboardPanel>

            <DashboardPanel>
              <SectionHeading
                eyebrow="Operator read"
                title="What the site is telling you right now"
              />
              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Latest event</p>
                  <p className="mt-2 text-lg font-semibold text-white">{formatDateTime(data.lastEventAt)}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Current strongest source</p>
                  <p className="mt-2 text-lg font-semibold text-white">{data.topSources[0]?.label ?? "No referrer data yet"}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Current most viewed page</p>
                  <p className="mt-2 text-lg font-semibold text-white">{data.topPages[0]?.label ?? "No page data yet"}</p>
                </div>
              </div>
            </DashboardPanel>
          </section>

          {!hasMeaningfulData && (
            <div className="mt-6">
              <DiagnosticsCallout
                title="Tracking is on, but the dataset is still tiny."
                body={`Only ${formatNumber(data.totalEvents)} recorded event${data.totalEvents === 1 ? "" : "s"} exist right now. The dashboard is working, but it needs more real visitors and real clicks before the patterns become trustworthy.`}
              />
            </div>
          )}

          <section className="mt-6 grid gap-4 lg:grid-cols-5">
            {data.metrics.map((metric) => (
              <DashboardPanel
                key={metric.label}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                  {metric.label}
                </p>
                <p className="mt-3 font-display text-3xl font-semibold text-white">
                  {formatNumber(metric.value)}
                </p>
                <div className="mt-3">
                  <ChangeBadge change={metric.change} />
                </div>
              </DashboardPanel>
            ))}
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <DashboardPanel>
              <SectionHeading
                eyebrow="Weekly trend"
                title="Are more people discovering HalalDL?"
                detail="Visits are the volume signal. Download clicks are the stronger business signal."
              />
              <div className="mt-6">
                <WeeklyBars points={data.weeklyTrend} />
              </div>
            </DashboardPanel>

            <DashboardPanel>
              <SectionHeading
                eyebrow="Tracking health"
                title="Which event types are actually landing?"
              />
              <div className="mt-6">
                <MetricBarList items={data.eventTypeBreakdown} emptyLabel="No analytics events have been written yet." />
              </div>
            </DashboardPanel>
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-2">
            <DashboardPanel>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-100">
                  <MousePointerClick className="h-5 w-5" />
                </span>
                <SectionHeading
                  eyebrow="Download intent"
                  title="Which clicks are closest to install intent?"
                />
              </div>
              <div className="mt-6">
                <MetricBarList items={data.downloadIntent} emptyLabel="No download-intent events yet." tone="mint" />
              </div>
            </DashboardPanel>

            <DashboardPanel>
              <SectionHeading
                eyebrow="Recent events"
                title="What the collector actually saw"
              />
              <div className="mt-6">
                <DataTable
                  headers={["Time", "Type", "Label", "Page"]}
                  rows={data.recentEvents.map((event) => [
                    <span key="time" className="text-slate-300">{new Date(event.createdAt).toLocaleString("en-US")}</span>,
                    <span key="type" className="font-medium text-white">{event.eventType}</span>,
                    <span key="label" className="text-slate-200">{event.label}</span>,
                    <span key="page" className="text-slate-300">{event.pagePath ?? "n/a"}</span>,
                  ])}
                  emptyLabel="No analytics events have been written yet."
                />
              </div>
            </DashboardPanel>
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <DashboardPanel>
              <SectionHeading
                eyebrow="Drop-off"
                title="Are people reaching the download surface but not clicking?"
                detail="This is the fastest simple friction read on the install path."
              />
              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Reached download sections</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{formatNumber((data.metrics[4]?.value ?? 0) + (data.metrics[3]?.value ?? 0))}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Clicked a download action</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(data.metrics[3]?.value ?? 0)}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Reached downloads, no click</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(data.metrics[4]?.value ?? 0)}</p>
                </div>
              </div>
            </DashboardPanel>

            <DashboardPanel>
              <SectionHeading
                eyebrow="Attention map"
                title="Which pages and actions are getting the attention?"
              />
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Top pages</p>
                  <MetricBarList items={data.topPages} emptyLabel="No page data yet." />
                </div>
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Key CTA clicks</p>
                  <MetricBarList items={data.keyCtaClicks.filter((item) => item.value > 0).slice(0, 8)} emptyLabel="No CTA clicks yet." tone="mint" />
                </div>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-300">
                <ArrowRight className="h-4 w-4 text-sky-100" />
                Use the Acquisition view for source quality and the Releases view for package demand.
              </div>
            </DashboardPanel>
          </section>
        </>
      )}
    </DashboardShell>
  );
}
