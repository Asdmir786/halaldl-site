import assert from "node:assert/strict";
import { once } from "node:events";
import { connect } from "node:net";
import test from "node:test";
import { createEgressProxy, isPublicAddress, resolvePublic } from "../services/fetch-worker/egress.mjs";
import { run } from "../services/fetch-worker/process.mjs";
import { validateJob } from "../services/fetch-worker/worker.mjs";
import { verifyMedia } from "../services/fetch-worker/media.mjs";

test("egress rejects internal, special, mapped and host addresses", () => {
  for (const ip of ["0.0.0.0", "127.0.0.1", "10.0.1.20", "100.64.1.1", "172.16.0.2", "192.168.1.1", "169.254.169.254", "224.0.0.1", "::1", "::ffff:127.0.0.1", "::ffff:8.8.8.8", "fc00::1", "fe80::1", "2002:7f00:1::", "2001:db8::1"]) assert.equal(isPublicAddress(ip), false, ip);
  assert.equal(isPublicAddress("8.8.8.8"), true);
  assert.equal(isPublicAddress("2606:4700:4700::1111"), true);
  assert.equal(isPublicAddress("8.8.8.8", ["8.8.8.8"]), false);
  assert.equal(isPublicAddress("2606:4700:4700::1111", ["2606:4700:4700:0:0:0:0:1111"]), false);
});
test("mixed public/private DNS and localhost names fail closed", async () => {
  await assert.rejects(resolvePublic("media.example", { resolver: async () => [{ address: "8.8.8.8", family: 4 }, { address: "127.0.0.1", family: 4 }] }), /blocked/);
  await assert.rejects(resolvePublic("localhost"), /blocked/);
  let calls = 0;
  const pinned = await resolvePublic("media.example", { resolver: async () => { calls++; return [{ address: "8.8.8.8", family: 4 }]; } });
  assert.equal(pinned.address, "8.8.8.8"); assert.equal(calls, 1);
});
test("real proxy CONNECT attempts to private hosts and custom ports are refused", async () => {
  const proxy = await createEgressProxy({ resolver: async () => [{ address: "127.0.0.1", family: 4 }] });
  try {
    for (const target of ["127.0.0.1:443", "metadata.example:443", "example.com:22", "[::1]:443"]) {
      const socket = connect(new URL(proxy.url).port, "127.0.0.1");
      await once(socket, "connect"); socket.write(`CONNECT ${target} HTTP/1.1\r\nHost: ${target}\r\n\r\n`);
      const [response] = await once(socket, "data"); assert.match(response.toString(), /403 Forbidden/); socket.destroy();
    }
  } finally { await proxy.close(); }
});
test("runner enforces output and wall-clock bounds and scrubs credentials", async () => {
  const before = process.env.WORKER_TOKEN; process.env.WORKER_TOKEN = "test-secret";
  try {
    const clean = await run(process.execPath, ["-e", "process.stdout.write(String(process.env.WORKER_TOKEN))"]);
    assert.equal(clean.stdout, "undefined");
    assert.equal((await run(process.execPath, ["-e", "setInterval(()=>{},1000)"], { timeoutMs: 200 })).reason, "timeout");
    assert.equal((await run(process.execPath, ["-e", "process.stdout.write('x'.repeat(10000))"], { maxOutput: 100 })).reason, "output_limit");
    const controller = new AbortController();
    const pending = run(process.execPath, ["-e", "setInterval(()=>{},1000)"], { signal: controller.signal }); controller.abort();
    assert.equal((await pending).reason, "cancelled");
  } finally { if (before === undefined) delete process.env.WORKER_TOKEN; else process.env.WORKER_TOKEN = before; }
});
test("worker rejects legacy credentials, invalid paths and arbitrary format arguments", () => {
  const job = { id: "11111111-1111-4111-8111-111111111111", protocolVersion: 2, kind: "download", url: "https://youtu.be/example", maxBytes: 1000, maxSeconds: 600, maxHeight: 1080, formatSelector: "137+140", extension: "mp4", mediaType: "video" };
  assert.equal(validateJob(job), job);
  for (const override of [{ cookies: null }, { proxy: "http://127.0.0.1" }, { private_job: true }, { id: "../../outside" }, { formatSelector: "best; rm -rf /" }, { maxBytes: 9e12 }]) assert.throws(() => validateJob({ ...job, ...override }));
});

test("actual files require audio, bounded duration/resolution and the expected container", () => {
  const job = { mediaType: "video", extension: "mp4", maxSeconds: 600, maxHeight: 1080, expectedHeight: 720 };
  const valid = { streams: [{ codec_type: "video", height: 720 }, { codec_type: "audio" }], format: { duration: "60", format_name: "mov,mp4,m4a,3gp,3g2,mj2" } };
  assert.equal(verifyMedia(valid, job), true);
  assert.throws(() => verifyMedia({ ...valid, streams: [{ codec_type: "video", height: 720 }] }, job), /no_audio/);
  assert.throws(() => verifyMedia({ ...valid, streams: [{ codec_type: "audio" }] }, job), /no_format/);
  assert.throws(() => verifyMedia({ ...valid, streams: [{ codec_type: "video", height: 1080 }, { codec_type: "audio" }] }, job), /no_format/);
  assert.throws(() => verifyMedia({ ...valid, format: { ...valid.format, duration: "900" } }, job), /too_long/);
  assert.throws(() => verifyMedia({ ...valid, format: { ...valid.format, format_name: "matroska,webm" } }, job), /no_format/);
  assert.equal(verifyMedia({ streams: [{ codec_type: "audio" }], format: { duration: "60", format_name: "ogg" } }, { mediaType: "audio", extension: "opus", maxSeconds: 600 }), true);
});
