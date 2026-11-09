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
import { configuredConcurrency, workerAvailability } from "./health";

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
  if (!row) throw new FetchError(401, "session", "Open this page again.");
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
  await client.query(`UPDATE halaldl_fetch.jobs SET
    status = CASE WHEN attempts < 3 THEN 'queued' ELSE 'failed' END,
    error_code = CASE WHEN attempts < 3 THEN NULL ELSE 'worker_interrupted' END,
    worker_id = NULL, lease_token = NULL, lease_expires_at = NULL, updated_at = now()
    WHERE status IN ('probing', 'downloading') AND lease_expires_at < now()`);
  await client.query(`UPDATE halaldl_fetch.jobs SET status = 'expired', error_code = 'expired', updated_at = now()
    WHERE status = 'waiting_choice' AND NOT EXISTS
      (SELECT 1 FROM jsonb_array_elements(COALESCE(formats, '[]'::jsonb)) f WHERE f->>'selector' IS NOT NULL)`);
  await client.query(`UPDATE halaldl_fetch.jobs SET status = 'failed', error_code = 'public_only', updated_at = now()
    WHERE private_job = true AND status = ANY($1::text[])`, [ACTIVE]);
  await client.query(
    `UPDATE halaldl_fetch.jobs
     SET status = 'expired', error_code = 'expired', updated_at = now()
     WHERE status = ANY($1::text[])
       AND (lease_token IS NULL OR status = 'waiting_choice') AND updated_at < now() - interval '20 minutes'`,
    [ACTIVE.filter(status => status !== "queued")],
  );
}

async function queueSnapshot(client: PoolClient) {
  const status = await client.query<{
    reported_at: Date | null;
    accepting: boolean;
    transcoding: boolean;
    memory_free_mb: number | null;
    disk_free_mb: number | null;
    load_average: number | null;
    cpu_count: number | null;
    protocol_version: number;
    detail: string | null;
    capacity: number;
    download_accepting: boolean;
  }>("SELECT * FROM halaldl_fetch.worker_status WHERE id = 1");
  const worker = status.rows[0];
  const health = workerAvailability(worker, storageConfigured());
  const counts = await client.query<{ running: string; waiting: string }>(
    `SELECT
       count(*) FILTER (WHERE status IN ('probing', 'downloading')) AS running,
       count(*) FILTER (WHERE status = 'queued') AS waiting
     FROM halaldl_fetch.jobs WHERE private_job = false AND flagged = false`,
  );
  const running = Number(counts.rows[0]?.running ?? 0);
  const waiting = Number(counts.rows[0]?.waiting ?? 0);
  const processing = health.available;
  return { ...health, running, waiting, processing, notice: health.reason, accepting: health.available, downloadAvailable: health.available && (worker.protocol_version < 3 || worker.download_accepting), storageConfigured: storageConfigured(), capacity: Math.min(configuredConcurrency(), worker?.capacity ?? 1) };
}

async function assertWorkerAvailable(client: PoolClient, kind = "probe") {
  const health = await queueSnapshot(client);
  if (!health.available) throw new FetchError(503, `worker_${health.reason}`, health.message);
  if (kind === "download" && !health.downloadAvailable) throw new FetchError(503, "worker_capacity", "File preparation is temporarily paused. Your link and choices are saved.");
}

export async function publicStatus() {
  try {
    const result = await withClient(async (client) => {
      await admissionLock(client);
      await expireStale(client);
      return queueSnapshot(client);
    });
    return { ...result, supportedPlatforms: hostedPlatforms() };
  } catch {
    return { workerConnected: false, accepting: false, processing: false, notice: "connection", running: null, waiting: null, storageConfigured: storageConfigured(), supportedPlatforms: hostedPlatforms() };
  }
}

export async function browserStatus() {
  const health = await publicStatus();
  return { available: health.accepting, workerConnected: health.workerConnected, canDownload: "downloadAvailable" in health && health.downloadAvailable, reason: health.notice, message: "message" in health ? health.message : "The download service could not be reached. Please try again shortly.", checkedAt: new Date().toISOString(), supportedPlatforms: health.supportedPlatforms };
}

export async function sessionJobId(sessionId: string | null) {
  if (!sessionId) return null;
  try {
    return await withClient(async (client) => {
      const session = await loadSession(client, sessionId);
      const owned = session.user_id ? "user_id = $1" : "session_id = $1";
      const owner = session.user_id ?? session.id;
      const result = await client.query<{ id: string }>(
        `SELECT id FROM halaldl_fetch.jobs
         WHERE ${owned} AND private_job = false AND flagged = false AND status = ANY($2::text[])
         ORDER BY updated_at DESC LIMIT 1`,
        [owner, ACTIVE],
      );
      return result.rows[0]?.id ?? null;
    });
  } catch {
    return null;
  }
}

