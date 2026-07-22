import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const rows = await query<{
    id: string; data: unknown; status: string; total: number; created_at: string;
    client_phone: string; client_name: string | null;
  }>(
    `SELECT b.id, b.data, b.status, b.total, b.created_at,
            cu.phone AS client_phone, cu.name AS client_name
       FROM bookings b JOIN users cu ON cu.id = b.user_id
      WHERE b.assignee_id = $1
      ORDER BY b.created_at DESC`,
    [user.id]
  );

  const orders = rows.map((r) => ({
    ...(typeof r.data === "string" ? JSON.parse(r.data) : (r.data as object)),
    id: r.id,
    status: r.status,
    total: r.total,
    createdAt: r.created_at,
    client: { phone: r.client_phone, name: r.client_name },
  }));
  return NextResponse.json({ ok: true, orders });
}
