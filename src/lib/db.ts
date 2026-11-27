import "server-only";
import { Pool } from "pg";

/**
 * Shared PostgreSQL pool. Connection settings come from the standard libpq
 * environment variables (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE),
 * which `pg` reads on its own — no URL, so passwords need no escaping.
 *
 * Cached on globalThis so `next dev` hot reloads don't open a new pool each time.
 */
const globalForDb = globalThis as unknown as { pgPool?: Pool };

export const db: Pool =
  globalForDb.pgPool ?? new Pool({ max: 10, idleTimeoutMillis: 30_000 });

if (process.env.NODE_ENV !== "production") globalForDb.pgPool = db;
