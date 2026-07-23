import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { handleOrderCompleted } from "@/lib/bonus";

// executors may only move their own order forward
const ALLOWED = ["in_progress", "done"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: string };
  if (!body.status || !ALLOWED.includes(body.status)) {
    return NextResponse.json({ ok: false, error: "bad_status" }, { status: 422 });
  }

  await query(
    "UPDATE bookings SET status = $1 WHERE id = $2 AND assignee_id = $3",
    [body.status, id, user.id]
  );
  if (body.status === "done") await handleOrderCompleted(id);
  return NextResponse.json({ ok: true });
}
