import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { EXECUTOR_SHARE_PERCENT } from "@/lib/executor";

export async function GET() {
  const user = await getCurrentUser();
  // Payouts are financial data — admin only.
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const rows = await query<{
    id: string; name: string | null; phone: string | null;
    done: number; active: number; gross: number; rating: string | null;
  }>(
    `SELECT u.id, u.name, u.phone,
            count(b.id) FILTER (WHERE b.status = 'done')::int AS done,
            count(b.id) FILTER (WHERE b.status IN ('assigned','in_progress'))::int AS active,
            COALESCE(sum(b.total) FILTER (WHERE b.status = 'done'), 0)::int AS gross,
            (SELECT AVG(rating)::numeric(3,1) FROM reviews rr WHERE rr.executor_id = u.id) AS rating
       FROM users u
       LEFT JOIN bookings b ON b.assignee_id = u.id
      WHERE u.role = 'executor'
      GROUP BY u.id, u.name, u.phone
      ORDER BY gross DESC`
  );

  const share = EXECUTOR_SHARE_PERCENT;
  const payouts = rows.map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    done: r.done,
    active: r.active,
    gross: r.gross,
    payout: Math.round((r.gross * share) / 100),
    rating: r.rating ? Number(r.rating) : 0,
  }));

  return NextResponse.json({ ok: true, payouts, sharePercent: share });
}
