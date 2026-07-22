import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const like = `%${q}%`;

  const rows = await query<{
    id: string; phone: string; name: string | null; email: string | null;
    role: string; created_at: string; orders: number;
  }>(
    `SELECT u.id, u.phone, u.name, u.email, u.role, u.created_at,
            (SELECT count(*)::int FROM bookings b WHERE b.user_id = u.id) AS orders
       FROM users u
      WHERE ($1 = '' OR u.phone ILIKE $2 OR COALESCE(u.name,'') ILIKE $2 OR COALESCE(u.email,'') ILIKE $2)
      ORDER BY u.created_at DESC
      LIMIT 200`,
    [q, like]
  );
  return NextResponse.json({ ok: true, users: rows });
}
