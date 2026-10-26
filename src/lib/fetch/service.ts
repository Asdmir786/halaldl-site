import type { PoolClient } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
import { assertJobId, assertPublicRequest, effectiveTier, hostedPlatforms, ownsJob } from "./policy";
import { withClient } from "@/lib/fetch/db";
import { FetchError } from "@/lib/fetch/http";
import { SERVER_LIMITS, TIER_LIMITS, startOfUtcDay, type FetchTier } from "@/lib/fetch/limits";
import { deleteMediaObject, presignDownload, storageConfigured } from "@/lib/fetch/storage";
import { classifyFetchUrl, type FetchPlatform } from "@/lib/fetch/url";

type SessionRow = {
  id: string;
  user_id: string | null;
  tier: FetchTier;
  email: string | null;
  name: string | null;
};

export type { PublicFormat } from "./formats";
import { downloadVariants, publicFormat, safeThumbnail, type DownloadVariant, type WorkerFormat } from "./formats";
import { hashClient } from "./crypto";

const ACTIVE = ["queued", "probing", "waiting_choice", "downloading"];

async function admissionLock(client: PoolClient) {
  await client.query("SELECT pg_advisory_xact_lock(hashtext('halaldl_fetch_admission'))");
}

async function withTransaction<T>(operation: (client: PoolClient) => Promise<T>) {
  return withClient(async client => {
    await client.query("BEGIN");
    try { await admissionLock(client); const result = await operation(client); await client.query("COMMIT"); return result; }
    catch (error) { await client.query("ROLLBACK"); throw error; }
  });
}

async function loadSession(client: PoolClient, sessionId: string): Promise<SessionRow> {
  const result = await client.query<SessionRow>(
    `SELECT s.id, s.user_id, COALESCE(u.tier, 'anonymous') AS tier, u.email, u.name
     FROM halaldl_fetch.sessions s
     LEFT JOIN halaldl_fetch.users u ON u.id = s.user_id
     WHERE s.id = $1 AND s.expires_at > now()`,
    [sessionId],
  );
  const row = result.rows[0];
  if (!row) throw new FetchError(401, "session", "Start again from the check on this page.");
  return { ...row, tier: effectiveTier(row.user_id) };
}

// This counter commits even when link validation or queue admission later fails.
export async function throttleSource(ip: string | null) {
  if (!ip) return;
  const result = await withClient(client => client.query<{ hits: number }>(
    `INSERT INTO halaldl_fetch.source_limits (source_hash, window_started, hits) VALUES ($1, now(), 1)
     ON CONFLICT (source_hash) DO UPDATE SET
       hits = CASE WHEN halaldl_fetch.source_limits.window_started <= now() - interval '1 minute' THEN 1 ELSE LEAST(halaldl_fetch.source_limits.hits + 1, 11) END,
       window_started = CASE WHEN halaldl_fetch.source_limits.window_started <= now() - interval '1 minute' THEN now() ELSE halaldl_fetch.source_limits.window_started END
     RETURNING hits`, [hashClient(ip)]));
  if (result.rows[0].hits > 10) throw new FetchError(429, "source_limit", "Too many links from this connection. Try again in a minute.");
}

export async function createSession() {
  const id = randomUUID();
  await withClient(async (client) => {
    await client.query(
      `INSERT INTO halaldl_fetch.sessions (id, expires_at) VALUES ($1, now() + interval '30 days')`,
      [id],
    );
  });
  return id;
}

export async function requireSession(sessionId: string | null) {
  if (!sessionId) throw new FetchError(401, "session", "Complete the page check first.");
  return withClient((client) => loadSession(client, sessionId));
}

async function expireStale(client: PoolClient) {
  await client.query(`UPDATE halaldl_fetch.jobs SET status = 'expired', error_code = 'expired', updated_at = now()
    WHERE status = 'waiting_choice' AND NOT (COALESCE(formats, '[]'::jsonb) @> '[{"hasAudio":true}]'::jsonb)`);
  await client.query(`UPDATE halaldl_fetch.jobs SET status = 'failed', error_code = 'public_only', updated_at = now()
    WHERE private_job = true AND status = ANY($1::text[])`, [ACTIVE]);
  await client.query(
    `UPDATE halaldl_fetch.jobs
     SET status = 'expired', error_code = 'expired', updated_at = now()
     WHERE status = ANY($1::text[])
       AND updated_at < now() - interval '20 minutes'`,
    [ACTIVE],
  );
}

