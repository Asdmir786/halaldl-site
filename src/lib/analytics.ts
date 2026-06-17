import { getSiteUrl } from "@/lib/site";
import { ensureAnalyticsSchema, getSql, isAnalyticsEnabled } from "@/lib/analytics-db";

type OverviewMetrics = {
  totalVisits: number;
  uniqueVisitors: number;
  pageViews: number;
  downloadSectionVisits: number;
  downloadClickVisits: number;
  downloadDropOffVisits: number;
};

type KeyMetricCard = {
  label: string;
  value: number;
  change: number | null;
};

type NamedMetric = {
  label: string;
  value: number;
};

type WeeklyTrendPoint = {
  weekStart: string;
  visits: number;
  uniqueVisitors: number;
  pageViews: number;
  downloadClicks: number;
};

export type DashboardData = {
  enabled: boolean;
  generatedAt: string;
  metrics: KeyMetricCard[];
  topPages: NamedMetric[];
  topSources: NamedMetric[];
  countryBreakdown: NamedMetric[];
  deviceBreakdown: NamedMetric[];
  browserBreakdown: NamedMetric[];
  keyPageVisits: NamedMetric[];
  keyCtaClicks: NamedMetric[];
  weeklyTrend: WeeklyTrendPoint[];
};

const DOWNLOAD_ACTIONS = ["download_full", "download_lite", "open_github_release"] as const;
const DOWNLOAD_COMMANDS = ["winget_install"] as const;
const KEY_PAGE_LABELS: Record<string, string> = {
  "/": "Homepage",
  "/download": "Download",
  "/changelog": "Changelog",
  "/install/windows": "Install guide",
  "/trust/verify-checksum": "Verify checksum",
  "/compare/full-vs-lite": "Full vs Lite",
};
const KEY_CTA_LABELS: Record<string, string> = {
  download_full: "Download Full EXE",
  download_lite: "Download Lite EXE",
  open_github_release: "Open GitHub Releases",
  open_support_docs: "Open docs / support",
  open_support_issues: "Open support / issues",
  open_install_guide: "Open install guide",
  open_changelog: "Open changelog",
  open_verify_guide: "Open verify guide",
  compare_full_vs_lite: "Compare Full vs Lite",
  view_github_repo: "Open GitHub repo",
  go_to_download: "Go to download page",
  open_checksums: "Open SHA256SUMS",
  winget_install: "Copy WinGet install command",
};

function asNumber(value: unknown) {
  return Number(value ?? 0);
}

