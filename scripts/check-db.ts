import { Pool } from "@neondatabase/serverless";
import nextEnv from "@next/env";

// Load .env.local exactly like `next dev` / `next build` do.
nextEnv.loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set after loading the environment");
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function main(): Promise<void> {
  const result = await pool.query("SELECT 1 AS ok");
  const row = result.rows[0];
  if (row?.ok !== 1) {
    throw new Error(`Unexpected result from SELECT 1: ${JSON.stringify(row)}`);
  }
  console.log("Database connection OK (SELECT 1)");
}

main()
  .catch((error: unknown) => {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
