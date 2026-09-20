import assert from "node:assert/strict";
import test from "node:test";
import { buildHalalDlQueueLink, MAX_HANDOFF_URL_LENGTH } from "../src/lib/handoff.ts";

test("builds an encoded queue-only deep link for HTTP and HTTPS URLs", () => {
  for (const input of [
    "https://example.com/watch?v=one&list=two",
    "http://media.example.test/path with spaces",
  ]) {
    const result = buildHalalDlQueueLink(input);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.match(result.deepLink, /^halaldl:\/\/download\?url=/);
    assert.equal(result.deepLink.includes("start="), false);
    assert.equal(decodeURIComponent(result.deepLink.split("url=")[1]), result.normalizedUrl);
  }
});

test("rejects unsupported schemes and malformed values", () => {
  for (const input of ["", "not a url", "ftp://example.com/file", "javascript:alert(1)", "file:///tmp/video.mp4"]) {
    assert.equal(buildHalalDlQueueLink(input).ok, false);
  }
});

test("rejects embedded credentials", () => {
  assert.equal(buildHalalDlQueueLink("https://user:secret@example.com/video").ok, false);
});

test("rejects oversized input", () => {
  const input = `https://example.com/${"a".repeat(MAX_HANDOFF_URL_LENGTH)}`;
  assert.equal(buildHalalDlQueueLink(input).ok, false);
});

test("accepts the maximum supported length", () => {
  const prefix = "https://example.com/";
  const input = prefix + "a".repeat(MAX_HANDOFF_URL_LENGTH - prefix.length);
  assert.equal(input.length, MAX_HANDOFF_URL_LENGTH);
  assert.equal(buildHalalDlQueueLink(input).ok, true);
});
