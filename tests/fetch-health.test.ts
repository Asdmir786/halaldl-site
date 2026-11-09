import assert from "node:assert/strict";
import test from "node:test";
import { configuredConcurrency, workerAvailability } from "../src/lib/fetch/health.ts";
import { jobPresentation } from "../src/lib/fetch/presentation.ts";

test("stale, missing, incompatible and paused workers cannot accept new work", () => {
  const now = Date.now();
  const healthy = { reported_at: new Date(now), protocol_version: 3, accepting: true };
  assert.equal(workerAvailability(healthy, true, now).available, true);
  for (const worker of [undefined, { ...healthy, reported_at: new Date(now - 30_000) }, { ...healthy, protocol_version: 1 }, { ...healthy, accepting: false }, { ...healthy, detail: "updating" }]) assert.equal(workerAvailability(worker, true, now).available, false);
  assert.equal(workerAvailability(healthy, false, now).reason, "storage");
  assert.equal(workerAvailability({ ...healthy, reported_at: "invalid" }, true, now).available, false);
  assert.equal(configuredConcurrency("12"), 12);
  for (const value of ["0", "13", "NaN", "1.2"]) assert.equal(configuredConcurrency(value), 1);
});

test("the result distinguishes real work from paused and waiting states", () => {
  assert.equal(jobPresentation("queued", true, 1).label, "Queued · #1");
  assert.equal(jobPresentation("queued", true, 1).detail, "You're next in line.");
  assert.equal(jobPresentation("downloading", false).label, "Paused");
  assert.equal(jobPresentation("probing", true).label, "Working");
  assert.equal(jobPresentation("ready", false).label, "Done");
  assert.equal(jobPresentation("waiting_choice", false).label, "Choose a file");
});
