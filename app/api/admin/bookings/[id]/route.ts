import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { handleOrderCompleted } from "@/lib/bonus";
import { createNextIfRecurring } from "@/lib/subscription";
import { notifyBookingStatus } from "@/lib/notify";

const STATUSES = ["searching", "assigned", "in_progress", "done", "cancelled"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    assigneeId?: string | null;
    status?: string;
  };

  if (body.assigneeId !== undefined) {
    const assignee = body.assigneeId || null;
    // assigning an executor moves the order to "assigned"; unassigning back to "searching"
    const nextStatus = assignee ? "assigned" : "searching";
    await query("UPDATE bookings SET assignee_id = $1, status = $2 WHERE id = $3", [
      assignee,
      nextStatus,
      id,
    ]);
    if (assignee) await notifyBookingStatus(id, "assigned").catch(() => {});
  }
  if (body.status && STATUSES.includes(body.status)) {
    await query("UPDATE bookings SET status = $1 WHERE id = $2", [body.status, id]);
    await notifyBookingStatus(id, body.status).catch(() => {});
    if (body.status === "done") {
      await handleOrderCompleted(id);
      await createNextIfRecurring(id);
    }
  }
  return NextResponse.json({ ok: true });
}
