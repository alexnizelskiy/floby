import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getCurrentUser, normalizePhone, hashCode, createSession, mergeUserInto } from "@/lib/auth";

const MAX_ATTEMPTS = 5;

/**
 * Привязать подтверждённый по SMS телефон к ТЕКУЩЕМУ аккаунту (обычно вход через
 * VK/Яндекс без телефона). Если номер уже принадлежит другому аккаунту (например,
 * созданному ботом), аккаунты сливаются в тот, где номер, — так заказы из бота и
 * с сайта оказываются в одном кабинете.
 */
export async function POST(request: Request) {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { phone?: string; code?: string };
  const phone = normalizePhone(body.phone ?? "");
  const code = (body.code ?? "").replace(/\D/g, "");
  if (!phone || code.length < 4) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 422 });
  }

  // --- проверка OTP (как в /api/auth/verify) ---
  const otp = await queryOne<{ id: string; code_hash: string; expires_at: string; attempts: number }>(
    "SELECT id, code_hash, expires_at, attempts FROM otp_codes WHERE phone = $1 ORDER BY created_at DESC LIMIT 1",
    [phone]
  );
  if (!otp) return NextResponse.json({ ok: false, error: "no_code" }, { status: 400 });
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
  await query("DELETE FROM otp_codes WHERE phone = $1", [phone]);

  // --- привязка / слияние ---
  const existing = await queryOne<{ id: string }>("SELECT id FROM users WHERE phone = $1", [phone]);

  if (!existing) {
    // Номер свободен — просто ставим его текущему аккаунту
    await query("UPDATE users SET phone = $1 WHERE id = $2", [phone, current.id]);
    return NextResponse.json({ ok: true, merged: false });
  }

  if (existing.id === current.id) {
    return NextResponse.json({ ok: true, merged: false }); // уже наш
  }

  // Номер принадлежит другому аккаунту → сливаем текущий в него и логинимся под ним
  await mergeUserInto(current.id, existing.id);
  await createSession(existing.id);
  return NextResponse.json({ ok: true, merged: true });
}
