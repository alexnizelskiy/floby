import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { normalizePhone, hashCode, newId } from "@/lib/auth";
import { sendVerificationCode } from "@/lib/otp";

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

// ВРЕМЕННАЯ диагностика. ?call=1 дёргает Zvonok на фикс. номер и отдаёт сырой ответ.
export async function GET(request: Request) {
  const base = {
    zvonok: !!(process.env.ZVONOK_PUBLIC_KEY && process.env.ZVONOK_CAMPAIGN_ID),
    telegramGateway: !!process.env.TELEGRAM_GATEWAY_TOKEN,
    sms: !!(process.env.SMSC_LOGIN && process.env.SMSC_PASSWORD),
    zvonokCampaign: process.env.ZVONOK_CAMPAIGN_ID ?? null,
  };

  const doCall = new URL(request.url).searchParams.get("call") === "1";
  if (doCall && process.env.ZVONOK_PUBLIC_KEY && process.env.ZVONOK_CAMPAIGN_ID) {
    const params = new URLSearchParams({
      public_key: process.env.ZVONOK_PUBLIC_KEY,
      campaign_id: process.env.ZVONOK_CAMPAIGN_ID,
      phone: "79888937288", // номер владельца (для теста)
    });
    try {
      const res = await fetch(`https://zvonok.com/manager/cabapi_external/api/v1/phones/flashcall/?${params.toString()}`);
      const raw = await res.json();
      return NextResponse.json({ ...base, httpStatus: res.status, zvonokRaw: raw });
    } catch (e) {
      return NextResponse.json({ ...base, zvonokError: String(e) });
    }
  }
  return NextResponse.json(base);
}

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

  const candidate = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit

  // Сначала отправляем/звоним: при flash-call код задаёт сам сервис, поэтому
  // сохраняем ФАКТИЧЕСКИЙ код из ответа, а не сгенерированный.
  const sent = await sendVerificationCode(phone, candidate);
  if (!sent.ok) {
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  const expires = new Date(Date.now() + OTP_TTL_MS).toISOString();
  await query("DELETE FROM otp_codes WHERE phone = $1", [phone]);
  await query(
    "INSERT INTO otp_codes (id, phone, code_hash, expires_at) VALUES ($1, $2, $3, $4)",
    [newId(), phone, hashCode(phone, sent.code), expires]
  );

  // Код показываем только вне production (локальная разработка), когда канал не настроен.
  const leak = sent.channel === "dev" && process.env.NODE_ENV !== "production";
  return NextResponse.json({
    ok: true,
    channel: sent.channel, // "call" | "telegram" | "sms" | "dev" — подсказка в интерфейсе
    dev: leak,
    ...(leak ? { devCode: sent.code } : {}),
  });
}
