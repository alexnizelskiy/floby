import { NextResponse } from "next/server";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const reviews = await query(
    `SELECT r.id, r.rating, r.text, r.service, r.created_at,
            cu.name AS client_name, eu.name AS executor_name
       FROM reviews r
       JOIN users cu ON cu.id = r.user_id
       LEFT JOIN users eu ON eu.id = r.executor_id
      ORDER BY r.created_at DESC
      LIMIT 100`
  );
  return NextResponse.json({ ok: true, reviews });
}
