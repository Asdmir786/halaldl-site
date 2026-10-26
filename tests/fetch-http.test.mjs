import assert from "node:assert/strict";
import test from "node:test";

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
  for (const [path, method] of [["/api/fetch/jobs/11111111-1111-4111-8111-111111111111", "GET"], ["/api/fetch/confirm", "POST"], ["/api/worker", "PUT"], ["/api/worker", "DELETE"], ["/api/worker", "POST"], ["/api/worker/flag", "POST"]]) {
    assert.equal((await call(path, { method })).status, 401, `${method} ${path}`);
  }
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
