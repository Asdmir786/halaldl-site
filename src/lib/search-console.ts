import { google } from "googleapis";

type SearchConsoleOverview = {
  averagePosition: number;
  clicks: number;
  ctr: number;
  impressions: number;
};

type SearchConsoleRow = {
  keys?: string[];
  clicks?: number | null;
  ctr?: number | null;
  impressions?: number | null;
  position?: number | null;
};

type SearchConsoleResponse = {
  rows?: SearchConsoleRow[];
};

export type SearchConsoleData = {
  configured: boolean;
  siteUrl: string | null;
  topCountries: Array<{ label: string; value: number }>;
  topDevices: Array<{ label: string; value: number }>;
  topPages: Array<{ label: string; value: number }>;
  topQueries: Array<{ label: string; value: number }>;
  overview: SearchConsoleOverview | null;
};

function getSearchConsoleConfig() {
  const siteUrl = process.env.GSC_SITE_URL?.trim() ?? process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? null;
  const clientEmail = process.env.GSC_CLIENT_EMAIL?.trim() ?? null;
  const privateKey = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? null;

  return {
    siteUrl,
    clientEmail,
    privateKey,
  };
}

function isSearchConsoleConfigured() {
  const config = getSearchConsoleConfig();
  return Boolean(config.siteUrl && config.clientEmail && config.privateKey);
}

async function runQuery(dimensions: string[], rowLimit = 8) {
  const { siteUrl, clientEmail, privateKey } = getSearchConsoleConfig();
  if (!siteUrl || !clientEmail || !privateKey) {
    return [] as SearchConsoleRow[];
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  const searchconsole = google.searchconsole({ version: "v1", auth });
  const response = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      dimensions,
      rowLimit,
      dataState: "final",
    },
  });

  return (response.data as SearchConsoleResponse | undefined)?.rows ?? [];
}

function toNamedMetric(rows: SearchConsoleRow[]) {
  return rows.map((row) => ({
    label: row.keys?.[0] ?? "Unknown",
    value: Math.round(row.clicks ?? 0),
  }));
}

export async function getSearchConsoleData(): Promise<SearchConsoleData> {
  const { siteUrl } = getSearchConsoleConfig();

  if (!isSearchConsoleConfigured()) {
    return {
      configured: false,
      siteUrl,
      topCountries: [],
      topDevices: [],
      topPages: [],
      topQueries: [],
      overview: null,
    };
  }

  try {
    const [overviewRows, queryRows, pageRows, countryRows, deviceRows] = await Promise.all([
      runQuery([], 1),
      runQuery(["query"], 8),
      runQuery(["page"], 8),
      runQuery(["country"], 8),
      runQuery(["device"], 8),
    ]);

    const overviewRow = overviewRows[0];

    return {
      configured: true,
      siteUrl,
      overview: overviewRow
        ? {
            clicks: Math.round(overviewRow.clicks ?? 0),
            impressions: Math.round(overviewRow.impressions ?? 0),
            ctr: Number((((overviewRow.ctr ?? 0) * 100)).toFixed(2)),
            averagePosition: Number((overviewRow.position ?? 0).toFixed(1)),
          }
        : null,
      topQueries: toNamedMetric(queryRows),
      topPages: toNamedMetric(
        pageRows.map((row) => ({
          ...row,
          keys: [row.keys?.[0]?.replace(siteUrl ?? "", "") || row.keys?.[0] || "Unknown"],
        })),
      ),
      topCountries: toNamedMetric(countryRows),
      topDevices: toNamedMetric(deviceRows),
    };
  } catch {
    return {
      configured: false,
      siteUrl,
      topCountries: [],
      topDevices: [],
      topPages: [],
      topQueries: [],
      overview: null,
    };
  }
}
