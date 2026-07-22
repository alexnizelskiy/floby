import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { name?: string; email?: string };
  const name = (body.name ?? "").slice(0, 60).trim() || null;
  const email = (body.email ?? "").slice(0, 120).trim() || null;

  await query("UPDATE users SET name = $1, email = $2 WHERE id = $3", [name, email, user.id]);
  return NextResponse.json({ ok: true });
}
