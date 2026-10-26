import assert from "node:assert/strict";
import test from "node:test";
import { assertPublicRequest, effectiveTier, hostedPlatforms, ownsJob } from "../src/lib/fetch/policy.ts";

test("all recognized sources can be attempted despite a legacy restricted configuration", () => {
  const previous = process.env.FETCH_ENABLED_PLATFORMS;
  process.env.FETCH_ENABLED_PLATFORMS = "dailymotion,soundcloud";
  try {
    assert.deepEqual(hostedPlatforms(), ["youtube", "instagram", "tiktok", "facebook", "x", "reddit", "vimeo", "dailymotion", "soundcloud"]);
  } finally {
    if (previous === undefined) delete process.env.FETCH_ENABLED_PLATFORMS;
    else process.env.FETCH_ENABLED_PLATFORMS = previous;
  }
});

test("anonymous sessions cannot confirm another browser's job", () => {
  const job = { session_id: "victim", user_id: null };
  assert.equal(ownsJob(job, { id: "attacker", user_id: null }), false);
  assert.equal(ownsJob(job, { id: "victim", user_id: null }), true);
});

test("account ownership works across sessions but never across accounts", () => {
  const job = { session_id: "old", user_id: "owner" };
  assert.equal(ownsJob(job, { id: "new", user_id: "owner" }), true);
  assert.equal(ownsJob(job, { id: "new", user_id: "other" }), false);
  assert.equal(ownsJob(job, { id: "new", user_id: null }), false);
});

test("all signed-in users receive only free limits", () => {
  assert.equal(effectiveTier("legacy-paid-account"), "free");
  assert.equal(effectiveTier(null), "anonymous");
});

test("legacy public requests work; private and malformed flags are rejected", () => {
  assert.doesNotThrow(() => assertPublicRequest(undefined));
  assert.doesNotThrow(() => assertPublicRequest(false));
  for (const value of [true, "false", 1, null]) {
    assert.throws(() => assertPublicRequest(value), /public links/);
  }
});
