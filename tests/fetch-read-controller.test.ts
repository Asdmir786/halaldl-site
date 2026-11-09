import assert from "node:assert/strict";
import test from "node:test";
import { setImmediate as settle } from "node:timers/promises";
import { createReadController } from "../src/lib/fetch/read-controller.ts";

test("one visible idle hour makes 120 status reads; hidden tabs make none", async t => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  let reads = 0;
  const reader = createReadController({ read: async () => { reads++; }, interval: () => 30_000 });
  reader.setVisible(true); await settle();
  for (let i = 0; i < 119; i++) { t.mock.timers.tick(30_000); await settle(); }
  assert.equal(reads, 120);
  reader.setVisible(false); t.mock.timers.tick(3600_000); await settle();
  assert.equal(reads, 120);
  reader.setVisible(true); await settle(); assert.equal(reads, 121);
  reader.stop();
});

test("visible processing keeps two-second reads and terminal/history reads have no timer", async t => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  let reads = 0, interval = 2000;
  const reader = createReadController({ read: async () => { reads++; }, interval: () => interval });
  reader.setVisible(true); await settle();
  for (let i = 0; i < 29; i++) { t.mock.timers.tick(2000); await settle(); }
  assert.equal(reads, 30);
  interval = Infinity; await reader.refresh(); await settle();
  t.mock.timers.tick(3600_000); await settle(); assert.equal(reads, 31);
  reader.stop();
});

test("refresh bursts coalesce without overlapping; hide aborts only scheduled reads", async t => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  let reads = 0, release = () => {};
  let signal: AbortSignal | undefined;
  const reader = createReadController({ read: async current => { reads++; signal = current; await new Promise<void>(resolve => { release = resolve; }); }, interval: () => Infinity });
  reader.setVisible(true); await settle();
  for (let i = 0; i < 100; i++) void reader.refresh();
  assert.equal(reads, 1);
  release(); await settle(); t.mock.timers.tick(0); await settle(); assert.equal(reads, 2);
  reader.setVisible(false); assert.ok(signal?.aborted);
  release(); await settle(); reader.stop();
});

test("read failures back off to 30 seconds and a success resets the interval", async t => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  let reads = 0, failing = true;
  const reader = createReadController({ read: async () => { reads++; if (failing) throw Error("offline"); }, interval: () => 2000 });
  reader.setVisible(true); await settle();
  for (const delay of [2000,4000,8000,16000,30000]) {
    const before = reads; t.mock.timers.tick(delay-1); await settle(); assert.equal(reads,before);
    t.mock.timers.tick(1); await settle(); assert.equal(reads,before+1);
  }
  failing = false; t.mock.timers.tick(30000); await settle();
  const before = reads; t.mock.timers.tick(2000); await settle(); assert.equal(reads,before+1);
  reader.stop();
});
