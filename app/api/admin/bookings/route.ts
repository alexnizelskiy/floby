import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const rows = await query<{
    id: string; data: unknown; status: string; total: number; paid: boolean;
    assignee_id: string | null; created_at: string;
    client_phone: string; client_name: string | null;
    assignee_phone: string | null; assignee_name: string | null;
  }>(
    `SELECT b.id, b.data, b.status, b.total, b.paid, b.assignee_id, b.created_at,
            cu.phone AS client_phone, cu.name AS client_name,
            au.phone AS assignee_phone, au.name AS assignee_name
       FROM bookings b
       JOIN users cu ON cu.id = b.user_id
       LEFT JOIN users au ON au.id = b.assignee_id
      ORDER BY b.created_at DESC`
  );

  const bookings = rows.map((r) => ({
    ...(typeof r.data === "string" ? JSON.parse(r.data) : (r.data as object)),
    id: r.id,
    status: r.status,
    total: r.total,
    paid: r.paid,
    createdAt: r.created_at,
    assigneeId: r.assignee_id,
    client: { phone: r.client_phone, name: r.client_name },
    assignee: r.assignee_id ? { phone: r.assignee_phone, name: r.assignee_name } : null,
  }));
  return NextResponse.json({ ok: true, bookings });
}