async function serverGate(client: PoolClient) {
  const status = await client.query<{
    reported_at: Date | null;
    accepting: boolean;
    transcoding: boolean;
    memory_free_mb: number | null;
    disk_free_mb: number | null;
    load_average: number | null;
    cpu_count: number | null;
    protocol_version: number;
  }>("SELECT * FROM halaldl_fetch.worker_status WHERE id = 1");
  const worker = status.rows[0];
  const fresh = worker?.reported_at && Date.now() - new Date(worker.reported_at).getTime() < SERVER_LIMITS.heartbeatTtlMs;
  if (fresh && worker.protocol_version < 2) throw new FetchError(503, "updating", "The downloader is being updated. Please try again shortly.");
  if (!fresh) throw new FetchError(503, "worker_offline", "The fetch server is not connected yet. Try again later.");
  const counts = await client.query<{ running: string; waiting: string }>(
    `SELECT
       count(*) FILTER (WHERE status IN ('probing', 'downloading')) AS running,
       count(*) FILTER (WHERE status = 'queued') AS waiting
     FROM halaldl_fetch.jobs`,
  );
  const running = Number(counts.rows[0]?.running ?? 0);
  const waiting = Number(counts.rows[0]?.waiting ?? 0);
  const hot =
    !worker.accepting ||
    worker.transcoding ||
    waiting >= SERVER_LIMITS.maxWaiting ||
    (worker.disk_free_mb != null && worker.disk_free_mb < SERVER_LIMITS.minFreeDiskMb) ||
    (worker.memory_free_mb != null && worker.memory_free_mb < SERVER_LIMITS.minFreeMemoryMb) ||
    (worker.load_average != null && worker.load_average > SERVER_LIMITS.maxLoad);
  if (hot || (running >= SERVER_LIMITS.maxRunning && waiting >= SERVER_LIMITS.maxWaiting)) {
    throw new FetchError(429, "busy", "The server is at its high limit. Wait a minute and try again.");
  }
  return { running, waiting };
}

async function workerDetail(client: PoolClient) {
  const result = await client.query<{ detail: string | null }>("SELECT detail FROM halaldl_fetch.worker_status WHERE id = 1");
  return result.rows[0]?.detail ?? null;
}

function noticeFor(detail: string | null, accepting: boolean, connected: boolean) {
  if (!connected) return "offline";
  if (detail === "updating") return "updating";
  if (!accepting) return "busy";
  return "ok";
}

export async function publicStatus() {
  try {
    const result = await withClient(async (client) => {
      await admissionLock(client);
      await expireStale(client);
      try {
        const gate = await serverGate(client);
        const detail = await workerDetail(client);
        return { workerConnected: true, accepting: true, notice: noticeFor(detail, true, true), running: gate.running, waiting: gate.waiting, storageConfigured: storageConfigured() };
      } catch (error) {
        const detail = await workerDetail(client).catch(() => null);
        if (error instanceof FetchError && error.code === "updating") return { workerConnected: true, accepting: false, notice: "updating", storageConfigured: storageConfigured() };
        if (error instanceof FetchError && error.code === "busy") {
          return { workerConnected: true, accepting: false, notice: noticeFor(detail, false, true), running: null, waiting: null, storageConfigured: storageConfigured() };
        }
        if (error instanceof FetchError && error.code === "worker_offline") {
          return { workerConnected: false, accepting: false, notice: "offline", running: null, waiting: null, storageConfigured: storageConfigured() };
        }
        throw error;
      }
    });
    return { ...result, supportedPlatforms: hostedPlatforms() };
  } catch {
    return { workerConnected: false, accepting: false, notice: "offline", running: null, waiting: null, storageConfigured: storageConfigured(), supportedPlatforms: hostedPlatforms() };
  }
}

