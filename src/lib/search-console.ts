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
  connected: boolean;
  error: string | null;
  siteUrl: string | null;
  topCountries: Array<{ label: string; value: number }>;
  topDevices: Array<{ label: string; value: number }>;
  topPages: Array<{ label: string; value: number }>;
  topQueries: Array<{ label: string; value: number }>;
  overview: SearchConsoleOverview | null;
};

function sanitizeEnvValue(value: string | undefined | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const unwrapped =
    trimmed.length >= 2 &&
    ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
      ? trimmed.slice(1, -1)
      : trimmed;

  return unwrapped.trim() || null;
}

function normalizePrivateKey(value: string | undefined | null) {
  const sanitized = sanitizeEnvValue(value);
  return sanitized?.replace(/\\n/g, "\n") ?? null;
}

function getSearchConsoleConfig() {
  const siteUrl = sanitizeEnvValue(process.env.GSC_SITE_URL) ?? sanitizeEnvValue(process.env.NEXT_PUBLIC_SITE_URL);
  const clientEmail = sanitizeEnvValue(process.env.GSC_CLIENT_EMAIL);
  const privateKey = normalizePrivateKey(process.env.GSC_PRIVATE_KEY);

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

function toSearchConsoleError(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      code?: string | number;
      message?: string;
      status?: number;
      response?: { data?: { error?: { message?: string } } };
      errors?: Array<{ message?: string }>;
    };

    const nestedMessage =
      maybeError.response?.data?.error?.message ??
      maybeError.errors?.[0]?.message ??
      maybeError.message ??
      null;

    if (maybeError.code === "ERR_OSSL_UNSUPPORTED") {
      return "The Search Console private key format is invalid. Remove wrapping quotes and keep literal \\n line breaks in the env value.";
    }

    if (maybeError.status === 403 || maybeError.status === 401) {
      if (nestedMessage?.includes("Search Console API has not been used") || nestedMessage?.includes("disabled")) {
        return "The Google Search Console API is still disabled for the Google project behind this service account. Enable searchconsole.googleapis.com, wait a few minutes, then redeploy.";
      }

      return "The service account can authenticate, but it does not have access to the exact Search Console property yet.";
    }

    if (maybeError.status === 400) {
      return "The Search Console property URL looks invalid. Use the exact property URL, including the trailing slash for URL-prefix properties.";
    }

    if (nestedMessage) {
      return nestedMessage;
    }
  }

  return "Search Console could not be queried yet.";
}

export async function getSearchConsoleData(): Promise<SearchConsoleData> {
  const { siteUrl } = getSearchConsoleConfig();

  if (!isSearchConsoleConfigured()) {
    return {
      configured: false,
      connected: false,
      error: "Missing one or more Search Console environment variables.",
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
      connected: true,
      error: null,
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
  } catch (error) {
    return {
      configured: true,
      connected: false,
      error: toSearchConsoleError(error),
      siteUrl,
      topCountries: [],
      topDevices: [],
      topPages: [],
      topQueries: [],
      overview: null,
    };
  }
}
