import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { normalizePhone, hashCode, newId } from "@/lib/auth";
import { sendSms } from "@/lib/sms";

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { phone?: string };
  const phone = normalizePhone(body.phone ?? "");
  if (!phone) {
    return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 422 });
  }

  // Cooldown: block rapid re-requests
  const recent = await queryOne<{ created_at: string }>(
    "SELECT created_at FROM otp_codes WHERE phone = $1 ORDER BY created_at DESC LIMIT 1",
    [phone]
  );
  if (recent && Date.now() - new Date(recent.created_at).getTime() < RESEND_COOLDOWN_MS) {
    return NextResponse.json({ ok: false, error: "too_soon" }, { status: 429 });
  }

  const code = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit
  const expires = new Date(Date.now() + OTP_TTL_MS).toISOString();

  await query("DELETE FROM otp_codes WHERE phone = $1", [phone]);
  await query(
    "INSERT INTO otp_codes (id, phone, code_hash, expires_at) VALUES ($1, $2, $3, $4)",
    [newId(), phone, hashCode(phone, code), expires]
  );

  const sms = await sendSms(phone, `Ваш код для входа в floby: ${code}`);

  // Only leak the code outside production (local testing). In production the
  // code is never returned — SMSC must be configured for login to work.
  const leak = sms.dev && process.env.NODE_ENV !== "production";
  return NextResponse.json({ ok: true, dev: leak, ...(leak ? { devCode: code } : {}) });
}