function formatWeekStart(value: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

async function getOverviewMetrics(days: number) {
  return getOverviewMetricsRange(0, days);
}

async function getOverviewMetricsRange(startDaysAgo: number, endDaysAgo: number) {
  const sql = getSql();
  const [row] = await sql`
    with scoped as (
      select *
      from analytics_events
      where created_at >= now() - (${endDaysAgo} || ' days')::interval
        and created_at < now() - (${startDaysAgo} || ' days')::interval
    ),
    section_sessions as (
      select distinct session_id
      from scoped
      where event_type = 'section_view'
        and section in ('install_options', 'download_options')
    ),
    click_sessions as (
      select distinct session_id
      from scoped
      where (
        event_type = 'cta_click'
        and cta = any(${sql.array([...DOWNLOAD_ACTIONS])})
      ) or (
        event_type = 'command_copy'
        and command = any(${sql.array([...DOWNLOAD_COMMANDS])})
      )
    )
    select
      count(*) filter (where event_type = 'page_view') as page_views,
      count(distinct session_id) filter (where event_type = 'page_view') as total_visits,
      count(distinct visitor_id) filter (where event_type = 'page_view') as unique_visitors,
      (select count(*) from section_sessions) as download_section_visits,
      (select count(*) from click_sessions) as download_click_visits,
      (
        select count(*)
        from section_sessions ss
        where not exists (
          select 1
          from click_sessions cs
          where cs.session_id = ss.session_id
        )
      ) as download_drop_off_visits
    from scoped
  `;

  return {
    totalVisits: asNumber(row?.total_visits),
    uniqueVisitors: asNumber(row?.unique_visitors),
    pageViews: asNumber(row?.page_views),
    downloadSectionVisits: asNumber(row?.download_section_visits),
    downloadClickVisits: asNumber(row?.download_click_visits),
    downloadDropOffVisits: asNumber(row?.download_drop_off_visits),
  } satisfies OverviewMetrics;
}

async function getTopPages(days: number) {
  const sql = getSql();
  const rows = await sql`
    select page_path, count(*)::int as value
    from analytics_events
    where event_type = 'page_view'
      and created_at >= now() - (${days} || ' days')::interval
      and page_path is not null
    group by page_path
    order by value desc, page_path asc
    limit 8
  `;

  return rows.map((row) => ({
    label: KEY_PAGE_LABELS[row.page_path as string] ?? (row.page_path as string),
    value: asNumber(row.value),
  }));
}

async function getTopSources(days: number) {
  const sql = getSql();
  const siteHost = getSiteUrl().host;
  const rows = await sql`
    select
      case
        when source_host is null or source_host = '' then 'Direct'
        when source_host = ${siteHost} then 'Internal navigation'
        else source_host
      end as label,
      count(*)::int as value
    from analytics_events
    where event_type = 'page_view'
      and created_at >= now() - (${days} || ' days')::interval
    group by label
    order by value desc, label asc
    limit 8
  `;

  return rows.map((row) => ({
    label: row.label as string,
    value: asNumber(row.value),
  }));
}

async function getBreakdown(column: "country" | "device_type" | "browser", days: number) {
  const sql = getSql();
  const identifier = sql.unsafe(column);
  const rows = await sql`
    select coalesce(${identifier}, 'Unknown') as label, count(*)::int as value
    from analytics_events
    where event_type = 'page_view'
      and created_at >= now() - (${days} || ' days')::interval
    group by ${identifier}
    order by value desc, label asc
    limit 8
  `;

  return rows.map((row) => ({
    label: row.label as string,
    value: asNumber(row.value),
  }));
}

async function getKeyPageVisits(days: number) {
  const sql = getSql();
  const pagePaths = Object.keys(KEY_PAGE_LABELS);
  const rows = await sql`
    select page_path, count(*)::int as value
    from analytics_events
    where event_type = 'page_view'
      and created_at >= now() - (${days} || ' days')::interval
      and page_path = any(${sql.array(pagePaths)})
    group by page_path
  `;

  const counts = new Map(rows.map((row) => [row.page_path as string, asNumber(row.value)]));
  return pagePaths.map((pagePath) => ({
    label: KEY_PAGE_LABELS[pagePath],
    value: counts.get(pagePath) ?? 0,
  }));
}

async function getKeyCtaClicks(days: number) {
  const sql = getSql();
  const ctas = Object.keys(KEY_CTA_LABELS).filter((key) => key !== "winget_install");
  const rows = await sql`
    with scoped as (
      select cta as key
      from analytics_events
      where event_type = 'cta_click'
        and created_at >= now() - (${days} || ' days')::interval
        and cta = any(${sql.array(ctas)})
      union all
      select command as key
      from analytics_events
      where event_type = 'command_copy'
        and created_at >= now() - (${days} || ' days')::interval
        and command = 'winget_install'
    )
    select key, count(*)::int as value
    from scoped
    where key is not null
    group by key
    order by value desc, key asc
  `;

  return rows.map((row) => ({
    label: KEY_CTA_LABELS[row.key as string] ?? (row.key as string),
    value: asNumber(row.value),
  }));
}

async function getWeeklyTrend() {
  const sql = getSql();
  const rows = await sql`
    select
      date_trunc('week', created_at)::date as week_start,
      count(*) filter (where event_type = 'page_view')::int as page_views,
      count(distinct session_id) filter (where event_type = 'page_view')::int as visits,
      count(distinct visitor_id) filter (where event_type = 'page_view')::int as unique_visitors,
      count(*) filter (
        where (
          event_type = 'cta_click'
          and cta = any(${sql.array([...DOWNLOAD_ACTIONS])})
        ) or (
          event_type = 'command_copy'
          and command = any(${sql.array([...DOWNLOAD_COMMANDS])})
        )
      )::int as download_clicks
    from analytics_events
    where created_at >= now() - interval '8 weeks'
    group by week_start
    order by week_start asc
  `;

  return rows.map((row) => ({
    weekStart: formatWeekStart(row.week_start as string),
    visits: asNumber(row.visits),
    uniqueVisitors: asNumber(row.unique_visitors),
    pageViews: asNumber(row.page_views),
    downloadClicks: asNumber(row.download_clicks),
  }));
}

function buildMetricCards(current30: OverviewMetrics, current7: OverviewMetrics, previous7: OverviewMetrics) {
  const items: Array<{ label: string; value: number; currentWeek: number; previousWeek: number }> = [
    {
      label: "Total visits",
      value: current30.totalVisits,
      currentWeek: current7.totalVisits,
      previousWeek: previous7.totalVisits,
    },
    {
      label: "Unique visitors",
      value: current30.uniqueVisitors,
      currentWeek: current7.uniqueVisitors,
      previousWeek: previous7.uniqueVisitors,
    },
    {
      label: "Page views",
      value: current30.pageViews,
      currentWeek: current7.pageViews,
      previousWeek: previous7.pageViews,
    },
    {
      label: "Download click visits",
      value: current30.downloadClickVisits,
      currentWeek: current7.downloadClickVisits,
      previousWeek: previous7.downloadClickVisits,
    },
    {
      label: "Reached downloads, no click",
      value: current30.downloadDropOffVisits,
      currentWeek: current7.downloadDropOffVisits,
      previousWeek: previous7.downloadDropOffVisits,
    },
  ];

  return items.map((item) => ({
    label: item.label,
    value: item.value,
    change: item.previousWeek === 0 ? null : item.currentWeek - item.previousWeek,
  }));
}

export async function getDashboardData(): Promise<DashboardData> {
  if (!isAnalyticsEnabled()) {
    return {
      enabled: false,
      generatedAt: new Date().toISOString(),
      metrics: [],
      topPages: [],
      topSources: [],
      countryBreakdown: [],
      deviceBreakdown: [],
      browserBreakdown: [],
      keyPageVisits: [],
      keyCtaClicks: [],
      weeklyTrend: [],
    };
  }

  await ensureAnalyticsSchema();

  const [overview30, overview7, overviewPrev7, topPages, topSources, countryBreakdown, deviceBreakdown, browserBreakdown, keyPageVisits, keyCtaClicks, weeklyTrend] =
    await Promise.all([
      getOverviewMetrics(30),
      getOverviewMetricsRange(0, 7),
      getOverviewMetricsRange(7, 14),
      getTopPages(30),
      getTopSources(30),
      getBreakdown("country", 30),
      getBreakdown("device_type", 30),
      getBreakdown("browser", 30),
      getKeyPageVisits(30),
      getKeyCtaClicks(30),
      getWeeklyTrend(),
    ]);

  const metrics = buildMetricCards(overview30, overview7, overviewPrev7);

  return {
    enabled: true,
    generatedAt: new Date().toISOString(),
    metrics,
    topPages,
    topSources,
    countryBreakdown,
    deviceBreakdown,
    browserBreakdown,
    keyPageVisits,
    keyCtaClicks,
    weeklyTrend,
  };
}
