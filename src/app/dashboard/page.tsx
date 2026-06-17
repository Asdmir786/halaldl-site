import type { Metadata } from "next";
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

  return (
    <main id="main-content" className="overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8">
        <section className="surface-elevated rounded-[2rem] p-7 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Internal analytics</p>
              <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
                HalalDL growth dashboard
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft sm:text-base">
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
                className="inline-flex rounded-2xl border border-line-strong bg-paper px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-strong"
              >
                Log out
              </button>
            </form>
          </div>

          <p className="mt-5 text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
            Last 30 days · Updated {new Date(data.generatedAt).toLocaleString("en-US")}
          </p>
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
            <section className="mt-8 grid gap-4 lg:grid-cols-5">
              {data.metrics.map((metric) => (
                <article key={metric.label} className="surface-card-static rounded-[1.6rem] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    {metric.label}
                  </p>
                  <p className="mt-3 font-display text-3xl font-semibold text-ink">
                    {formatNumber(metric.value)}
                  </p>
                  <div className="mt-3">
                    <ChangePill change={metric.change} />
                  </div>
                </article>
              ))}
            </section>

            <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Weekly trend
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
                  Are more people discovering HalalDL?
                </h2>
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-ink-muted">
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
                        <tr key={point.weekStart} className="border-t border-line/70">
                          <td className="py-3 pr-4 text-ink-soft">{point.weekStart}</td>
                          <td className="py-3 pr-4 font-medium text-ink">{formatNumber(point.visits)}</td>
                          <td className="py-3 pr-4 font-medium text-ink">
                            {formatNumber(point.uniqueVisitors)}
                          </td>
                          <td className="py-3 pr-4 font-medium text-ink">{formatNumber(point.pageViews)}</td>
                          <td className="py-3 font-medium text-ink">
                            {formatNumber(point.downloadClicks)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Key page visits
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
                  Which pages are getting attention?
                </h2>
                <div className="mt-6">
                  <MetricList items={data.keyPageVisits} emptyLabel="No tracked page visits yet." />
                </div>
              </article>
            </section>

            <section className="mt-8 grid gap-5 lg:grid-cols-3">
              <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Top pages
                </p>
                <div className="mt-5">
                  <MetricList items={data.topPages} emptyLabel="No top pages yet." />
                </div>
              </article>
              <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Traffic sources
                </p>
                <div className="mt-5">
                  <MetricList items={data.topSources} emptyLabel="No referrer data yet." />
                </div>
              </article>
              <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  CTA clicks
                </p>
                <div className="mt-5">
                  <MetricList items={data.keyCtaClicks} emptyLabel="No CTA clicks yet." />
                </div>
              </article>
            </section>

            <section className="mt-8 grid gap-5 lg:grid-cols-3">
              <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Country
                </p>
                <div className="mt-5">
                  <MetricList items={data.countryBreakdown} emptyLabel="No country data yet." />
                </div>
              </article>
              <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Device
                </p>
                <div className="mt-5">
                  <MetricList items={data.deviceBreakdown} emptyLabel="No device data yet." />
                </div>
              </article>
              <article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Browser
                </p>
                <div className="mt-5">
                  <MetricList items={data.browserBreakdown} emptyLabel="No browser data yet." />
                </div>
              </article>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
