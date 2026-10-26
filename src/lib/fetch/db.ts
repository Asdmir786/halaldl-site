import { Pool, neonConfig, type PoolClient } from "@neondatabase/serverless";

neonConfig.poolQueryViaFetch = true;

const globalPool = globalThis as typeof globalThis & { __halaldlFetchPool?: Pool };
let schemaReady: Promise<void> | null = null;

function connectionString() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) throw new Error("DATABASE_URL is not set.");
  return value;
}

export function getPool() {
  if (!globalPool.__halaldlFetchPool) {
    globalPool.__halaldlFetchPool = new Pool({ connectionString: connectionString(), max: 1 });
  }
  return globalPool.__halaldlFetchPool;
}

const STATEMENTS = [
  "CREATE SCHEMA IF NOT EXISTS halaldl_fetch",
  `CREATE TABLE IF NOT EXISTS halaldl_fetch.users (
    id uuid PRIMARY KEY,
    google_sub text UNIQUE NOT NULL,
    email text,
    name text,
    tier text NOT NULL DEFAULT 'free',
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS halaldl_fetch.sessions (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES halaldl_fetch.users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS halaldl_fetch.jobs (
    id uuid PRIMARY KEY,
    session_id uuid NOT NULL,
    user_id uuid,
    source_url text NOT NULL,
    platform text NOT NULL,
    kind text NOT NULL,
    status text NOT NULL,
    tier text NOT NULL,
    private_job boolean NOT NULL DEFAULT false,
    rights_ack boolean NOT NULL DEFAULT false,
    quota_spent boolean NOT NULL DEFAULT false,
    flagged boolean NOT NULL DEFAULT false,
    formats jsonb,
    choice jsonb,
    object_key text,
    error_code text,
    bytes bigint,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    ready_at timestamptz,
    expires_at timestamptz
  )`,
  `CREATE TABLE IF NOT EXISTS halaldl_fetch.secrets (
    user_id uuid NOT NULL REFERENCES halaldl_fetch.users(id) ON DELETE CASCADE,
    platform text NOT NULL,
    cookies_cipher text,
    proxy_cipher text,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, platform)
  )`,
  `CREATE TABLE IF NOT EXISTS halaldl_fetch.worker_status (
    id int PRIMARY KEY,
    reported_at timestamptz,
    running_jobs int NOT NULL DEFAULT 0,
    waiting_jobs int NOT NULL DEFAULT 0,
    load_average double precision,
    memory_free_mb int,
    disk_free_mb int,
    cpu_count int,
    accepting boolean NOT NULL DEFAULT false,
    transcoding boolean NOT NULL DEFAULT false,
    detail text
  )`,
  "ALTER TABLE halaldl_fetch.jobs ADD COLUMN IF NOT EXISTS confirmed_at timestamptz",
  `CREATE TABLE IF NOT EXISTS halaldl_fetch.source_limits (
    source_hash text PRIMARY KEY, window_started timestamptz NOT NULL, hits int NOT NULL
  )`,
  "ALTER TABLE halaldl_fetch.jobs ADD COLUMN IF NOT EXISTS title text",
  "ALTER TABLE halaldl_fetch.jobs ADD COLUMN IF NOT EXISTS thumbnail text",
  "ALTER TABLE halaldl_fetch.jobs ADD COLUMN IF NOT EXISTS duration double precision",
  "ALTER TABLE halaldl_fetch.jobs ADD COLUMN IF NOT EXISTS actual_ext text",
  "ALTER TABLE halaldl_fetch.jobs ADD COLUMN IF NOT EXISTS client_hash text",
  "ALTER TABLE halaldl_fetch.worker_status ADD COLUMN IF NOT EXISTS protocol_version int NOT NULL DEFAULT 1",
  "CREATE INDEX IF NOT EXISTS halaldl_fetch_jobs_client_idx ON halaldl_fetch.jobs (client_hash, created_at)",
  "INSERT INTO halaldl_fetch.worker_status (id) VALUES (1) ON CONFLICT (id) DO NOTHING",
  "CREATE INDEX IF NOT EXISTS halaldl_fetch_jobs_session_idx ON halaldl_fetch.jobs (session_id, created_at DESC)",
  "CREATE INDEX IF NOT EXISTS halaldl_fetch_jobs_status_idx ON halaldl_fetch.jobs (status, created_at)",
];

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const pool = getPool();
      for (const statement of STATEMENTS) {
        await pool.query(statement);
      }
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

export async function withClient<T>(fn: (client: PoolClient) => Promise<T>) {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
