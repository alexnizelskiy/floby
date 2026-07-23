import { query, queryOne } from "@/lib/db";

/**
 * Доля клинера от стоимости заказа (как в Qlean — исполнитель получает
 * бóльшую часть чека, платформа удерживает комиссию). Настраивается через
 * EXECUTOR_SHARE_PERCENT; по умолчанию 70%.
 */
export const EXECUTOR_SHARE_PERCENT = Math.min(
  100,
  Math.max(0, Number(process.env.EXECUTOR_SHARE_PERCENT ?? 70))
);

export interface ExecutorStats {
  doneCount: number;
  activeCount: number;
  /** сумма, заработанная клинером по выполненным заказам (его доля) */
  earned: number;
  /** валовая стоимость выполненных заказов */
  gross: number;
  sharePercent: number;
  rating: { avg: number; count: number };
}

export async function getExecutorStats(userId: string): Promise<ExecutorStats> {
  const agg = await queryOne<{ done: number; active: number; gross: string | null }>(
    `SELECT
        count(*) FILTER (WHERE status = 'done')::int AS done,
        count(*) FILTER (WHERE status IN ('assigned','in_progress'))::int AS active,
        COALESCE(sum(total) FILTER (WHERE status = 'done'), 0) AS gross
       FROM bookings WHERE assignee_id = $1`,
    [userId]
  );
  const rat = await queryOne<{ avg: string | null; count: number }>(
    "SELECT AVG(rating)::numeric(3,1) AS avg, count(*)::int AS count FROM reviews WHERE executor_id = $1",
    [userId]
  );

  const gross = Number(agg?.gross ?? 0);
  const earned = Math.round((gross * EXECUTOR_SHARE_PERCENT) / 100);
  return {
    doneCount: agg?.done ?? 0,
    activeCount: agg?.active ?? 0,
    gross,
    earned,
    sharePercent: EXECUTOR_SHARE_PERCENT,
    rating: { avg: rat?.avg ? Number(rat.avg) : 0, count: rat?.count ?? 0 },
  };
}
