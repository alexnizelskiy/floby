/**
 * Manual executor payouts (accounting only — no money movement yet).
 * earned = executor share of completed orders; paid = recorded payouts;
 * balance = earned − paid. Admin transfers manually and marks it paid.
 *
 * Server-only.
 */
import { query } from "@/lib/db";
import { newId } from "@/lib/auth";
import { EXECUTOR_SHARE_PERCENT } from "@/lib/executor";

export interface PayoutSummary {
  id: string;
  name: string | null;
  phone: string | null;
  payoutDetails: string | null;
  inn: string | null;
  done: number;
  active: number;
  gross: number;
  earned: number;
  paid: number;
  balance: number;
  rating: number;
}

export interface PayoutRecord {
  id: string;
  amount: number;
  note: string | null;
  created_at: string;
}

/** Per-executor earnings vs. what has already been paid out. */
export async function getPayoutSummaries(): Promise<PayoutSummary[]> {
  const share = EXECUTOR_SHARE_PERCENT;
  const rows = await query<{
    id: string; name: string | null; phone: string | null;
    payout_details: string | null; inn: string | null;
    done: number; active: number; gross: number; paid: number; rating: string | null;
  }>(
    `SELECT u.id, u.name, u.phone, u.payout_details, u.inn,
            count(b.id) FILTER (WHERE b.status = 'done')::int AS done,
            count(b.id) FILTER (WHERE b.status IN ('assigned','in_progress'))::int AS active,
            COALESCE(sum(b.total) FILTER (WHERE b.status = 'done'), 0)::int AS gross,
            COALESCE((SELECT sum(p.amount) FROM payouts p WHERE p.executor_id = u.id), 0)::int AS paid,
            (SELECT AVG(rating)::numeric(3,1) FROM reviews rr WHERE rr.executor_id = u.id) AS rating
       FROM users u
       LEFT JOIN bookings b ON b.assignee_id = u.id
      WHERE u.role = 'executor'
      GROUP BY u.id, u.name, u.phone, u.payout_details, u.inn
      ORDER BY (COALESCE(sum(b.total) FILTER (WHERE b.status = 'done'), 0) * $1 / 100
                - COALESCE((SELECT sum(p.amount) FROM payouts p WHERE p.executor_id = u.id), 0)) DESC`,
    [share]
  );

  return rows.map((r) => {
    const earned = Math.round((r.gross * share) / 100);
    const balance = earned - r.paid;
    return {
      id: r.id,
      name: r.name,
      phone: r.phone,
      payoutDetails: r.payout_details,
      inn: r.inn,
      done: r.done,
      active: r.active,
      gross: r.gross,
      earned,
      paid: r.paid,
      balance,
      rating: r.rating ? Number(r.rating) : 0,
    };
  });
}

export async function recordPayout(
  executorId: string,
  amount: number,
  note: string | null,
  createdBy: string
): Promise<void> {
  await query(
    "INSERT INTO payouts (id, executor_id, amount, note, created_by) VALUES ($1, $2, $3, $4, $5)",
    [newId(), executorId, amount, note, createdBy]
  );
}

export async function getPayoutHistory(executorId: string, limit = 50): Promise<PayoutRecord[]> {
  return query<PayoutRecord>(
    "SELECT id, amount, note, created_at FROM payouts WHERE executor_id = $1 ORDER BY created_at DESC LIMIT $2",
    [executorId, limit]
  );
}

/** Executor's own payout view for the cleaner cabinet. */
export async function getExecutorPayoutState(executorId: string): Promise<{
  earned: number;
  paid: number;
  balance: number;
  history: PayoutRecord[];
}> {
  const share = EXECUTOR_SHARE_PERCENT;
  const row = await query<{ gross: number; paid: number }>(
    `SELECT COALESCE(sum(b.total) FILTER (WHERE b.status = 'done'), 0)::int AS gross,
            COALESCE((SELECT sum(p.amount) FROM payouts p WHERE p.executor_id = $1), 0)::int AS paid
       FROM bookings b WHERE b.assignee_id = $1`,
    [executorId]
  );
  const gross = row[0]?.gross ?? 0;
  const paid = row[0]?.paid ?? 0;
  const earned = Math.round((gross * share) / 100);
  const history = await getPayoutHistory(executorId, 20);
  return { earned, paid, balance: earned - paid, history };
}
