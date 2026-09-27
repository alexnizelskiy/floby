/**
 * Telegram Gateway — доставка кодов подтверждения через Telegram по номеру.
 * Официальный сервис (gatewayapi.telegram.org), не требует договора с операторами.
 * Сначала checkSendAbility — шлём код ТОЛЬКО если у номера есть Telegram, иначе
 * возвращаем ошибку, и вызывающий код перейдёт к звонку/SMS.
 * Токен — из аккаунта на gateway.telegram.org (TELEGRAM_GATEWAY_TOKEN).
 */
export async function sendTelegramGatewayCode(
  phone: string,
  code: string
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_GATEWAY_TOKEN;
  if (!token) return { ok: false, error: "no_token" };
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  try {
    // 1) Проверяем, можно ли доставить в Telegram на этот номер.
    const ability = (await fetch("https://gatewayapi.telegram.org/checkSendAbility", {
      method: "POST",
      headers,
      body: JSON.stringify({ phone_number: phone }),
    }).then((r) => r.json())) as { ok?: boolean; result?: { request_id?: string }; error?: string };

    const requestId = ability.result?.request_id;
    if (!ability.ok || !requestId) return { ok: false, error: ability.error ?? "not_deliverable" };

    // 2) Отправляем код, привязав к request_id из проверки.
    const sent = (await fetch("https://gatewayapi.telegram.org/sendVerificationMessage", {
      method: "POST",
      headers,
      body: JSON.stringify({ phone_number: phone, request_id: requestId, code, ttl: 300 }),
    }).then((r) => r.json())) as { ok?: boolean; error?: string };

    if (sent.ok) return { ok: true };
    return { ok: false, error: sent.error ?? "send_failed" };
  } catch {
    return { ok: false, error: "request_failed" };
  }
}
