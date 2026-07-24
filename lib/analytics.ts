import { query, queryOne } from "@/lib/db";

export interface AdminAnalytics {
  revenue: { today: number; week: number; month: number; total: number };
  orders: { total: number; done: number; active: number; cancelled: number };
  avgCheck: number;
  repeatRate: number; // доля клиентов с 2+ выполненными заказами, %
  clients: { total: number; withOrders: number };
  statusFunnel: { status: string; count: number }[];
  revenueByDay: { day: string; revenue: number }[]; // последние 14 дней
  topExecutors: { name: string; done: number; rating: number }[];
}

const DONE = "'done'";

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  // Выручка считается по выполненным заказам
  const rev = await queryOne<{
    today: string; week: string; month: string; total: string;
  }>(
    `SELECT
        COALESCE(sum(total) FILTER (WHERE created_at >= date_trunc('day', now())), 0)   AS today,
        COALESCE(sum(total) FILTER (WHERE created_at >= now() - interval '7 days'), 0)   AS week,
        COALESCE(sum(total) FILTER (WHERE created_at >= now() - interval '30 days'), 0)  AS month,
        COALESCE(sum(total), 0) AS total
       FROM bookings WHERE status = ${DONE}`
  );

  const ord = await queryOne<{ total: number; done: number; active: number; cancelled: number }>(
    `SELECT count(*)::int AS total,
            count(*) FILTER (WHERE status = 'done')::int AS done,
            count(*) FILTER (WHERE status IN ('searching','assigned','in_progress'))::int AS active,
            count(*) FILTER (WHERE status = 'cancelled')::int AS cancelled
       FROM bookings`
  );

  const avg = await queryOne<{ avg: string | null }>(
    `SELECT AVG(total)::numeric(10,0) AS avg FROM bookings WHERE status = ${DONE}`
  );

  // Повторные: клиенты с 2+ выполненными заказами / клиенты с 1+ выполненным
  const repeat = await queryOne<{ repeat_clients: number; ordered_clients: number }>(
    `WITH per AS (
        SELECT user_id, count(*) c FROM bookings WHERE status = ${DONE} GROUP BY user_id
     )
     SELECT count(*) FILTER (WHERE c >= 2)::int AS repeat_clients,
            count(*)::int AS ordered_clients
       FROM per`
  );

  const clients = await queryOne<{ total: number; with_orders: number }>(
    `SELECT (SELECT count(*)::int FROM users WHERE role = 'client') AS total,
            (SELECT count(DISTINCT user_id)::int FROM bookings) AS with_orders`
  );

  const funnel = await query<{ status: string; count: number }>(
    `SELECT status, count(*)::int AS count FROM bookings GROUP BY status ORDER BY count DESC`
  );

  const byDay = await query<{ day: string; revenue: string }>(
    `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
            COALESCE(sum(total), 0) AS revenue
       FROM bookings
      WHERE status = ${DONE} AND created_at >= now() - interval '14 days'
      GROUP BY 1 ORDER BY 1`
  );

  const top = await query<{ name: string | null; done: number; rating: string | null }>(
    `SELECT u.name,
            count(b.*) FILTER (WHERE b.status = 'done')::int AS done,
            (SELECT AVG(rating)::numeric(3,1) FROM reviews WHERE executor_id = u.id) AS rating
       FROM users u JOIN bookings b ON b.assignee_id = u.id
      WHERE u.role = 'executor'
      GROUP BY u.id, u.name
      ORDER BY done DESC
      LIMIT 5`
  );

  const orderedClients = repeat?.ordered_clients ?? 0;
  return {
    revenue: {
      today: Number(rev?.today ?? 0),
      week: Number(rev?.week ?? 0),
      month: Number(rev?.month ?? 0),
      total: Number(rev?.total ?? 0),
    },
    orders: {
      total: ord?.total ?? 0,
      done: ord?.done ?? 0,
      active: ord?.active ?? 0,
      cancelled: ord?.cancelled ?? 0,
    },
    avgCheck: avg?.avg ? Number(avg.avg) : 0,
    repeatRate: orderedClients > 0 ? Math.round(((repeat?.repeat_clients ?? 0) / orderedClients) * 100) : 0,
    clients: { total: clients?.total ?? 0, withOrders: clients?.with_orders ?? 0 },
    statusFunnel: funnel,
    revenueByDay: byDay.map((d) => ({ day: d.day, revenue: Number(d.revenue) })),
    topExecutors: top.map((t) => ({
      name: t.name?.trim().split(/\s+/)[0] || "Клинер",
      done: t.done,
      rating: t.rating ? Number(t.rating) : 0,
    })),
  };
}
