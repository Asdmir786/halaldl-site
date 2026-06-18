import type { Metadata } from "next";
import { Download, FolderDown, PackageOpen } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  DashboardPanel,
  MetricBarList,
  SectionHeading,
  SummaryCard,
  formatDateTime,
  formatNumber,
} from "@/components/dashboard/dashboard-ui";
import { getDashboardData } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Release Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardReleasesPage() {
  const data = await getDashboardData();
  const topGitHubAsset = data.github.releaseDownloads[0];
  const topIntent = data.downloadIntent.reduce((best, current) => (current.value > best.value ? current : best), {
    label: "No website-side intent yet",
    value: 0,
  });

  return (
    <DashboardShell
      currentPage="releases"
      generatedAt={data.generatedAt}
      title="HalalDL releases dashboard"
      description="A release-focused view for GitHub asset download counts and which install packages are getting the most pull right now."
    >
      <section className="mt-6 grid gap-4 xl:grid-cols-4">
        <SummaryCard
          label="Latest release"
          value={data.github.latestRelease || "Unknown"}
          detail={`Published ${formatDateTime(data.github.latestPublishedAt)}`}
        />
        <SummaryCard
          label="Total asset downloads"
          value={formatNumber(data.github.totalAssetDownloads)}
          detail="Current cumulative public GitHub counts."
          accent="mint"
        />
        <SummaryCard
          label="Top GitHub asset"
          value={topGitHubAsset?.label ?? "No asset yet"}
          detail={`${formatNumber(topGitHubAsset?.value ?? 0)} public downloads on the strongest current asset.`}
        />
        <SummaryCard
          label="Website-side intent"
          value={formatNumber(data.downloadIntent.reduce((sum, item) => sum + item.value, 0))}
          detail={`Current leading intent signal: ${topIntent.label}.`}
          accent="amber"
        />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardPanel>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-100"><FolderDown className="h-5 w-5" /></span>
            <SectionHeading eyebrow="GitHub asset downloads" title="Public release asset counts from GitHub" />
          </div>
          <div className="mt-6">
            <MetricBarList items={data.github.releaseDownloads} emptyLabel="No GitHub release assets were available." />
          </div>
        </DashboardPanel>
        <DashboardPanel>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-100"><Download className="h-5 w-5" /></span>
            <SectionHeading eyebrow="Website-side demand" title="What the site is saying people want" />
          </div>
          <div className="mt-6">
            <MetricBarList items={data.downloadIntent} emptyLabel="No download-intent events yet." tone="mint" />
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/6 p-4 text-sm leading-relaxed text-slate-300">
            GitHub counts are cumulative public downloads. Website-side intent is the faster signal for which package visitors are leaning toward before GitHub totals drift upward.
          </div>
        </DashboardPanel>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <DashboardPanel>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-100"><PackageOpen className="h-5 w-5" /></span>
            <SectionHeading eyebrow="Release summary" title="What release state are you looking at?" />
          </div>
          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Latest release</p>
              <p className="mt-2 text-2xl font-semibold text-white">{data.github.latestRelease || "Unknown"}</p>
              <p className="mt-2 text-sm text-slate-300">Published {formatDateTime(data.github.latestPublishedAt)}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Top GitHub asset</p>
              <p className="mt-2 text-lg font-semibold text-white">{topGitHubAsset?.label ?? "No asset yet"}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Current strongest intent click</p>
              <p className="mt-2 text-lg font-semibold text-white">{topIntent.label}</p>
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <SectionHeading
            eyebrow="Demand read"
            title="How to read GitHub downloads vs site intent"
            detail="GitHub tells you cumulative public adoption. Site intent tells you what people are leaning toward before those public totals catch up."
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Best fit for GitHub data</p>
              <ul className="mt-3 space-y-3 text-sm leading-relaxed text-slate-300">
                <li>Which release asset is actually accumulating demand over time.</li>
                <li>Whether the Full build is staying ahead of Lite in public installs.</li>
                <li>Whether release adoption is still climbing after publish day.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Best fit for website intent</p>
              <ul className="mt-3 space-y-3 text-sm leading-relaxed text-slate-300">
                <li>Which package option visitors currently prefer.</li>
                <li>Whether WinGet curiosity is rising or falling.</li>
                <li>Whether people reach the install area but hesitate to click.</li>
              </ul>
            </div>
          </div>
        </DashboardPanel>
      </section>
    </DashboardShell>
  );
}
