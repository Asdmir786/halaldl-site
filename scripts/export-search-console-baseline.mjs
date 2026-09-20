import { createSign } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const outputPath = path.resolve(projectRoot, process.argv[2] ?? ".analytics/search-console-flagship-baseline.csv");
const endDate = process.argv[3] ?? new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
const defaultStart = new Date(`${endDate}T00:00:00Z`);
defaultStart.setUTCDate(defaultStart.getUTCDate() - 89);
const startDate = process.argv[4] ?? defaultStart.toISOString().slice(0, 10);
const pageUrl = process.argv[5] ?? "https://halaldl.vercel.app/guides/best-yt-dlp-gui-windows";

function base64Url(input) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function parseEnvLine(line) {
  const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (!match) return null;
  let value = match[2].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return [match[1], value.replace(/\\n/g, "\n")];
}

async function loadLocalEnvironment() {
  const envPath = path.join(projectRoot, ".env.local");
  if (!existsSync(envPath)) return;
  const contents = await readFile(envPath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (parsed && !process.env[parsed[0]]) process.env[parsed[0]] = parsed[1];
  }
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

await loadLocalEnvironment();
const clientEmail = process.env.GSC_CLIENT_EMAIL;
const privateKey = process.env.GSC_PRIVATE_KEY;
const siteUrl = process.env.GSC_SITE_URL;
if (!clientEmail || !privateKey || !siteUrl) {
  throw new Error("GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY, and GSC_SITE_URL are required.");
}

const issuedAt = Math.floor(Date.now() / 1000);
const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
const claims = base64Url(JSON.stringify({
  iss: clientEmail,
  scope: "https://www.googleapis.com/auth/webmasters.readonly",
  aud: "https://oauth2.googleapis.com/token",
  iat: issuedAt,
  exp: issuedAt + 3600,
}));
const unsignedToken = `${header}.${claims}`;
const signer = createSign("RSA-SHA256");
signer.update(unsignedToken);
signer.end();
const assertion = `${unsignedToken}.${base64Url(signer.sign(privateKey))}`;

const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
});
if (!tokenResponse.ok) throw new Error(`Google OAuth failed with HTTP ${tokenResponse.status}.`);
const { access_token: accessToken } = await tokenResponse.json();

const rows = [];
const rowLimit = 25_000;
for (let startRow = 0; ; startRow += rowLimit) {
  const response = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({
        startDate,
        endDate,
        type: "web",
        dataState: "final",
        dimensions: ["date", "query", "device", "country"],
        dimensionFilterGroups: [{
          groupType: "and",
          filters: [{ dimension: "page", operator: "equals", expression: pageUrl }],
        }],
        rowLimit,
        startRow,
      }),
    },
  );
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const reason = errorPayload?.error?.errors?.[0]?.reason ?? "unknown_reason";
    throw new Error(`Search Console query failed with HTTP ${response.status} (${reason}).`);
  }
  const payload = await response.json();
  const pageRows = payload.rows ?? [];
  rows.push(...pageRows);
  if (pageRows.length < rowLimit) break;
}

const csvRows = [
  ["date", "query", "device", "country", "clicks", "impressions", "ctr", "position"],
  ...rows.map((row) => [row.keys?.[0], row.keys?.[1], row.keys?.[2], row.keys?.[3], row.clicks, row.impressions, row.ctr, row.position]),
];
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${csvRows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`, "utf8");

const totals = rows.reduce((summary, row) => {
  summary.clicks += row.clicks ?? 0;
  summary.impressions += row.impressions ?? 0;
  return summary;
}, { clicks: 0, impressions: 0 });
console.log(JSON.stringify({ outputPath, pageUrl, startDate, endDate, rows: rows.length, ...totals }));
