-- Leads table for the lead-capture capability.
-- Idempotent: safe to re-run (npm run db:migrate).

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  phone text NOT NULL,
  interest text NOT NULL,
  comment text,
  attribution jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS leads_phone_created_at_idx
  ON leads (phone, created_at DESC);
