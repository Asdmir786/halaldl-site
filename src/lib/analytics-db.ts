import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

let sqlInstance: postgres.Sql | null = null;
let ensureSchemaPromise: Promise<void> | null = null;

export function isAnalyticsEnabled() {
  return Boolean(connectionString);
}

export function getSql() {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!sqlInstance) {
    sqlInstance = postgres(connectionString, {
      max: 1,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 15,
    });
  }

  return sqlInstance;
}

export async function ensureAnalyticsSchema() {
  if (!isAnalyticsEnabled()) {
    return;
  }

  if (!ensureSchemaPromise) {
    const sql = getSql();
    ensureSchemaPromise = (async () => {
      await sql`
        create table if not exists analytics_events (
          id bigint generated always as identity primary key,
          created_at timestamptz not null default now(),
          event_type text not null,
          event_name text not null,
          page_path text,
          referrer text,
          source_host text,
          visitor_id text not null,
          session_id text not null,
          country text,
          device_type text,
          browser text,
          os text,
          cta text,
          section text,
          command text,
          metadata jsonb not null default '{}'::jsonb
        )
      `;

      await sql`
        create index if not exists analytics_events_created_at_idx
        on analytics_events (created_at desc)
      `;
      await sql`
        create index if not exists analytics_events_type_idx
        on analytics_events (event_type, created_at desc)
      `;
      await sql`
        create index if not exists analytics_events_page_idx
        on analytics_events (page_path, created_at desc)
      `;
      await sql`
        create index if not exists analytics_events_session_idx
        on analytics_events (session_id, created_at desc)
      `;
    })();
  }

  await ensureSchemaPromise;
}
