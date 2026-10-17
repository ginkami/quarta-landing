import { Pool } from "@neondatabase/serverless";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set after loading the environment");
  process.exit(1);
}

const pool = new Pool({ connectionString });

interface LeadRow {
  id: string;
  created_at: Date;
  name: string;
  phone: string;
  interest: string;
  comment: string | null;
  attribution: unknown;
}

async function main(): Promise<void> {
  const count = await pool.query<{ total: string }>(
    "SELECT count(*)::text AS total FROM leads",
  );
  console.log(`Total leads: ${count.rows[0]?.total ?? "0"}`);

  const recent = await pool.query<LeadRow>(
    "SELECT id, created_at, name, phone, interest, comment, attribution FROM leads ORDER BY created_at DESC LIMIT 10",
  );
  for (const row of recent.rows) {
    const attribution =
      typeof row.attribution === "object" && row.attribution !== null
        ? Object.keys(row.attribution as Record<string, unknown>).join(",") || "empty"
        : "empty";
    console.log(
      `- ${row.created_at.toISOString()} | ${row.phone} | ${row.interest} | ${row.name} | attribution: ${attribution}`,
    );
  }
}

main()
  .catch((error: unknown) => {
    console.error("Listing leads failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
