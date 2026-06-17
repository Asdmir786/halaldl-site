import type { Metadata } from "next";
import { Download, FolderDown, PackageOpen } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardData } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Release Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDateTime(value: string | null) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString("en-US");
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

export default async function DashboardReleasesPage() {
  const data = await getDashboardData();

  return (
    <DashboardShell
      currentPage="releases"
      generatedAt={data.generatedAt}
      title="HalalDL releases dashboard"
      description="A release-focused view for GitHub asset download counts and which install packages are getting the most pull right now."
    >
      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Latest release</p>
              <p className="mt-3 font-display text-3xl font-semibold text-white">{data.github.latestRelease || "Unknown"}</p>
              <p className="mt-2 text-sm text-slate-300">Published {formatDateTime(data.github.latestPublishedAt)}</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sky-100"><PackageOpen className="h-5 w-5" /></span>
          </div>
        </article>
        <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Total asset downloads</p>
              <p className="mt-3 font-display text-3xl font-semibold text-white">{formatNumber(data.github.totalAssetDownloads)}</p>
              <p className="mt-2 text-sm text-slate-300">Current cumulative public GitHub counts</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sky-100"><FolderDown className="h-5 w-5" /></span>
          </div>
        </article>
        <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Download intent clicks</p>
              <p className="mt-3 font-display text-3xl font-semibold text-white">{formatNumber(data.downloadIntent.reduce((sum, item) => sum + item.value, 0))}</p>
              <p className="mt-2 text-sm text-slate-300">Website-side clicks nearest to install intent</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sky-100"><Download className="h-5 w-5" /></span>
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">GitHub asset downloads</p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-white">Public release asset counts from GitHub</h2>
          <div className="mt-6">
            <MetricBarList items={data.github.releaseDownloads} emptyLabel="No GitHub release assets were available." />
          </div>
        </article>
        <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Website-side demand</p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-white">What the site is saying people want</h2>
          <div className="mt-6">
            <MetricBarList items={data.downloadIntent} emptyLabel="No download-intent events yet." />
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/6 p-4 text-sm leading-relaxed text-slate-300">
            GitHub counts are cumulative public downloads. Website-side intent is the faster signal for which package visitors are leaning toward before GitHub totals drift upward.
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}
