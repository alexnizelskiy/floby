/**
 * ЮKassa (YooKassa) integration.
 * Reads YOOKASSA_SHOP_ID / YOOKASSA_SECRET_KEY from env.
 * Without creds → returns null (caller falls back to a simulated test payment),
 * so the checkout flow is testable before the merchant account is connected.
 *
 * Card data is never handled by us — the user pays on ЮKassa's hosted page.
 */
import { randomUUID } from "node:crypto";

const API = "https://api.yookassa.ru/v3";

function auth(): string | null {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secret = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secret) return null;
  return "Basic " + Buffer.from(`${shopId}:${secret}`).toString("base64");
}

export interface CreatedPayment {
  id: string;
  confirmationUrl: string;
}

/** Create a redirect payment. Returns null when creds are absent (test mode). */
export async function createPayment(opts: {
  amount: number;
  description: string;
  bookingId: string;
  returnUrl: string;
}): Promise<CreatedPayment | null> {
  const authHeader = auth();
  if (!authHeader) return null;

  const res = await fetch(`${API}/payments`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Idempotence-Key": randomUUID(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: { value: opts.amount.toFixed(2), currency: "RUB" },
      capture: true,
      confirmation: { type: "redirect", return_url: opts.returnUrl },
      description: opts.description,
      metadata: { booking_id: opts.bookingId },
    }),
  });

  if (!res.ok) {
    console.error("[floby][yookassa] create failed:", res.status, await res.text());
    throw new Error("yookassa_create_failed");
  }
  const data = (await res.json()) as {
    id: string;
    confirmation?: { confirmation_url?: string };
  };
  return { id: data.id, confirmationUrl: data.confirmation?.confirmation_url ?? opts.returnUrl };
}

/** Fetch a payment (to verify status from a webhook). */
export async function getPayment(
  id: string
): Promise<{ id: string; status: string; metadata?: { booking_id?: string } } | null> {
  const authHeader = auth();
  if (!authHeader) return null;
  const res = await fetch(`${API}/payments/${id}`, { headers: { Authorization: authHeader } });
  if (!res.ok) return null;
  return res.json();
}

export function isConfigured(): boolean {
  return auth() !== null;
}
