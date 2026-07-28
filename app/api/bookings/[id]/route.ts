import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  await query("DELETE FROM bookings WHERE id = $1 AND user_id = $2", [id, user.id]);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    action?: "reschedule" | "cancel_subscription";
    date?: string;
    time?: string;
  };

  const row = await queryOne<{ data: unknown; status: string }>(
    "SELECT data, status FROM bookings WHERE id = $1 AND user_id = $2",
    [id, user.id]
  );
  if (!row) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  if (row.status === "done" || row.status === "cancelled") {
    return NextResponse.json({ ok: false, error: "not_editable" }, { status: 409 });
  }

  const data = (typeof row.data === "string" ? JSON.parse(row.data) : row.data) as Record<string, unknown>;

  if (body.action === "reschedule") {
    if (!body.date || !body.time) {
      return NextResponse.json({ ok: false, error: "bad_slot" }, { status: 422 });
    }
    data.date = body.date;
    data.time = body.time;
  } else if (body.action === "cancel_subscription") {
    // прекращаем регулярность: следующая уборка не будет создана
    data.subscription = "none";
    await query("UPDATE bookings SET recurring_spawned = true WHERE id = $1", [id]);
  } else {
    return NextResponse.json({ ok: false, error: "bad_action" }, { status: 422 });
  }

  await query("UPDATE bookings SET data = $1 WHERE id = $2", [JSON.stringify(data), id]);
  return NextResponse.json({ ok: true });
}
