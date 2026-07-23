import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, queryOne } from "@/lib/db";
import { normalizePhone, hashCode, createSession, upsertUserByPhone } from "@/lib/auth";
import { ensureRefCode, applyReferral } from "@/lib/bonus";

const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { phone?: string; code?: string };
  const phone = normalizePhone(body.phone ?? "");
  const code = (body.code ?? "").replace(/\D/g, "");
  if (!phone || code.length < 4) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 422 });
  }

  const otp = await queryOne<{ id: string; code_hash: string; expires_at: string; attempts: number }>(
    "SELECT id, code_hash, expires_at, attempts FROM otp_codes WHERE phone = $1 ORDER BY created_at DESC LIMIT 1",
    [phone]
  );
  if (!otp) {
    return NextResponse.json({ ok: false, error: "no_code" }, { status: 400 });
  }
  if (new Date(otp.expires_at).getTime() < Date.now()) {
    await query("DELETE FROM otp_codes WHERE id = $1", [otp.id]);
    return NextResponse.json({ ok: false, error: "code_expired" }, { status: 400 });
  }
  if (otp.attempts >= MAX_ATTEMPTS) {
    await query("DELETE FROM otp_codes WHERE id = $1", [otp.id]);
    return NextResponse.json({ ok: false, error: "too_many_attempts" }, { status: 429 });
  }
  if (otp.code_hash !== hashCode(phone, code)) {
    await query("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1", [otp.id]);
    return NextResponse.json({ ok: false, error: "wrong_code" }, { status: 400 });
  }

  // Success — consume code, create/find user, start session
  await query("DELETE FROM otp_codes WHERE phone = $1", [phone]);

  const existed = await queryOne("SELECT id FROM users WHERE phone = $1", [phone]);
  const user = await upsertUserByPhone(phone);
  await ensureRefCode(user.id);

  if (!existed) {
    // brand-new user — apply referral captured on landing (?ref=CODE)
    const store = await cookies();
    const ref = store.get("floby_ref")?.value;
    if (ref) {
      await applyReferral(user.id, ref);
      store.delete("floby_ref");
    }
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true, user: { id: user.id, phone: user.phone, name: user.name } });
}
