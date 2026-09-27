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
    const res = await fetch(`https://zvonok.com/manager/cabapi_external/api/v1/phones/flashcall/?${params.toString()}`);
    const raw = (await res.json()) as Record<string, unknown>;
    // Логируем сырой ответ (виден в Vercel Function Logs) — для отладки формата.
    console.info("[floby][zvonok] response:", JSON.stringify(raw));

    if (raw.status === "ok") {
      const pin = extractPincode(raw);
      if (pin) return { ok: true, pincode: pin };
      return { ok: false, error: "no_pincode" };
    }
    const d = raw.data;
    return { ok: false, error: typeof d === "string" ? d : "call_failed" };
  } catch {
    return { ok: false, error: "request_failed" };
  }
}

/** Ищем pincode в разных возможных местах ответа Zvonok. */
function extractPincode(raw: Record<string, unknown>): string | null {
  const candidates: unknown[] = [];
  const push = (o: unknown) => {
    if (o && typeof o === "object") {
      const r = o as Record<string, unknown>;
      candidates.push(r.pincode, r.pin, r.code, r.flashcall_pincode);
    }
  };
  push(raw);
  push(raw.data);
  if (raw.data && typeof raw.data === "object") push((raw.data as Record<string, unknown>).call);
  for (const c of candidates) {
    if (c !== undefined && c !== null && String(c).length > 0) return String(c);
  }
  return null;
}
