import { createReadStream } from "node:fs";
import { mkdir, mkdtemp, readFile, readdir, realpath, rename, rm, stat, statfs, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { availableParallelism, freemem, loadavg } from "node:os";
import { basename, extname, isAbsolute, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createEgressProxy } from "./egress.mjs";
import { run } from "./process.mjs";
import { MEDIA_EXTENSIONS, verifyMedia } from "./media.mjs";

const GiB = 1024 ** 3;
const MAX_BYTES = 800 * 1024 ** 2;
const log = (event, detail = {}) => console.log(JSON.stringify({ time: new Date().toISOString(), event, ...detail }));

export function validateJob(job) {
  if (!job || !/^[a-f0-9-]{36}$/.test(job.id) || job.protocolVersion !== 2) throw new Error("unsupported");
  if ("cookies" in job || "proxy" in job || job.private_job) throw new Error("public_only");
  const u = new URL(job.url);
  if (u.protocol !== "https:" || u.username || u.password || u.port) throw new Error("unsupported");
  if (!Number.isInteger(job.maxBytes) || job.maxBytes < 1 || job.maxBytes > MAX_BYTES || !Number.isFinite(job.maxSeconds) || job.maxSeconds > 1800 || job.maxSeconds < 1) throw new Error("unsupported");
  if (!Number.isInteger(job.maxHeight) || job.maxHeight < 1 || job.maxHeight > 2160) throw new Error("unsupported");
  if (!["probe", "download"].includes(job.kind)) throw new Error("unsupported");
  if (job.kind === "download" && (!/^[A-Za-z0-9][A-Za-z0-9._-]*(?:\+[A-Za-z0-9][A-Za-z0-9._-]*)?$/.test(job.formatSelector ?? "") || !MEDIA_EXTENSIONS.includes(job.extension) || !["video", "audio"].includes(job.mediaType))) throw new Error("unsupported");
  return job;
}

export async function sandboxPreflight(workRoot, cgroupRoot = "/sys/fs/cgroup") {
  if (process.platform !== "linux") throw new Error("A Linux resource sandbox is required");
  const group = (await readFile("/proc/self/cgroup", "utf8")).split("\n").find(line => line.startsWith("0::"))?.slice(3);
  if (!group) throw new Error("cgroup v2 is required");
  const base = join(cgroupRoot, group);
  const memory = Number((await readFile(join(base, "memory.max"), "utf8")).trim());
  const tasks = Number((await readFile(join(base, "pids.max"), "utf8")).trim());
  const [quota, period] = (await readFile(join(base, "cpu.max"), "utf8")).trim().split(/\s+/).map(Number);
  const disk = await statfs(workRoot);
  if (!Number.isFinite(memory) || memory > 1.5 * GiB || !Number.isFinite(tasks) || tasks > 64 || !Number.isFinite(quota) || quota / period > 1 || disk.blocks * disk.bsize > 3 * GiB) throw new Error("Worker resource limits are missing or too large");
}

export async function handleJob(job, { ytDlp, ffmpeg, ffprobe, workRoot, upload, receipt, signal, blockedAddresses = [], proxyPort = 0 }) {
  if (!job || !/^[a-f0-9-]{36}$/.test(job.id)) throw new Error("invalid_job_id");
  const started = Date.now();
  let stage = "validate";
  let directory, proxy;
  let result;
  try {
    validateJob(job);
    directory = await mkdtemp(join(workRoot, "job-"));
    proxy = await createEgressProxy({ blocked: blockedAddresses, port: proxyPort });
    const args = ["--ignore-config", "--no-plugin-dirs", "--no-cache-dir", "--no-playlist", "--no-warnings", "--no-progress", "--socket-timeout", "20", "--retries", "2", "--fragment-retries", "2", "--concurrent-fragments", "1", "--js-runtimes", `node:${process.execPath}`, "--proxy", proxy.url];
    if (job.kind === "probe") {
      stage = "probe";
      const probe = await run(ytDlp, [...args, "--dump-single-json", "--skip-download", "--", job.url], { timeoutMs: 180_000, cwd: directory, signal });
      if (probe.code !== 0) throw new Error(probe.reason === "timeout" ? "failed" : "blocked");
      const payload = JSON.parse(probe.stdout);
      if (payload.is_live || payload._type === "playlist" || payload._type === "multi_video" || Array.isArray(payload.entries)) throw new Error("too_many_items");
      if (!Number.isFinite(payload.duration) || payload.duration <= 0) throw new Error("unsupported");
      if (payload.duration > job.maxSeconds) throw new Error("too_long");
      const fields = ["format_id", "ext", "height", "fps", "filesize", "filesize_approx", "vcodec", "acodec", "abr", "tbr"];
      const formats = (payload.formats ?? []).slice(0, 500).map(f => Object.fromEntries(fields.filter(k => k in f).map(k => [k, f[k]])));
      result = { ok: true, title: String(payload.title ?? "").slice(0, 250), thumbnail: typeof payload.thumbnail === "string" ? payload.thumbnail.slice(0, 2048) : undefined, duration: payload.duration, itemCount: 1, formats };
    } else {
      stage = "download";
      const output = join(directory, `${job.id}.%(ext)s`);
      const merge = job.formatSelector.includes("+") ? ["--merge-output-format", job.extension] : [];
      const command = [...args, "--downloader", "native", "--hls-prefer-native", "--ffmpeg-location", ffmpeg, "--postprocessor-args", "ffmpeg:-threads 1", "-f", job.formatSelector, "--max-filesize", String(job.maxBytes), ...merge, "--print", "after_move:%(filepath)j", "-o", output, "--", job.url];
      const download = await run(ytDlp, command, { timeoutMs: 18 * 60_000, maxOutput: 256 * 1024, cwd: directory, signal });
      if (download.code !== 0) throw new Error("failed");
      const filepath = JSON.parse(download.stdout.trim().split("\n").at(-1));
      if (typeof filepath !== "string" || !isAbsolute(filepath)) throw new Error("failed");
      const actual = await realpath(filepath);
      const rel = relative(directory, actual);
      if (rel.startsWith("..") || isAbsolute(rel) || basename(actual).split(".")[0] !== job.id) throw new Error("failed");
      const info = await stat(actual);
      if (!info.isFile() || info.size < 1 || info.size > job.maxBytes) throw new Error("too_big");
      const extension = extname(actual).slice(1).toLowerCase();
      if (extension !== job.extension) throw new Error("failed");
      stage = "verify";
      const probe = await run(ffprobe, ["-v", "error", "-protocol_whitelist", "file,pipe", "-show_entries", "stream=codec_type,height:format=duration,format_name", "-of", "json", actual], { timeoutMs: 20_000, maxOutput: 64 * 1024, cwd: directory, signal });
      if (probe.code !== 0) throw new Error("no_format");
      verifyMedia(JSON.parse(probe.stdout), job);
      const objectKey = `fetch/${job.id}-${randomUUID()}`;
      stage = "upload";
      await upload(objectKey, actual, info.size, signal);
      result = { ok: true, objectKey, bytes: info.size, extension };
    }
  } catch (error) {
    const code = ["too_long", "too_big", "public_only", "unsupported", "too_many_items", "blocked", "no_audio", "no_format"].includes(error.message) ? error.message : "failed";
    result = { ok: false, errorCode: code };
    log("job_failed", { jobId: job.id, stage, errorCode: code, errorName: error.name, httpStatus: error.$metadata?.httpStatusCode ?? null });
  } finally {
    await proxy?.close();
    if (directory) await rm(directory, { recursive: true, force: true });
  }
  await receipt(job.id, result);
  log("job_finished", { jobId: job.id, kind: job.kind, ok: result.ok, errorCode: result.errorCode ?? null, durationMs: Date.now() - started });
}

export async function main() {
  const api = process.env.FETCH_API_URL?.replace(/\/$/, "");
  const token = process.env.WORKER_TOKEN?.trim();
  const workRoot = resolve(process.env.FETCH_WORK_ROOT || "/var/lib/halaldl-fetch/work");
  const spool = resolve(process.env.FETCH_RECEIPT_ROOT || "/var/lib/halaldl-fetch/receipts");
  if (!api || new URL(api).protocol !== "https:" || !token) throw new Error("Configure the HTTPS API and worker token");
  await mkdir(workRoot, { recursive: true, mode: 0o700 }); await mkdir(spool, { recursive: true, mode: 0o700 });
  await sandboxPreflight(workRoot);
  const guard = await stat("/run/halaldl-fetch-egress/ready");
  if (guard.uid !== 0 || (guard.mode & 0o022)) throw new Error("Managed egress policy is required");
  if (process.argv.includes("--preflight")) { log("preflight_passed"); return; }
  const stop = new AbortController();
  for (const sig of ["SIGTERM", "SIGINT"]) process.once(sig, () => stop.abort());
  const state = { running: 0, receiptPending: false };
  const pause = ms => new Promise(resolvePause => { const t = setTimeout(done, ms); function done() { clearTimeout(t); stop.signal.removeEventListener("abort", done); resolvePause(); } stop.signal.addEventListener("abort", done, { once: true }); if (stop.signal.aborted) done(); });
  async function call(method, body) {
    const response = await fetch(`${api}/api/worker`, { method, headers: { authorization: `Bearer ${token}`, "x-halaldl-worker-protocol": "2", "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.any([stop.signal, AbortSignal.timeout(method === "DELETE" ? 60_000 : 15_000)]) });
    if (!response.ok) { const e = new Error("worker_api_failed"); e.status = response.status; throw e; }
    return response.json();
  }
  async function flushReceipts() {
    const files = (await readdir(spool)).filter(f => /^[a-f0-9-]{36}\.json$/.test(f));
    state.receiptPending = files.length > 0;
    for (const file of files) {
      const filePath = join(spool, file);
      if ((await stat(filePath)).size > 512_000) throw new Error("receipt_too_large");
      const body = JSON.parse(await readFile(filePath, "utf8"));
      try { await call("PATCH", body); }
      catch (error) {
        if (![404, 409, 410].includes(error.status)) throw error;
        // An idempotent accepted receipt returns 200. Terminal rejection means
        // this upload was not attached; delete only this job's own object.
        if (body.objectKey?.startsWith(`fetch/${body.id}-`) && /^fetch\/[a-f0-9-]+$/.test(body.objectKey)) {
          await s3.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: body.objectKey }));
        }
      }
      await rm(filePath);
    }
    state.receiptPending = false;
  }
  const s3 = new S3Client({ region: "auto", endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } });
  async function upload(key, filepath, length, signal) {
    const stream = createReadStream(filepath);
    try { await s3.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, Body: stream, ContentLength: length }), { abortSignal: AbortSignal.any([signal, AbortSignal.timeout(120_000)]) }); }
    finally { stream.destroy(); }
  }
  async function heartbeat() {
    const disk = await statfs(workRoot);
    const parentDisk = await statfs("/var/lib");
    const healthy = !state.receiptPending && freemem() >= 3 * GiB && loadavg()[0] <= 8 && parentDisk.bavail * parentDisk.bsize >= 12 * GiB && disk.bavail * disk.bsize >= 2 * GiB;
    const paused = process.env.FETCH_INTAKE_PAUSED === "true";
    const accepting = healthy && !paused;
    await call("POST", { protocolVersion: 2, runningJobs: state.running, waitingJobs: 0, loadAverage: loadavg()[0], memoryFreeMb: Math.round(freemem() / 1048576), diskFreeMb: Math.round(parentDisk.bavail * parentDisk.bsize / 1048576), cpuCount: availableParallelism(), accepting, transcoding: false, detail: paused ? "updating" : accepting ? null : state.running ? "processing" : "high-limit" });
    // Maintenance pauses admission while existing jobs and explicit canaries drain.
    return healthy;
  }
  const upkeep = (async () => { let cleanupAt = 0; while (!stop.signal.aborted) { try { await heartbeat(); if (Date.now() >= cleanupAt) { await call("DELETE"); cleanupAt = Date.now() + 5 * 60_000; } } catch { if (!stop.signal.aborted) log("upkeep_retry"); } await pause(8000); } })();
  try {
    while (!stop.signal.aborted) {
      try {
        await flushReceipts();
        if (!await heartbeat()) { await pause(5000); continue; }
        const { job } = await call("PUT");
        if (!job) { await pause(3000); continue; }
        state.running = 1;
        await handleJob(job, { ytDlp: process.env.YT_DLP_PATH || "/opt/halaldl-fetch/bin/yt-dlp", ffmpeg: process.env.FFMPEG_PATH || "/usr/bin/ffmpeg", ffprobe: process.env.FFPROBE_PATH || "/usr/bin/ffprobe", workRoot, proxyPort: 18656, signal: stop.signal, blockedAddresses: (process.env.FETCH_BLOCKED_ADDRESSES || "").split(",").filter(Boolean), upload, receipt: async (id, result) => { const next = join(spool, `${id}.next`); await writeFile(next, JSON.stringify({ id, ...result }), { mode: 0o600 }); await rename(next, join(spool, `${id}.json`)); state.receiptPending = true; } });
        state.running = 0;
      } catch { state.running = 0; if (!stop.signal.aborted) log("worker_retry"); await pause(5000); }
    }
  } finally { stop.abort(); await upkeep; s3.destroy(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch(() => { log("worker_start_failed"); process.exitCode = 1; });
