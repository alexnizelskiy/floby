import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await query<{ id: string; name: string | null; rating: string | null; done: number }>(
      `SELECT u.id, u.name,
              (SELECT AVG(rating)::numeric(3,1) FROM reviews WHERE executor_id = u.id) AS rating,
              (SELECT count(*)::int FROM bookings WHERE assignee_id = u.id AND status = 'done') AS done
         FROM users u
        WHERE u.role = 'executor'
        ORDER BY done DESC
        LIMIT 8`
    );
    const cleaners = rows
      .filter((r) => r.done > 0)
      .map((r) => {
        const parts = (r.name ?? "").trim().split(/\s+/);
        const name = parts[0] ? `${parts[0]}${parts[1] ? ` ${parts[1][0]}.` : ""}` : "Клинер";
        return { id: r.id, name, initials: (parts[0]?.[0] ?? "К").toUpperCase(), rating: r.rating ? Number(r.rating) : 0, done: r.done };
      });
    return NextResponse.json({ ok: true, cleaners });
  } catch {
    return NextResponse.json({ ok: true, cleaners: [] });
  }
}
