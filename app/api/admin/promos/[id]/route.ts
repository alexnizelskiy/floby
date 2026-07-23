import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { active?: boolean };
  if (typeof body.active === "boolean") {
    await query("UPDATE promo_codes SET active = $1 WHERE id = $2", [body.active, id]);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const { id } = await params;
  await query("DELETE FROM promo_codes WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