async function queueDetails(client: PoolClient, id: string) {
  const result = await client.query<{ position: string }>(
    `SELECT (count(*) + 1)::text AS position FROM halaldl_fetch.jobs q
     WHERE q.status = 'queued' AND q.private_job = false AND q.flagged = false
     AND (COALESCE(q.queued_at, q.confirmed_at, q.created_at), q.id) <
       (SELECT COALESCE(j.queued_at, j.confirmed_at, j.created_at), j.id FROM halaldl_fetch.jobs j WHERE j.id = $1)`, [id]);
  return { queuePosition: Number(result.rows[0].position) };
}

function assertRights(rights: boolean) {
  if (!rights) throw new FetchError(400, "rights", "Confirm that you have the right to save this media.");
}

export async function probeUrl(sessionId: string, rawUrl: string, rights: boolean, wantsPrivate: boolean, ip: string | null = null, onQueued?: () => void) {
  assertPublicRequest(wantsPrivate);
  assertRights(rights);
  let queued = false;
  const result = await withClient(async (client) => {
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

      await assertWorkerAvailable(client);

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
          (id, session_id, user_id, source_url, platform, kind, status, tier, private_job, rights_ack, client_hash, queued_at)
         VALUES ($1,$2,$3,$4,$5,'probe','queued',$6,$7,true,$8,clock_timestamp())`,
        [id, session.id, session.user_id, classified.href, classified.platform, session.tier, false, clientHash],
      );
      const queue = await queueDetails(client, id);
      await client.query("COMMIT");
      queued = true;
      return { id, platform: classified.platform, guideSlug: classified.guideSlug, ...queue };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
  if (queued) onQueued?.();
  return result;
}

export async function confirmDownload(sessionId: string, jobId: string, formatId: string, onQueued?: () => void) {
  assertJobId(jobId);
  if (!storageConfigured()) throw new FetchError(503, "storage", "Downloads are paused. Try again later.");
  if (!/^[A-Za-z0-9._+-]+$/.test(formatId)) throw new FetchError(400, "format", "Choose one of the listed resolutions.");
  const result = await withClient(async (client) => {
    await client.query("BEGIN");
    try {
      await admissionLock(client);
      await expireStale(client);
      const session = await loadSession(client, sessionId);
      const job = await client.query<{
        id: string;
        status: string;
        tier: FetchTier;
        formats: DownloadVariant[] | null;
        session_id: string;
        user_id: string | null;
        private_job: boolean;
        source_url: string;
      }>("SELECT * FROM halaldl_fetch.jobs WHERE id = $1 FOR UPDATE", [jobId]);
      const row = job.rows[0];
      if (!row || row.private_job || !ownsJob(row, session)) {
        throw new FetchError(404, "missing", "That job is not available.");
      }
      if (row.status !== "waiting_choice") throw new FetchError(409, "state", "Choose a resolution from the current result.");
      classifyFetchUrl(row.source_url);
      await assertWorkerAvailable(client, "download");
      const match = (row.formats ?? []).find((format) => format.formatId === formatId && format.selector);
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
         SET kind = 'download', status = 'queued', choice = $2::jsonb, quota_spent = true, confirmed_at = now(), queued_at = clock_timestamp(), tier = $3, updated_at = now(), worker_id = NULL, lease_token = NULL, lease_expires_at = NULL, attempts = 0
         WHERE id = $1`,
        [jobId, JSON.stringify(match), session.tier],
      );
      const queue = await queueDetails(client, jobId);
      await client.query("COMMIT");
      return { id: jobId, ...queue };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
  onQueued?.();
  return result;
}

export async function jobForSession(sessionId: string, jobId: string) {
  assertJobId(jobId);
  return withClient(async (client) => {
    const session = await loadSession(client, sessionId);
    await expireStale(client);
    const result = await client.query(
      `SELECT id, kind, status, platform, error_code, formats, choice, bytes, created_at, title, thumbnail, duration, expires_at, actual_ext, source_url, flagged,
        CASE WHEN status = 'queued' THEN (SELECT count(*) + 1 FROM halaldl_fetch.jobs q
          WHERE q.status = 'queued' AND q.private_job = false AND q.flagged = false
          AND (COALESCE(q.queued_at, q.confirmed_at, q.created_at), q.id) <
            (COALESCE(j.queued_at, j.confirmed_at, j.created_at), j.id)) ELSE NULL END AS queue_position
       FROM halaldl_fetch.jobs j
       WHERE id = $1 AND private_job = false AND (session_id = $2 OR user_id = $3)`,
      [jobId, session.id, session.user_id],
    );
    const row = result.rows[0];
    if (!row || row.flagged) throw new FetchError(404, "missing", "That job is not available.");
    return presentJob(row);
  });
}

// Only explicit public fields leave this module, including in history.
function presentJob(row: Record<string, unknown>) {
    const expired = row.expires_at && new Date(row.expires_at as string).getTime() <= Date.now();
    const queue = row.status === "queued" ? { queuePosition: Number(row.queue_position) } : { queuePosition: null };
    return {
      id: row.id as string,
      kind: row.kind as string,
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
      sourceUrl: row.source_url as string,
      deliveryMode: row.choice ? publicFormat(row.choice as DownloadVariant).deliveryMode : null,
      quality: row.choice ? (row.choice as DownloadVariant).label : null,
      createdAt: row.created_at as string,
      ready: row.status === "ready" && !row.flagged && (!row.expires_at || new Date(row.expires_at as string).getTime() > Date.now()),
      ...queue,
    };
}

export async function recentJobs(sessionId: string | null) {
  if (!sessionId) return [];
  return withClient(async client => {
    const session = await loadSession(client, sessionId);
    const rows = await client.query(`SELECT id, kind, status, platform, error_code, formats, choice, bytes, created_at,
      title, thumbnail, duration, expires_at, actual_ext, source_url, flagged
      FROM halaldl_fetch.jobs WHERE private_job = false AND flagged = false
      AND (session_id = $1 OR user_id = $2) AND created_at > now() - interval '30 days'
      ORDER BY created_at DESC, id DESC LIMIT 20`, [session.id, session.user_id]);
    return rows.rows.map(presentJob);
  });
}

export async function cancelJob(sessionId: string, jobId: string) {
  assertJobId(jobId);
  return withTransaction(async client => {
    const session = await loadSession(client, sessionId);
    const current = await client.query("SELECT * FROM halaldl_fetch.jobs WHERE id = $1 FOR UPDATE", [jobId]);
    const row = current.rows[0];
    if (!row || row.private_job || row.flagged || !ownsJob(row, session)) throw new FetchError(404, "missing", "That job is not available.");
    if (row.status === "cancelled") return { id: jobId, status: "cancelled" };
    if (!ACTIVE.includes(row.status)) throw new FetchError(409, "state", "This job has already finished. Refresh to see its result.");
    // Retain lease identity to reject stale receipts and let the worker discard
    // any upload that races cancellation. Heartbeats stop renewing this job.
    await client.query("UPDATE halaldl_fetch.jobs SET status = 'cancelled', error_code = NULL, updated_at = now() WHERE id = $1", [jobId]);
    return { id: jobId, status: "cancelled" };
  });
}

export async function restartJob(sessionId: string, jobId: string, ip: string | null = null, onQueued?: () => void) {
  const original = await jobForSession(sessionId, jobId);
  if (ACTIVE.includes(original.status)) throw new FetchError(409, "state", "Cancel this job before starting it again.");
  // Never use the editable draft or reuse a prepared file/format selector.
  // Fresh inspection produces new choices; the original remains in history.
  return probeUrl(sessionId, original.sourceUrl, true, false, ip, onQueued);
}

export async function workerJobActive(request: Request, jobId: string) {
  authenticateWorker(request); assertJobId(jobId);
  return withClient(async client => {
    const result = await client.query("SELECT 1 FROM halaldl_fetch.jobs WHERE id = $1 AND status IN ('probing', 'downloading') AND private_job = false AND flagged = false", [jobId]);
    return result.rows.length > 0;
  });
}

export async function downloadLink(sessionId: string, jobId: string, preview = false) {
  assertJobId(jobId);
  if (!storageConfigured()) throw new FetchError(503, "storage", "File downloads are having temporary issues. Please try again later.");
  return withClient(async (client) => {
    const session = await loadSession(client, sessionId);
    const result = await client.query<{ object_key: string | null; status: string; expires_at: Date | null; flagged: boolean; platform: string; actual_ext: string | null; source_url: string }>(
      `SELECT object_key, status, expires_at, flagged, platform, actual_ext, source_url
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
    classifyFetchUrl(row.source_url);
    const url = await presignDownload(row.object_key, `${row.platform}-${jobId.slice(0, 8)}.${row.actual_ext || "bin"}`, row.expires_at, preview);
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
  workerId?: string;
  capacity?: number;
  activeJobs?: { id: string; leaseToken: string }[];
  downloadAccepting?: boolean;
}) {
  authenticateWorker(request);
  const modern = body.protocolVersion === 3;
  const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
  if (modern && (!uuid.test(body.workerId ?? "") || body.workerId !== request.headers.get("x-halaldl-worker-id") || !Number.isInteger(body.capacity) || body.capacity! < 1 || body.capacity! > 12 || !Array.isArray(body.activeJobs) || body.activeJobs.length > 12 || body.activeJobs.some(j => !j || !uuid.test(j.id) || !uuid.test(j.leaseToken)))) throw new FetchError(400, "heartbeat", "Invalid worker heartbeat.");
  return withTransaction(async (client) => {
    const current = await client.query<{ worker_id: string | null; reported_at: Date | null; protocol_version: number }>("SELECT worker_id, reported_at, protocol_version FROM halaldl_fetch.worker_status WHERE id = 1 FOR UPDATE");
    const prior = current.rows[0];
    if (prior?.protocol_version === 3 && prior.worker_id !== body.workerId && prior.reported_at && Date.now() - new Date(prior.reported_at).getTime() < SERVER_LIMITS.heartbeatTtlMs) throw new FetchError(409, "worker_active", "Another worker is active.");
    await client.query(
      `UPDATE halaldl_fetch.worker_status
       SET reported_at = now(), running_jobs = $1, waiting_jobs = $2, load_average = $3,
           memory_free_mb = $4, disk_free_mb = $5, cpu_count = $6, accepting = $7, transcoding = $8, detail = $9, protocol_version = $10, worker_id = $11, capacity = $12, download_accepting = $13
       WHERE id = 1`,
      [body.runningJobs, body.waitingJobs, body.loadAverage, body.memoryFreeMb, body.diskFreeMb, body.cpuCount, body.accepting, body.transcoding, body.detail, body.protocolVersion, modern ? body.workerId : null, modern ? Math.min(body.capacity!, configuredConcurrency()) : 1, modern ? body.downloadAccepting === true : body.accepting],
    );
    const activeJobIds: string[] = [];
    if (modern && body.activeJobs!.length) {
      const renewed = await client.query<{ id: string }>(`UPDATE halaldl_fetch.jobs AS job
        SET lease_expires_at = now() + interval '90 seconds', updated_at = now()
        FROM jsonb_to_recordset($1::jsonb) AS active(id uuid, token uuid)
        WHERE job.id = active.id AND job.worker_id = $2 AND job.lease_token = active.token
          AND job.lease_expires_at > now() AND job.status IN ('probing', 'downloading')
          AND job.flagged = false RETURNING job.id`,
        [JSON.stringify(body.activeJobs!.map(j => ({ id: j.id, token: j.leaseToken }))), body.workerId]);
      activeJobIds.push(...renewed.rows.map(j => j.id));
    }
    return { ok: true, activeJobIds };
  });
}

export async function claimJob(request: Request, eligibleKinds?: string[]) {
  authenticateWorker(request);
  const protocol = request.headers.get("x-halaldl-worker-protocol");
  if (!["2", "3"].includes(protocol ?? "")) return null;
  const workerId = protocol === "3" ? request.headers.get("x-halaldl-worker-id") : null;
  if (protocol === "3") assertJobId(workerId ?? "");
  const requestedKind = request.headers.get("x-halaldl-job-kind");
  if (requestedKind && !["probe", "download"].includes(requestedKind)) throw new FetchError(400, "kind", "Invalid job kind.");
  return withClient(async (client) => {
    await client.query("BEGIN");
    try {
      await admissionLock(client);
      await expireStale(client);
      const snapshot = await queueSnapshot(client);
      if (!snapshot.processing) { await client.query("COMMIT"); return null; }
      if (requestedKind === "download" && !snapshot.downloadAvailable) { await client.query("COMMIT"); return null; }
      if (protocol === "3") {
        const owner = await client.query("SELECT 1 FROM halaldl_fetch.worker_status WHERE id = 1 AND worker_id = $1", [workerId]);
        if (!owner.rows[0]) throw new FetchError(409, "worker_active", "Worker heartbeat required.");
      }
      const queued = await client.query<{ id: string; session_id: string; kind: string }>(
        `SELECT id, session_id, kind FROM halaldl_fetch.jobs
         WHERE status = 'queued' AND private_job = false AND flagged = false AND ($1::text[] IS NULL OR kind = ANY($1)) AND (kind <> 'download' OR $3::boolean)
         ORDER BY CASE WHEN $2::boolean AND kind = 'download' THEN 0 ELSE 1 END, COALESCE(queued_at, confirmed_at, created_at), id FOR UPDATE SKIP LOCKED LIMIT 100`, [eligibleKinds ?? (requestedKind ? [requestedKind] : null), Boolean(eligibleKinds), eligibleKinds ? snapshot.downloadAvailable : true],
      );
      const running = await client.query<{ session_id: string }>(
        `SELECT session_id FROM halaldl_fetch.jobs WHERE status IN ('probing', 'downloading')`,
      );
      if (running.rows.length >= (protocol === "3" ? snapshot.capacity : 1)) { await client.query("COMMIT"); return null; }
      const runningSessions = new Set(running.rows.map((row) => row.session_id));
      const otherWaiting = queued.rows.some((row) => !runningSessions.has(row.session_id));
      const chosen = queued.rows.find((row) => !(runningSessions.has(row.session_id) && otherWaiting) && running.rows.filter(r => r.session_id === row.session_id).length < 3) ?? null;
      if (!chosen) {
        await client.query("COMMIT");
        return null;
      }
      const nextStatus = chosen.kind === "probe" ? "probing" : "downloading";
      const leaseToken = protocol === "3" ? randomUUID() : null;
      const job = await client.query(
        `UPDATE halaldl_fetch.jobs SET status = $2, updated_at = now(), worker_id = $3, lease_token = $4,
          lease_expires_at = CASE WHEN $4::uuid IS NULL THEN NULL ELSE now() + interval '90 seconds' END, attempts = attempts + 1 WHERE id = $1
         RETURNING id, source_url, platform, kind, tier, private_job, user_id, choice`,
        [chosen.id, nextStatus, workerId, leaseToken],
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
        deliveryMode: (row.choice as DownloadVariant | null)?.deliveryMode ?? null,
        expectedHeight: (row.choice as DownloadVariant | null)?.height ?? null,
        protocolVersion: protocol === "3" ? 3 : 2,
        workerId, leaseToken,
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
  workerId?: string;
  leaseToken?: string;
}) {
  authenticateWorker(request);
  if (typeof body.ok !== "boolean" || (body.formats !== undefined && !Array.isArray(body.formats))) throw new FetchError(400, "body", "Invalid worker result.");
  await withTransaction(async (client) => {
    const current = await client.query<{ kind: string; tier: FetchTier; status: string; private_job: boolean; choice: DownloadVariant | null; object_key: string | null; bytes: number | null; error_code: string | null; worker_id: string | null; lease_token: string | null; lease_expires_at: Date | null }>(
      "SELECT kind, tier, status, private_job, choice, object_key, bytes, error_code, worker_id, lease_token, lease_expires_at FROM halaldl_fetch.jobs WHERE id = $1 FOR UPDATE",
      [jobId],
    );
    const row = current.rows[0];
    if (!row) throw new FetchError(404, "missing", "Job not found.");
    if (row.private_job) throw new FetchError(410, "public_only", "Only supported public links are available.");
    const leasedReceipt = row.lease_token || body.leaseToken || body.workerId || request.headers.get("x-halaldl-worker-protocol") === "3";
    if (leasedReceipt && (!row.lease_token || row.lease_token !== body.leaseToken || row.worker_id !== body.workerId || request.headers.get("x-halaldl-worker-id") !== row.worker_id)) throw new FetchError(409, "lease", "This worker no longer owns the job.");
    if (row.status === "ready" && body.ok && row.object_key === body.objectKey && Number(row.bytes) === body.bytes) return;
    if (row.status === "failed" && !body.ok && row.error_code === body.errorCode) return;
    if (!["probing", "downloading"].includes(row.status)) throw new FetchError(409, "state", "The job is no longer processing.");
    if (row.lease_token && (!row.lease_expires_at || new Date(row.lease_expires_at).getTime() <= Date.now())) throw new FetchError(409, "lease", "The processing lease expired.");
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
    if (body.duration != null && (!Number.isFinite(body.duration) || body.duration <= 0 || body.duration > cap.maxSeconds + 1)) throw new FetchError(400, "too_long", "The file exceeds the duration limit.");
    await client.query(
      `UPDATE halaldl_fetch.jobs
       SET status = 'ready', object_key = $2, bytes = $3, ready_at = now(),
           expires_at = now() + interval '6 hours', actual_ext = $4, duration = COALESCE($5, duration), updated_at = now()
       WHERE id = $1`,
      [jobId, body.objectKey, body.bytes, extension, body.duration ?? null],
    );
  });
}

// Called by the supervised worker even when the download queue is paused.
export async function cleanupExpired(request: Request) {
  authenticateWorker(request);
  if (!storageConfigured()) throw new FetchError(503, "storage", "Downloads are paused. Try again later.");
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
