import { getSiteUrl } from "@/lib/site";
import { ensureAnalyticsSchema, getSql, isAnalyticsEnabled } from "@/lib/analytics-db";
import { getGitHubReleases, getGitHubSnapshot } from "@/lib/github";
import { getSearchConsoleData } from "@/lib/search-console";

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

type EventTypeMetric = {
  label: string;
  value: number;
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
  totalEvents: number;
  lastEventAt: string | null;
  eventTypeBreakdown: EventTypeMetric[];
  metrics: KeyMetricCard[];
  topPages: NamedMetric[];
  topSources: NamedMetric[];
  countryBreakdown: NamedMetric[];
  deviceBreakdown: NamedMetric[];
  browserBreakdown: NamedMetric[];
  keyPageVisits: NamedMetric[];
  keyCtaClicks: NamedMetric[];
  downloadIntent: NamedMetric[];
  weeklyTrend: WeeklyTrendPoint[];
  recentEvents: Array<{
    createdAt: string;
    eventType: string;
    label: string;
    pagePath: string | null;
  }>;
  github: {
    latestRelease: string;
    latestPublishedAt: string;
    releaseDownloads: Array<{ label: string; value: number }>;
    totalAssetDownloads: number;
  };
  searchConsole: {
    configured: boolean;
    connected: boolean;
    error: string | null;
    siteUrl: string | null;
    overview: null | {
      clicks: number;
      impressions: number;
      ctr: number;
      averagePosition: number;
    };
    topQueries: NamedMetric[];
    topPages: NamedMetric[];
    topCountries: NamedMetric[];
    topDevices: NamedMetric[];
  };
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
const EVENT_TYPE_LABELS: Record<string, string> = {
  page_view: "Page views",
  cta_click: "CTA clicks",
  command_copy: "Command copies",
  section_view: "Section views",
};
const DOWNLOAD_INTENT_LABELS: Record<string, string> = {
  download_full: "Download Full EXE",
  download_lite: "Download Lite EXE",
  open_github_release: "Open GitHub Releases",
  winget_install: "Copy WinGet command",
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

async function getEventSummary(days: number) {
  const sql = getSql();
  const [totalRow, typeRows, lastEventRows] = await Promise.all([
    sql`
      select count(*)::int as total
      from analytics_events
      where created_at >= now() - (${days} || ' days')::interval
    `,
    sql`
      select event_type, count(*)::int as value
      from analytics_events
      where created_at >= now() - (${days} || ' days')::interval
      group by event_type
    `,
    sql`
      select created_at
      from analytics_events
      order by created_at desc
      limit 1
    `,
  ]);

  const typeCounts = new Map(
    typeRows.map((row) => [row.event_type as string, asNumber(row.value)]),
  );
  const eventTypeBreakdown = Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => ({
    label,
    value: typeCounts.get(key) ?? 0,
  }));

  return {
    totalEvents: asNumber(totalRow[0]?.total),
    lastEventAt: (lastEventRows[0]?.created_at as string | undefined) ?? null,
    eventTypeBreakdown,
  };
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

  const counts = new Map(rows.map((row) => [row.key as string, asNumber(row.value)]));

  return Object.entries(KEY_CTA_LABELS).map(([key, label]) => ({
    label,
    value: counts.get(key) ?? 0,
  }));
}

async function getDownloadIntent(days: number) {
  const sql = getSql();
  const keys = Object.keys(DOWNLOAD_INTENT_LABELS);
  const rows = await sql`
    with scoped as (
      select cta as key
      from analytics_events
      where event_type = 'cta_click'
        and created_at >= now() - (${days} || ' days')::interval
        and cta = any(${sql.array(keys.filter((key) => key !== "winget_install"))})
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
  `;

  const counts = new Map(rows.map((row) => [row.key as string, asNumber(row.value)]));
  return Object.entries(DOWNLOAD_INTENT_LABELS).map(([key, label]) => ({
    label,
    value: counts.get(key) ?? 0,
  }));
}

async function getRecentEvents(limit: number) {
  const sql = getSql();
  const rows = await sql`
    select created_at, event_type, event_name, page_path, cta, command, section
    from analytics_events
    order by created_at desc
    limit ${limit}
  `;

  return rows.map((row) => {
    const eventType = row.event_type as string;
    const key =
      (row.cta as string | null) ??
      (row.command as string | null) ??
      (row.section as string | null) ??
      (row.event_name as string);

    let label = key;
    if (row.cta && KEY_CTA_LABELS[key]) {
      label = KEY_CTA_LABELS[key];
    } else if (row.command && KEY_CTA_LABELS[key]) {
      label = KEY_CTA_LABELS[key];
    } else if (row.section) {
      label = key === "install_options" ? "Install section viewed" : "Download section viewed";
    } else if (eventType === "page_view") {
      label = KEY_PAGE_LABELS[(row.page_path as string) ?? ""] ?? ((row.page_path as string) || "Page view");
    }

    return {
      createdAt: new Date(row.created_at as string).toISOString(),
      eventType,
      label,
      pagePath: (row.page_path as string | null) ?? null,
    };
  });
}

async function getGitHubDashboardData() {
  const [snapshot, releases] = await Promise.all([getGitHubSnapshot(), getGitHubReleases()]);
  const latestRelease = releases[0];
  const releaseDownloads = (latestRelease?.assets ?? [])
    .filter((asset) => asset.name !== "SHA256SUMS.txt")
    .sort((left, right) => right.downloadCount - left.downloadCount)
    .map((asset) => ({
      label: asset.name,
      value: asset.downloadCount,
    }));

  const totalAssetDownloads = releases.reduce(
    (sum, release) => sum + release.assets.reduce((assetSum, asset) => assetSum + asset.downloadCount, 0),
    0,
  );

  return {
    latestRelease: snapshot.latestVersion,
    latestPublishedAt: snapshot.latestReleaseDate,
    releaseDownloads,
    totalAssetDownloads,
  };
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
      totalEvents: 0,
      lastEventAt: null,
      eventTypeBreakdown: [],
      metrics: [],
      topPages: [],
      topSources: [],
      countryBreakdown: [],
      deviceBreakdown: [],
      browserBreakdown: [],
      keyPageVisits: [],
      keyCtaClicks: [],
      downloadIntent: [],
      weeklyTrend: [],
      recentEvents: [],
      github: {
        latestRelease: "",
        latestPublishedAt: "",
        releaseDownloads: [],
        totalAssetDownloads: 0,
      },
      searchConsole: {
        configured: false,
        connected: false,
        error: null,
        siteUrl: null,
        overview: null,
        topQueries: [],
        topPages: [],
        topCountries: [],
        topDevices: [],
      },
    };
  }

  await ensureAnalyticsSchema();

  const [summary, overview30, overview7, overviewPrev7, topPages, topSources, countryBreakdown, deviceBreakdown, browserBreakdown, keyPageVisits, keyCtaClicks, downloadIntent, weeklyTrend, recentEvents, github, searchConsole] =
    await Promise.all([
      getEventSummary(30),
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
      getDownloadIntent(30),
      getWeeklyTrend(),
      getRecentEvents(12),
      getGitHubDashboardData(),
      getSearchConsoleData(),
    ]);

  const metrics = buildMetricCards(overview30, overview7, overviewPrev7);

  return {
    enabled: true,
    generatedAt: new Date().toISOString(),
    totalEvents: summary.totalEvents,
    lastEventAt: summary.lastEventAt,
    eventTypeBreakdown: summary.eventTypeBreakdown,
    metrics,
    topPages,
    topSources,
    countryBreakdown,
    deviceBreakdown,
    browserBreakdown,
    keyPageVisits,
    keyCtaClicks,
    downloadIntent,
    weeklyTrend,
    recentEvents,
    github,
    searchConsole,
  };
}
