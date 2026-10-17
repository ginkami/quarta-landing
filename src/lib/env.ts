import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

type ServerEnv = {
  DATABASE_URL: string;
};

let cached: ServerEnv | undefined;

/**
 * Validates server environment variables on first use instead of at module
 * import time, so `next build` and static prerendering keep working on
 * machines without a local database URL.
 */
export function getServerEnv(): ServerEnv {
  if (cached) {
    return cached;
  }

  const env = createEnv({
    server: {
      DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),
    },
    experimental__runtimeEnv: process.env,
  });

  cached = { DATABASE_URL: env.DATABASE_URL };
  return cached;
}
