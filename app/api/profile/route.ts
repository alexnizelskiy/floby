import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser, normalizePhone } from "@/lib/auth";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    phone?: string;
  };

  // Only touch the fields the caller actually sent — a phone-only update must
  // not wipe name/email (and vice versa).
  const sets: string[] = [];
  const params: unknown[] = [];
  if (body.name !== undefined) {
    sets.push(`name = $${params.length + 1}`);
    params.push((body.name ?? "").slice(0, 60).trim() || null);
  }
  if (body.email !== undefined) {
    sets.push(`email = $${params.length + 1}`);
    params.push((body.email ?? "").slice(0, 120).trim() || null);
  }
  if (sets.length > 0) {
    params.push(user.id);
    await query(`UPDATE users SET ${sets.join(", ")} WHERE id = $${params.length}`, params);
  }

  // Phone is updated separately — it is UNIQUE and needs conflict handling.
  // Mainly for social-login users adding a contact number.
  if (body.phone !== undefined) {
    const normalized = normalizePhone(body.phone ?? "");
    if (body.phone && !normalized) {
      return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 422 });
    }
    try {
      await query("UPDATE users SET phone = $1 WHERE id = $2", [normalized, user.id]);
    } catch (e) {
      if ((e as { code?: string })?.code === "23505") {
        return NextResponse.json({ ok: false, error: "phone_taken" }, { status: 409 });
      }
      throw e;
    }
  }

  return NextResponse.json({ ok: true });
}
