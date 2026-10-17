import { Pool } from "@neondatabase/serverless";
import { getServerEnv } from "@/lib/env";

let pool: Pool | undefined;

/**
 * Lazily created shared connection pool (pg over WebSocket).
 * All persistence goes through this Pool because transactions and
 * advisory locks are required (the HTTP `neon()` driver cannot run them).
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: getServerEnv().DATABASE_URL });
  }
  return pool;
}
