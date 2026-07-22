import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser, isAdmin, isStaff } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser();
  if (!isStaff(me)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { role?: string };
  const role = body.role;

  // Admins can set any of these; managers may only toggle client/executor.
  const allowed = isAdmin(me) ? ["client", "executor", "manager"] : ["client", "executor"];
  if (!role || !allowed.includes(role)) {
    return NextResponse.json({ ok: false, error: "role_not_allowed" }, { status: 422 });
  }

  // Never let anyone demote/alter an admin through this endpoint.
  const target = await query<{ role: string }>("SELECT role FROM users WHERE id = $1", [id]);
  if (target[0]?.role === "admin") {
    return NextResponse.json({ ok: false, error: "cannot_modify_admin" }, { status: 403 });
  }

  await query("UPDATE users SET role = $1 WHERE id = $2", [role, id]);
  return NextResponse.json({ ok: true });
}
