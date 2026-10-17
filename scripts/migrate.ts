import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool } from "@neondatabase/serverless";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set after loading the environment");
  process.exit(1);
}

const MIGRATIONS = ["0001_create_leads.sql"] as const;

const pool = new Pool({ connectionString });

async function main(): Promise<void> {
  for (const file of MIGRATIONS) {
    const sql = readFileSync(
      path.join(process.cwd(), "db", "migrations", file),
      "utf8",
    );
    await pool.query(sql);
    console.log(`Applied migration: ${file}`);
  }
  console.log("Migrations complete");
}

main()
  .catch((error: unknown) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
