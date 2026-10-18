import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

type ServerEnv = {
  DATABASE_URL: string;
  ADMIN_PASSWORD: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
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
      ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters"),
      TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
      TELEGRAM_CHAT_ID: z.string().min(1).optional(),
    },
    experimental__runtimeEnv: process.env,
  });

  cached = {
    DATABASE_URL: env.DATABASE_URL,
    ADMIN_PASSWORD: env.ADMIN_PASSWORD,
    TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: env.TELEGRAM_CHAT_ID,
  };
  return cached;
}
