import type { Metadata } from "next";
import { Globe2, Search, TrendingUp } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  DashboardPanel,
  DiagnosticsCallout,
  MetricBarList,
  SectionHeading,
  SummaryCard,
  formatNumber,
  formatPercent,
} from "@/components/dashboard/dashboard-ui";
import { getDashboardData } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Acquisition Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardAcquisitionPage() {
  const data = await getDashboardData();

  return (
    <DashboardShell
      currentPage="acquisition"
      generatedAt={data.generatedAt}
      title="HalalDL acquisition dashboard"
      description="A dedicated view for traffic sources, organic search demand, and which discovery channels are producing the strongest site interest."
    >
      <section className="mt-6 grid gap-4 xl:grid-cols-4">
        <SummaryCard
          label="Top source"
          value={data.topSources[0]?.label ?? "No source yet"}
          detail={`${formatNumber(data.topSources[0]?.value ?? 0)} visits from the current strongest source.`}
        />
        <SummaryCard
          label="Top country"
          value={data.countryBreakdown[0]?.label ?? "No country yet"}
          detail={`${formatNumber(data.countryBreakdown[0]?.value ?? 0)} visits from the current strongest geography.`}
          accent="mint"
        />
        <SummaryCard
          label="Top device"
          value={data.deviceBreakdown[0]?.label ?? "No device yet"}
          detail={`${formatNumber(data.deviceBreakdown[0]?.value ?? 0)} visits from the current leading device type.`}
        />
        <SummaryCard
          label="Search Console"
          value={
            data.searchConsole.connected
              ? `${formatNumber(data.searchConsole.overview?.clicks ?? 0)} clicks`
              : data.searchConsole.configured
                ? "Needs access"
                : "Not configured"
          }
          detail={
            data.searchConsole.connected
              ? "Organic discovery is now feeding into this dashboard."
              : "This block shows whether Google search demand is truly wired through."
          }
          accent="amber"
        />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr_0.9fr]">
        <DashboardPanel>
          <SectionHeading eyebrow="Traffic sources" title="Which sources are sending people here?" />
          <div className="mt-6">
            <MetricBarList items={data.topSources} emptyLabel="No referrer data yet." />
          </div>
        </DashboardPanel>
        <DashboardPanel>
          <SectionHeading eyebrow="Landing attention" title="Which pages are discovery sources feeding?" />
          <div className="mt-6">
            <MetricBarList items={data.topPages} emptyLabel="No landing-page data yet." tone="mint" />
          </div>
        </DashboardPanel>
        <DashboardPanel>
          <SectionHeading eyebrow="Audience shape" title="Where and how are people arriving?" />
          <div className="mt-6 grid gap-4">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Country</p>
              <MetricBarList items={data.countryBreakdown} emptyLabel="No country data yet." />
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Device</p>
              <MetricBarList items={data.deviceBreakdown} emptyLabel="No device data yet." />
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Browser</p>
              <MetricBarList items={data.browserBreakdown} emptyLabel="No browser data yet." />
            </div>
          </div>
        </DashboardPanel>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <DashboardPanel>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-100">
              <Search className="h-5 w-5" />
            </span>
            <SectionHeading eyebrow="Google Search Console" title="Organic discovery" />
          </div>
          {!data.searchConsole.configured || !data.searchConsole.connected ? (
            <div className="mt-6">
              <DiagnosticsCallout
                title={!data.searchConsole.configured ? "Search Console is not configured yet." : "Search Console is configured, but not connected yet."}
                body={
                  data.searchConsole.error ??
                  "Add GSC_SITE_URL, GSC_CLIENT_EMAIL, and GSC_PRIVATE_KEY, then add the service-account email as a user on the exact Search Console property."
                }
                tone="amber"
              />
              {data.searchConsole.siteUrl ? (
                <p className="mt-4 text-sm text-slate-300">Expected property URL: <span className="font-medium text-white">{data.searchConsole.siteUrl}</span></p>
              ) : null}
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Clicks</p><p className="mt-2 font-display text-2xl font-semibold text-white">{formatNumber(data.searchConsole.overview?.clicks ?? 0)}</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Impressions</p><p className="mt-2 font-display text-2xl font-semibold text-white">{formatNumber(data.searchConsole.overview?.impressions ?? 0)}</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">CTR</p><p className="mt-2 font-display text-2xl font-semibold text-white">{formatPercent(data.searchConsole.overview?.ctr ?? 0)}</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Avg position</p><p className="mt-2 font-display text-2xl font-semibold text-white">{(data.searchConsole.overview?.averagePosition ?? 0).toFixed(1)}</p></div>
              </div>
              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Top queries</p><MetricBarList items={data.searchConsole.topQueries} emptyLabel="No query data yet." /></div>
                <div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Top pages</p><MetricBarList items={data.searchConsole.topPages} emptyLabel="No landing-page data yet." /></div>
              </div>
            </>
          )}
        </DashboardPanel>

        <DashboardPanel>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-100">
              <Globe2 className="h-5 w-5" />
            </span>
            <SectionHeading eyebrow="Readout" title="What this tells you" />
          </div>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300">
            <p>Search Console answers whether people are finding HalalDL through Google, what queries they use, and which pages are attracting impressions and clicks.</p>
            <p>The site analytics layer answers what those visitors do after they land, especially whether they move into download intent or bounce early.</p>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
              <div className="flex items-center gap-2 text-sky-100"><TrendingUp className="h-4 w-4" /><span className="text-sm font-semibold">Best combined read</span></div>
              <p className="mt-2 text-sm text-slate-300">Rising Search Console clicks plus rising download-intent clicks is your strongest simple growth signal.</p>
            </div>
          </div>
        </DashboardPanel>
      </section>
    </DashboardShell>
  );
}
