/**
 * SMS via SMSC.ru. Reads SMSC_LOGIN / SMSC_PASSWORD from env.
 * In dev (no creds) it logs to the server console and reports "dev" mode,
 * so the OTP flow is testable without a real SMS account.
 */

export interface SmsResult {
  ok: boolean;
  dev: boolean;
  error?: string;
}

export async function sendSms(phone: string, text: string): Promise<SmsResult> {
  const login = process.env.SMSC_LOGIN;
  const password = process.env.SMSC_PASSWORD;

  if (!login || !password) {
    // Dev fallback — no real SMS sent
    console.info(`[floby][sms:dev] -> ${phone}: ${text}`);
    return { ok: true, dev: true };
  }

  const params = new URLSearchParams({
    login,
    psw: password,
    phones: phone,
    mes: text,
    fmt: "3", // JSON response
    charset: "utf-8",
    sender: process.env.SMSC_SENDER ?? "",
  });

  try {
    const res = await fetch(`https://smsc.ru/sys/send.php?${params.toString()}`);
    const data = (await res.json()) as { id?: number; error?: string; error_code?: number };
    if (data.error) {
      console.error("[floby][sms] SMSC error:", data.error, data.error_code);
      return { ok: false, dev: false, error: data.error };
    }
    return { ok: true, dev: false };
  } catch (err) {
    console.error("[floby][sms] request failed:", err);
    return { ok: false, dev: false, error: "request_failed" };
  }
}
