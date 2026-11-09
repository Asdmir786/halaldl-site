import assert from "node:assert/strict";
import test from "node:test";

test("session setup rejects malformed or oversized bodies before verification", async () => {
  const headers={"content-type":"application/json"};
  assert.equal((await call('/api/fetch/clearance',{method:'POST',headers,body:'{'})).status,400);
  assert.equal((await call('/api/fetch/clearance',{method:'POST',headers,body:JSON.stringify({token:'x'.repeat(9000)})})).status,413);
});

test("history is empty for guests without a session and recovery actions require ownership", async () => {
  const response = await call("/api/fetch/history");
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{jobs:[]});
  for(const method of ["PATCH","DELETE"])assert.equal((await call("/api/fetch/jobs/11111111-1111-4111-8111-111111111111",{method})).status,401);
});

const origin = new URL(process.env.FETCH_TEST_ORIGIN || "http://127.0.0.1:4180");
if (!["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname) || origin.protocol !== "http:") throw new Error("HTTP smoke tests require an isolated local preview");
const call = (path, init = {}) => fetch(new URL(path, origin), { ...init, redirect: "manual", signal: AbortSignal.timeout(10_000) });

test("retired upload endpoint returns Gone without accepting files", async () => {
  const r = await call("/api/account", { method: "POST" });
  assert.equal(r.status, 410); assert.equal((await r.json()).error, "retired");
});
test("private requests are rejected before any provider or database access", async () => {
  const r = await call("/api/fetch/probe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ privatePost: true }) });
  assert.equal(r.status, 400); assert.equal((await r.json()).error, "public_only");
});
test("invalid and oversized request bodies return validation errors", async () => {
  const malformed = await call("/api/fetch/probe", { method: "POST", headers: { "content-type": "application/json" }, body: "{" });
  assert.equal(malformed.status, 400);
  const oversized = await call("/api/fetch/probe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: "x".repeat(9000) }) });
  assert.equal(oversized.status, 413);
});
test("jobs, confirmations and worker operations reject unauthenticated callers", async () => {
  for (const [path, method] of [["/api/worker", "GET"], ["/api/fetch/jobs/11111111-1111-4111-8111-111111111111", "GET"], ["/api/fetch/confirm", "POST"], ["/api/worker", "PUT"], ["/api/worker", "DELETE"], ["/api/worker", "POST"], ["/api/worker/flag", "POST"]]) {
    assert.equal((await call(path, { method })).status, 401, `${method} ${path}`);
  }
});
test("playback preview requires the same browser session as download", async () => {
  assert.equal((await call("/api/fetch/jobs/11111111-1111-4111-8111-111111111111?preview=1", { method: "POST" })).status, 401);
});

test("the retired guide redirects and is absent from the sitemap", async () => {
  const redirect = await call("/guides/pro-private-posts-and-stories");
  assert.equal(redirect.status, 308);
  assert.equal(new URL(redirect.headers.get("location"), origin).pathname, "/guides/web-fetch");
  const sitemap = await (await call("/sitemap.xml")).text();
  assert.equal(sitemap.includes("pro-private-posts-and-stories"), false);
});
test("the public page names the downloader and contains no private upload pitch", async () => {
  const html = await (await call("/fetch")).text();
  assert.match(html, /Download a video from a link/);
  assert.match(html, /Online downloader/);
  assert.doesNotMatch(html, /Use the cookies saved|Pro account|Stories need Pro/);
});

test("media playback policy only permits self and the configured R2 account", async () => {
  const response = await call("/fetch");
  const policy = response.headers.get("content-security-policy") ?? "";
  const media = policy.split(";").map(s => s.trim()).find(s => s.startsWith("media-src "));
  assert.match(media ?? "", /^media-src 'self'(?: https:\/\/[a-f0-9]{32}\.r2\.cloudflarestorage\.com(?: https:\/\/[a-z0-9-]+\.[a-f0-9]{32}\.r2\.cloudflarestorage\.com)?)?$/);
  if (process.env.FETCH_TEST_MEDIA_ORIGIN) assert.ok(media.includes(process.env.FETCH_TEST_MEDIA_ORIGIN));
});
