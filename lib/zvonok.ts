/**
 * Zvonok.com — подтверждение номера звонком (flash-call).
 * Робот звонит клиенту, и код — это последние цифры номера, с которого поступил
 * звонок (клиент их вводит, отвечать не нужно). Дёшево и не требует ИП/договора.
 *
 * Нужно в кабинете zvonok.com создать кампанию типа Flash Call и взять её id +
 * public_key. Код (pincode) задаёт сам сервис и возвращает в ответе.
 */
export async function sendZvonokFlashCall(
  phone: string
): Promise<{ ok: boolean; pincode?: string; error?: string }> {
  const publicKey = process.env.ZVONOK_PUBLIC_KEY;
  const campaignId = process.env.ZVONOK_CAMPAIGN_ID;
  if (!publicKey || !campaignId) return { ok: false, error: "not_configured" };

  const params = new URLSearchParams({
    public_key: publicKey,
    campaign_id: campaignId,
    phone: phone.replace(/\D/g, ""), // 7XXXXXXXXXX
  });

  try {
    const res = await fetch(`https://zvonok.com/manager/cabapi_external/api/v1/phones/call/?${params.toString()}`);
    const data = (await res.json()) as { status?: string; data?: unknown };
    if (data.status === "ok") {
      const d = (data.data ?? {}) as Record<string, unknown>;
      const pin = d.pincode ?? d.pin ?? d.code;
      if (pin) return { ok: true, pincode: String(pin) };
      return { ok: false, error: "no_pincode" };
    }
    return { ok: false, error: typeof data.data === "string" ? data.data : "call_failed" };
  } catch {
    return { ok: false, error: "request_failed" };
  }
}
