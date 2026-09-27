/**
 * Telegram Gateway — доставка кодов подтверждения через Telegram по номеру.
 * Официальный сервис (gatewayapi.telegram.org), не требует договора с операторами,
 * подходит самозанятому. Доходит только тем, у кого есть Telegram на этом номере.
 * Токен — из аккаунта на gateway.telegram.org (TELEGRAM_GATEWAY_TOKEN).
 */
export async function sendTelegramGatewayCode(
  phone: string,
  code: string
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_GATEWAY_TOKEN;
  if (!token) return { ok: false, error: "no_token" };
  try {
    const res = await fetch("https://gatewayapi.telegram.org/sendVerificationMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ phone_number: phone, code, ttl: 300 }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (data.ok) return { ok: true };
    return { ok: false, error: data.error ?? "failed" };
  } catch {
    return { ok: false, error: "request_failed" };
  }
}
