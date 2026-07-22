import { NextResponse } from "next/server";
import { query } from "@/lib/db";
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
