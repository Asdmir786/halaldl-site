// Explicit operator/test bootstrap. Supply DATABASE_URL in the environment.
import { ensureSchema, getPool } from "../src/lib/fetch/db.ts";
try { await ensureSchema(); console.log("fetch_schema_initialized"); }
finally { await getPool().end(); }
