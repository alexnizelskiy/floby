import { query, queryOne } from "@/lib/db";

/**
 * «Постоянный клинер»: если выполненный заказ был с подпиской и назначенным
 * исполнителем — закрепляем этого клинера за клиентом. На следующие уборки
 * (в т.ч. регулярные) будем предлагать/назначать того же человека.
 */
export async function rememberPreferredExecutor(bookingId: string): Promise<void> {
  const b = await queryOne<{ user_id: string; assignee_id: string | null; data: unknown }>(
    "SELECT user_id, assignee_id, data FROM bookings WHERE id = $1",
    [bookingId]
  );
  if (!b || !b.assignee_id) return;
  const data = (typeof b.data === "string" ? JSON.parse(b.data) : b.data) as { subscription?: string };
  if (!data.subscription || data.subscription === "none") return;
  await query("UPDATE users SET preferred_executor_id = $1 WHERE id = $2", [b.assignee_id, b.user_id]);
}

export interface PreferredExecutor {
  id: string;
  name: string;
  rating: number;
  doneCount: number;
}

export async function getPreferredExecutor(userId: string): Promise<PreferredExecutor | null> {
  const row = await queryOne<{ id: string; name: string | null }>(
    `SELECT e.id, e.name
       FROM users u JOIN users e ON e.id = u.preferred_executor_id
      WHERE u.id = $1`,
    [userId]
  );
  if (!row) return null;
  const stats = await queryOne<{ avg: string | null; done: number }>(
    `SELECT (SELECT AVG(rating)::numeric(3,1) FROM reviews WHERE executor_id = $1) AS avg,
            (SELECT count(*)::int FROM bookings WHERE assignee_id = $1 AND status = 'done') AS done`,
    [row.id]
  );
  return {
    id: row.id,
    name: row.name?.trim().split(/\s+/)[0] || "Клинер",
    rating: stats?.avg ? Number(stats.avg) : 0,
    doneCount: stats?.done ?? 0,
  };
}

/** Executor id to pre-assign for a user's next booking, if any. */
export async function getPreferredExecutorId(userId: string): Promise<string | null> {
  const row = await queryOne<{ preferred_executor_id: string | null }>(
    "SELECT preferred_executor_id FROM users WHERE id = $1",
    [userId]
  );
  return row?.preferred_executor_id ?? null;
}
