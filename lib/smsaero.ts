/**
 * SMS Aero — отправка SMS. Знак отправителя «SMS Aero» доступен без подтверждения
 * компании (подходит самозанятому). Авторизация: Basic (email:apiKey).
 * Env: SMSAERO_EMAIL, SMSAERO_API_KEY, опц. SMSAERO_SIGN (по умолчанию «SMS Aero»).
 */
export async function sendSmsAero(phone: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const email = process.env.SMSAERO_EMAIL;
  const apiKey = process.env.SMSAERO_API_KEY;
  if (!email || !apiKey) return { ok: false, error: "not_configured" };

  const sign = process.env.SMSAERO_SIGN || "SMS Aero";
  const params = new URLSearchParams({ number: phone.replace(/\D/g, ""), text, sign });
  const auth = "Basic " + Buffer.from(`${email}:${apiKey}`).toString("base64");

  try {
    const res = await fetch(`https://gate.smsaero.ru/v2/sms/send?${params.toString()}`, {
      headers: { Authorization: auth },
    });
    const data = (await res.json()) as { success?: boolean; message?: string };
    if (data.success) return { ok: true };
    return { ok: false, error: data.message ?? "failed" };
  } catch {
    return { ok: false, error: "request_failed" };
  }
}