function assertRights(rights: boolean) {
  if (!rights) throw new FetchError(400, "rights", "Confirm that you have the right to save this media.");
}

export async function probeUrl(sessionId: string, rawUrl: string, rights: boolean, wantsPrivate: boolean, ip: string | null = null) {
  assertPublicRequest(wantsPrivate);
  assertRights(rights);
  return withClient(async (client) => {
    await client.query("BEGIN");
    try {
      await admissionLock(client);
      await expireStale(client);
      const session = await loadSession(client, sessionId);
      const classified = classifyFetchUrl(rawUrl);
      const owned = session.user_id ? "user_id = $1" : "session_id = $1";
      const owner = session.user_id ?? session.id;
      const duplicate = await client.query(
        `SELECT id FROM halaldl_fetch.jobs WHERE ${owned} AND source_url = $2 AND status = ANY($3::text[]) LIMIT 1`,
        [owner, classified.href, ACTIVE],
      );
      if (duplicate.rows[0]) {
        await client.query("COMMIT");
        return { id: duplicate.rows[0].id as string, platform: classified.platform, guideSlug: classified.guideSlug };
      }

      await serverGate(client);
      const clientHash = ip ? hashClient(ip) : null;
      const limits = TIER_LIMITS[session.tier];
      const recent = await client.query<{ created_at: Date }>(
        `SELECT created_at FROM halaldl_fetch.jobs WHERE ${owned} ORDER BY created_at DESC LIMIT 1`,
        [owner],
      );
      if (recent.rows[0] && Date.now() - new Date(recent.rows[0].created_at).getTime() < SERVER_LIMITS.probeGapMs) {
        throw new FetchError(429, "slow_down", "Wait a few seconds before the next link.");
      }
      const probes = await client.query<{ count: string }>(
        `SELECT count(*) FROM halaldl_fetch.jobs WHERE ${owned} AND created_at >= $2`,
        [owner, startOfUtcDay()],
      );
      if (Number(probes.rows[0]?.count ?? 0) >= limits.dailyProbes) {
        throw new FetchError(429, "probe_limit", "The daily lookup limit has been reached.");
      }
      const active = await client.query<{ count: string }>(
        `SELECT count(*) FROM halaldl_fetch.jobs WHERE ${owned} AND status = ANY($2::text[])`,
        [owner, ACTIVE],
      );
      if (Number(active.rows[0]?.count ?? 0) >= limits.activeUrls) {
        throw new FetchError(429, "active_limit", "Finish the current link before starting another.");
      }

      const id = randomUUID();
      await client.query(
        `INSERT INTO halaldl_fetch.jobs
          (id, session_id, user_id, source_url, platform, kind, status, tier, private_job, rights_ack, client_hash)
         VALUES ($1,$2,$3,$4,$5,'probe','queued',$6,$7,true,$8)`,
        [id, session.id, session.user_id, classified.href, classified.platform, session.tier, false, clientHash],
      );
      await client.query("COMMIT");
      return { id, platform: classified.platform, guideSlug: classified.guideSlug };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function confirmDownload(sessionId: string, jobId: string, formatId: string) {
  assertJobId(jobId);
  if (!storageConfigured()) throw new FetchError(503, "storage", "File storage is not connected yet.");
  if (!/^[A-Za-z0-9._+-]+$/.test(formatId)) throw new FetchError(400, "format", "Choose one of the listed resolutions.");
  return withClient(async (client) => {
    await client.query("BEGIN");
    try {
      await admissionLock(client);
      await expireStale(client);
      const session = await loadSession(client, sessionId);
      await serverGate(client);
      const job = await client.query<{
        id: string;
        status: string;
        tier: FetchTier;
        formats: DownloadVariant[] | null;
        session_id: string;
        user_id: string | null;
        private_job: boolean;
      }>("SELECT * FROM halaldl_fetch.jobs WHERE id = $1 FOR UPDATE", [jobId]);
      const row = job.rows[0];
      if (!row || row.private_job || !ownsJob(row, session)) {
        throw new FetchError(404, "missing", "That job is not available.");
      }
      if (row.status !== "waiting_choice") throw new FetchError(409, "state", "Choose a resolution from the current result.");
      const match = (row.formats ?? []).find((format) => format.formatId === formatId && format.selector && format.hasAudio);
      if (!match) throw new FetchError(400, "format", "Choose one of the listed resolutions.");
      const limits = TIER_LIMITS[session.tier];
      const owned = session.user_id ? "user_id = $1" : "session_id = $1";
      const owner = session.user_id ?? session.id;
      const spent = await client.query<{ count: string }>(
        `SELECT count(*) FROM halaldl_fetch.jobs WHERE ${owned} AND quota_spent = true AND COALESCE(confirmed_at, created_at) >= $2`,
        [owner, startOfUtcDay()],
      );
      if (Number(spent.rows[0]?.count ?? 0) >= limits.dailyDownloads) {
        throw new FetchError(429, "daily_limit", "Today's download limit has been reached.");
      }
      await client.query(
        `UPDATE halaldl_fetch.jobs
         SET kind = 'download', status = 'queued', choice = $2::jsonb, quota_spent = true, confirmed_at = now(), tier = $3, updated_at = now()
         WHERE id = $1`,
        [jobId, JSON.stringify(match), session.tier],
      );
      await client.query("COMMIT");
      return { id: jobId };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function jobForSession(sessionId: string, jobId: string) {
  assertJobId(jobId);
  return withClient(async (client) => {
    const session = await loadSession(client, sessionId);
    await expireStale(client);
    const result = await client.query(
      `SELECT id, status, platform, error_code, formats, bytes, created_at, title, thumbnail, duration, expires_at, actual_ext, flagged
       FROM halaldl_fetch.jobs
       WHERE id = $1 AND private_job = false AND (session_id = $2 OR user_id = $3)`,
      [jobId, session.id, session.user_id],
    );
    const row = result.rows[0];
    if (!row || row.flagged) throw new FetchError(404, "missing", "That job is not available.");
    const expired = row.expires_at && new Date(row.expires_at).getTime() <= Date.now();
    const ahead = await client.query<{ count: string }>(
      `SELECT count(*) FROM halaldl_fetch.jobs
       WHERE status = 'queued' AND created_at < $1 AND id <> $2`,
      [row.created_at, row.id],
    );
    return {
      id: row.id as string,
      status: expired ? "expired" : row.status as string,
      platform: row.platform as FetchPlatform,
      errorCode: expired ? "expired" : row.error_code as string | null,
      formats: ((row.formats as DownloadVariant[] | null) ?? []).filter(f => f.selector).map(publicFormat),
      bytes: row.bytes as number | null,
      title: row.title as string | null,
      thumbnail: safeThumbnail(row.thumbnail),
      duration: row.duration as number | null,
      expiresAt: row.expires_at as string | null,
      extension: row.actual_ext as string | null,
      ready: row.status === "ready" && !row.flagged && (!row.expires_at || new Date(row.expires_at).getTime() > Date.now()),
      queueAhead: Number(ahead.rows[0]?.count ?? 0),
    };
  });
}

export async function downloadLink(sessionId: string, jobId: string) {
  assertJobId(jobId);
  if (!storageConfigured()) throw new FetchError(503, "storage", "File downloads are having temporary issues. Please try again later.");
  return withClient(async (client) => {
    const session = await loadSession(client, sessionId);
    const result = await client.query<{ object_key: string | null; status: string; expires_at: Date | null; flagged: boolean; platform: string; actual_ext: string | null }>(
      `SELECT object_key, status, expires_at, flagged, platform, actual_ext
       FROM halaldl_fetch.jobs
       WHERE id = $1 AND private_job = false AND (session_id = $2 OR user_id = $3)`,
      [jobId, session.id, session.user_id],
    );
    const row = result.rows[0];
    if (!row || row.status !== "ready" || !row.object_key || row.flagged) {
      throw new FetchError(404, "missing", "The file is not ready.");
    }
    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
      throw new FetchError(410, "expired", "The file has expired.");
    }
    const url = await presignDownload(row.object_key, `${row.platform}-${jobId.slice(0, 8)}.${row.actual_ext || "bin"}`, row.expires_at);
    return { url };
  });
}

export async function accountSnapshot(sessionId: string | null) {
  if (!sessionId) return { signedIn: false as const };
  return withClient(async (client) => {
    const session = await loadSession(client, sessionId).catch(() => null);
    if (!session?.user_id) return { signedIn: false as const };
    return { signedIn: true as const, email: session.email, name: session.name, tier: session.tier };
  });
}

export async function upsertGoogleUser(profile: { sub: string; email?: string; name?: string }, sessionId: string | null) {
  return withClient(async (client) => {
    const userId = randomUUID();
    const saved = await client.query<{ id: string }>(
      `INSERT INTO halaldl_fetch.users (id, google_sub, email, name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (google_sub) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name
       RETURNING id`,
      [userId, profile.sub, profile.email ?? null, profile.name ?? null],
    );
    const id = saved.rows[0]?.id ?? userId;
    let nextSession = sessionId;
    if (nextSession) {
      const existing = await client.query("SELECT id FROM halaldl_fetch.sessions WHERE id = $1", [nextSession]);
      if (existing.rows[0]) {
        await client.query("UPDATE halaldl_fetch.sessions SET user_id = $2 WHERE id = $1", [nextSession, id]);
      } else {
        nextSession = null;
      }
    }
    if (!nextSession) {
      nextSession = randomUUID();
      await client.query(
        `INSERT INTO halaldl_fetch.sessions (id, user_id, expires_at) VALUES ($1, $2, now() + interval '30 days')`,
        [nextSession, id],
      );
    }
    return nextSession;
  });
}


export function authenticateWorker(request: Request) {
  const expected = process.env.WORKER_TOKEN?.trim();
  const header = request.headers.get("authorization") ?? "";
  if (!expected || header !== `Bearer ${expected}`) throw new FetchError(401, "worker", "Worker token was rejected.");
}

export async function recordHeartbeat(request: Request, body: {
  runningJobs: number;
  waitingJobs: number;
  loadAverage: number | null;
  memoryFreeMb: number | null;
  diskFreeMb: number | null;
  cpuCount: number | null;
  accepting: boolean;
  transcoding: boolean;
  detail: string | null;
  protocolVersion: number;
}) {
  authenticateWorker(request);
  await withClient(async (client) => {
    await client.query(
      `UPDATE halaldl_fetch.worker_status
       SET reported_at = now(), running_jobs = $1, waiting_jobs = $2, load_average = $3,
           memory_free_mb = $4, disk_free_mb = $5, cpu_count = $6, accepting = $7, transcoding = $8, detail = $9, protocol_version = $10
       WHERE id = 1`,
      [body.runningJobs, body.waitingJobs, body.loadAverage, body.memoryFreeMb, body.diskFreeMb, body.cpuCount, body.accepting, body.transcoding, body.detail, body.protocolVersion],
    );
  });
}

export async function claimJob(request: Request) {
  authenticateWorker(request);
  if (request.headers.get("x-halaldl-worker-protocol") !== "2") return null;
  return withClient(async (client) => {
    await client.query("BEGIN");
    try {
      await admissionLock(client);
      await expireStale(client);
      const queued = await client.query<{ id: string; session_id: string; kind: string }>(
        `SELECT id, session_id, kind FROM halaldl_fetch.jobs
         WHERE status = 'queued' ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 20`,
      );
      const running = await client.query<{ session_id: string }>(
        `SELECT session_id FROM halaldl_fetch.jobs WHERE status IN ('probing', 'downloading')`,
      );
      if (running.rows.length >= SERVER_LIMITS.maxRunning) { await client.query("COMMIT"); return null; }
      const runningSessions = new Set(running.rows.map((row) => row.session_id));
      const otherWaiting = queued.rows.some((row) => !runningSessions.has(row.session_id));
      const chosen = queued.rows.find((row) => !(runningSessions.has(row.session_id) && otherWaiting)) ?? null;
      if (!chosen) {
        await client.query("COMMIT");
        return null;
      }
      const nextStatus = chosen.kind === "probe" ? "probing" : "downloading";
      const job = await client.query(
        `UPDATE halaldl_fetch.jobs SET status = $2, updated_at = now() WHERE id = $1
         RETURNING id, source_url, platform, kind, tier, private_job, user_id, choice`,
        [chosen.id, nextStatus],
      );
      const row = job.rows[0];
      await client.query("COMMIT");
      const limits = TIER_LIMITS[effectiveTier(row.user_id)];
      return {
        id: row.id as string,
        url: row.source_url as string,
        platform: row.platform as string,
        kind: row.kind as string,
        formatSelector: (row.choice as DownloadVariant | null)?.selector ?? null,
        extension: (row.choice as DownloadVariant | null)?.ext ?? null,
        mediaType: (row.choice as DownloadVariant | null)?.mediaType ?? null,
        expectedHeight: (row.choice as DownloadVariant | null)?.height ?? null,
        protocolVersion: 2,
        tier: effectiveTier(row.user_id),
        maxHeight: limits.maxHeight,
        maxSeconds: limits.maxSeconds,
        maxBytes: limits.maxBytes,
        maxItems: limits.maxCarouselItems,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function completeJob(request: Request, jobId: string, body: {
  ok: boolean;
  errorCode?: string;
  title?: string;
  thumbnail?: string;
  extension?: string;
  duration?: number | null;
  itemCount?: number | null;
  formats?: WorkerFormat[];
  objectKey?: string;
  bytes?: number;
}) {
  authenticateWorker(request);
  if (typeof body.ok !== "boolean" || (body.formats !== undefined && !Array.isArray(body.formats))) throw new FetchError(400, "body", "Invalid worker result.");
  await withTransaction(async (client) => {
    const current = await client.query<{ kind: string; tier: FetchTier; status: string; private_job: boolean; choice: DownloadVariant | null; object_key: string | null; bytes: number | null; error_code: string | null }>(
      "SELECT kind, tier, status, private_job, choice, object_key, bytes, error_code FROM halaldl_fetch.jobs WHERE id = $1 FOR UPDATE",
      [jobId],
    );
    const row = current.rows[0];
    if (!row) throw new FetchError(404, "missing", "Job not found.");
    if (row.private_job) throw new FetchError(410, "public_only", "Only supported public links are available.");
    if (row.status === "ready" && body.ok && row.object_key === body.objectKey && Number(row.bytes) === body.bytes) return;
    if (row.status === "failed" && !body.ok && row.error_code === body.errorCode) return;
    if (!["probing", "downloading"].includes(row.status)) throw new FetchError(409, "state", "The job is no longer processing.");
    if (!body.ok) {
      await client.query(
        `UPDATE halaldl_fetch.jobs SET status = 'failed', error_code = $2, updated_at = now() WHERE id = $1`,
        [jobId, (body.errorCode || "failed").slice(0, 40)],
      );
      return;
    }
    if (row.kind === "probe" || row.status === "probing") {
      const limits = TIER_LIMITS[row.tier] ?? TIER_LIMITS.free;
      if (body.duration != null && body.duration > limits.maxSeconds) {
        await client.query(
          `UPDATE halaldl_fetch.jobs SET status = 'failed', error_code = 'too_long', updated_at = now() WHERE id = $1`,
          [jobId],
        );
        return;
      }
      if (body.itemCount != null && body.itemCount !== 1) {
        await client.query(
          `UPDATE halaldl_fetch.jobs SET status = 'failed', error_code = 'too_many_items', updated_at = now() WHERE id = $1`,
          [jobId],
        );
        return;
      }
      const formats = downloadVariants(body.formats ?? [], row.tier === "anonymous" ? "anonymous" : "free");
      if (formats.length === 0) {
        await client.query(
          `UPDATE halaldl_fetch.jobs SET status = 'failed', error_code = 'no_format', updated_at = now() WHERE id = $1`,
          [jobId],
        );
        return;
      }
      await client.query(
        `UPDATE halaldl_fetch.jobs SET status = 'waiting_choice', formats = $2::jsonb, title = $3, thumbnail = $4, duration = $5, updated_at = now() WHERE id = $1`,
        [jobId, JSON.stringify(formats), typeof body.title === "string" ? body.title.slice(0, 250) : null, safeThumbnail(body.thumbnail), Number.isFinite(body.duration) ? body.duration : null],
      );
      return;
    }
    const cap = TIER_LIMITS[row.tier] ?? TIER_LIMITS.free;
    if (!body.objectKey?.startsWith(`fetch/${jobId}-`) || !/^fetch\/[a-f0-9-]+$/.test(body.objectKey)) throw new FetchError(400, "object", "Invalid file key.");
    if (!Number.isSafeInteger(body.bytes) || !body.bytes || body.bytes < 1 || body.bytes > cap.maxBytes) throw new FetchError(400, "too_big", "The file exceeds the size limit.");
    const extension = body.extension ?? (!row.choice?.selector ? row.choice?.ext : null);
    if (!extension || !/^[a-z0-9]{2,5}$/.test(extension) || (row.choice?.ext && extension !== row.choice.ext)) throw new FetchError(400, "format", "Unexpected output format.");
    await client.query(
      `UPDATE halaldl_fetch.jobs
       SET status = 'ready', object_key = $2, bytes = $3, ready_at = now(),
           expires_at = now() + interval '6 hours', actual_ext = $4, updated_at = now()
       WHERE id = $1`,
      [jobId, body.objectKey, body.bytes, extension],
    );
  });
}

// Called by the supervised worker even when the download queue is paused.
export async function cleanupExpired(request: Request) {
  authenticateWorker(request);
  if (!storageConfigured()) throw new FetchError(503, "storage", "File storage is having an issue. Please try again later.");
  const expired = await withClient(client => client.query<{ id: string; object_key: string }>(
    `SELECT id, object_key FROM halaldl_fetch.jobs WHERE object_key IS NOT NULL AND
     (flagged = true OR expires_at <= now() OR created_at < now() - interval '30 days') ORDER BY created_at LIMIT 100`));
  let removed = 0;
  const deadline = Date.now() + 30_000;
  for (const row of expired.rows) {
    if (Date.now() >= deadline) break;
    if (!row.object_key.startsWith(`fetch/${row.id}-`)) continue;
    await deleteMediaObject(row.object_key);
    await withClient(client => client.query(`UPDATE halaldl_fetch.jobs SET object_key = NULL, status = 'expired', updated_at = now() WHERE id = $1 AND object_key = $2`, [row.id, row.object_key]));
    removed++;
  }
  await withClient(async client => {
    await client.query(`DELETE FROM halaldl_fetch.jobs WHERE created_at < now() - interval '30 days' AND object_key IS NULL`);
    await client.query(`DELETE FROM halaldl_fetch.sessions WHERE expires_at < now()`);
    await client.query(`DELETE FROM halaldl_fetch.source_limits WHERE window_started < now() - interval '1 day'`);
  });
  return { removed };
}

// Administrative takedowns use this worker-authenticated operation so that
// existing signed storage links are invalidated by deleting their object.
export async function flagJob(request: Request, jobId: string) {
  authenticateWorker(request);
  assertJobId(jobId);
  const result = await withClient(client => client.query<{ object_key: string | null }>(
    `UPDATE halaldl_fetch.jobs SET flagged = true, status = 'failed', error_code = 'unavailable', updated_at = now()
     WHERE id = $1 RETURNING object_key`, [jobId]));
  const row = result.rows[0];
  if (!row) throw new FetchError(404, "missing", "That job is not available.");
  if (row.object_key) {
    if (!row.object_key.startsWith(`fetch/${jobId}-`)) throw new FetchError(409, "object", "The file key could not be verified.");
    // Do not report a successful takedown until storage deletion succeeds.
    // Failed deletions remain flagged and are retried by supervised cleanup.
    await deleteMediaObject(row.object_key);
    await withClient(client => client.query("UPDATE halaldl_fetch.jobs SET object_key = NULL WHERE id = $1 AND object_key = $2", [jobId, row.object_key]));
  }
}
