-- Workflow status for the lead-management capability.
-- Idempotent: safe to re-run (npm run db:migrate).

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS processed boolean NOT NULL DEFAULT false;
