import { getPool } from "@/lib/db";
import type { StatusFilter } from "@/lib/schemas/admin";

interface LeadRow {
  id: string;
  created_at: Date;
  name: string;
  phone: string;
  interest: string;
  comment: string | null;
  processed: boolean;
  attribution: unknown;
}

export interface AdminLead {
  readonly id: string;
  readonly createdAt: string;
  readonly name: string;
  readonly phone: string;
  readonly interest: string;
  readonly comment: string | null;
  readonly processed: boolean;
  readonly attribution: unknown;
}

const SELECT_LEADS = `
  SELECT id, created_at, name, phone, interest, comment, processed, attribution
  FROM leads
`;

const ORDER_LEADS = "ORDER BY processed ASC, created_at DESC";

function mapLead(row: LeadRow): AdminLead {
  return {
    id: row.id,
    createdAt: row.created_at.toISOString(),
    name: row.name,
    phone: row.phone,
    interest: row.interest,
    comment: row.comment,
    processed: row.processed,
    attribution: row.attribution,
  };
}

/** Unprocessed leads first, then newest first inside each group. */
export async function listLeads(filter: StatusFilter): Promise<AdminLead[]> {
  const pool = getPool();
  if (filter === "all") {
    const result = await pool.query<LeadRow>(`${SELECT_LEADS} ${ORDER_LEADS}`);
    return result.rows.map(mapLead);
  }
  const processed = filter === "processed";
  const result = await pool.query<LeadRow>(
    `${SELECT_LEADS} WHERE processed = $1 ${ORDER_LEADS}`,
    [processed],
  );
  return result.rows.map(mapLead);
}

/** Updates the processing status; false when the lead does not exist. */
export async function setLeadProcessed(id: string, processed: boolean): Promise<boolean> {
  const result = await getPool().query("UPDATE leads SET processed = $1 WHERE id = $2", [
    processed,
    id,
  ]);
  return (result.rowCount ?? 0) > 0;
}

/** Permanently removes the lead; false when it does not exist. */
export async function deleteLead(id: string): Promise<boolean> {
  const result = await getPool().query("DELETE FROM leads WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

/** Saves the comment text, or clears it with null; false when the lead is gone. */
export async function setLeadComment(id: string, comment: string | null): Promise<boolean> {
  const result = await getPool().query("UPDATE leads SET comment = $1 WHERE id = $2", [
    comment,
    id,
  ]);
  return (result.rowCount ?? 0) > 0;
}
