import type { Metadata } from "next";
import { Globe2, Search, TrendingUp } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardData } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Acquisition Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function MetricBarList({
  items,
  emptyLabel,
}: {
  items: Array<{ label: string; value: number }>;
  emptyLabel: string;
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 0);
  if (items.length === 0) return <p className="text-sm text-slate-300">{emptyLabel}</p>;

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

export default async function DashboardAcquisitionPage() {
  const data = await getDashboardData();

  return (
    <DashboardShell
      currentPage="acquisition"
      generatedAt={data.generatedAt}
      title="HalalDL acquisition dashboard"
      description="A dedicated view for traffic sources, organic search demand, and which discovery channels are producing the strongest site interest."
    >
      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Traffic sources</p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-white">Which sources are sending people here?</h2>
          <div className="mt-6">
            <MetricBarList items={data.topSources} emptyLabel="No referrer data yet." />
          </div>
        </article>
        <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Country</p>
          <div className="mt-5">
            <MetricBarList items={data.countryBreakdown} emptyLabel="No country data yet." />
          </div>
        </article>
        <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Device</p>
          <div className="mt-5">
            <MetricBarList items={data.deviceBreakdown} emptyLabel="No device data yet." />
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-100">
              <Search className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Google Search Console</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-white">Organic discovery</h2>
            </div>
          </div>
          {!data.searchConsole.configured ? (
            <div className="mt-6 rounded-2xl border border-amber/30 bg-amber/10 p-4 text-sm leading-relaxed text-slate-200">
              Search Console credentials are still missing or permission is incomplete. Add `GSC_SITE_URL`, `GSC_CLIENT_EMAIL`,
              and `GSC_PRIVATE_KEY`, then add the service-account email as a Search Console user.
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
        </article>

        <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-100">
              <Globe2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Readout</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-white">What this tells you</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300">
            <p>Search Console answers whether people are finding HalalDL through Google, what queries they use, and which pages are attracting impressions and clicks.</p>
            <p>The site analytics layer answers what those visitors do after they land, especially whether they move into download intent or bounce early.</p>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
              <div className="flex items-center gap-2 text-sky-100"><TrendingUp className="h-4 w-4" /><span className="text-sm font-semibold">Best combined read</span></div>
              <p className="mt-2 text-sm text-slate-300">Rising Search Console clicks plus rising download-intent clicks is your strongest simple growth signal.</p>
            </div>
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}
