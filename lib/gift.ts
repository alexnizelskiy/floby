import { query, queryOne } from "@/lib/db";
import { newId } from "@/lib/auth";
import { creditBonus } from "@/lib/bonus";

export const GIFT_PRESETS = [2000, 3000, 5000];
export const GIFT_MIN = 1000;
export const GIFT_MAX = 50000;

function genCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () => Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `FLOBY-${part()}-${part()}`;
}

export interface Certificate {
  id: string;
  code: string;
  amount: number;
  status: string;
}

export async function createCertificate(opts: {
  buyerId: string;
  buyerName?: string;
  amount: number;
  message?: string;
}): Promise<Certificate> {
  const amount = Math.max(GIFT_MIN, Math.min(GIFT_MAX, Math.round(opts.amount)));
  // retry on the (astronomically unlikely) code collision
  for (let i = 0; i < 5; i++) {
    const id = newId();
    const code = genCode();
    try {
      await query(
        "INSERT INTO gift_certificates (id, code, amount, status, buyer_id, buyer_name, message) VALUES ($1, $2, $3, 'pending', $4, $5, $6)",
        [id, code, amount, opts.buyerId, opts.buyerName ?? null, opts.message ?? null]
      );
      return { id, code, amount, status: "pending" };
    } catch {
      /* code collision — retry */
    }
  }
  throw new Error("gift_create_failed");
}

export async function activateCertificate(id: string): Promise<void> {
  await query("UPDATE gift_certificates SET status = 'active' WHERE id = $1 AND status = 'pending'", [id]);
}

export async function setCertificatePayment(id: string, paymentId: string): Promise<void> {
  await query("UPDATE gift_certificates SET payment_id = $1 WHERE id = $2", [paymentId, id]);
}

export type RedeemResult =
  | { ok: true; amount: number }
  | { ok: false; error: "not_found" | "not_active" | "own" };

export async function redeemCertificate(code: string, userId: string): Promise<RedeemResult> {
  const cert = await queryOne<{ id: string; amount: number; status: string; buyer_id: string | null }>(
    "SELECT id, amount, status, buyer_id FROM gift_certificates WHERE code = $1",
    [code.trim().toUpperCase()]
  );
  if (!cert) return { ok: false, error: "not_found" };
  if (cert.status !== "active") return { ok: false, error: "not_active" };

  // atomically claim the certificate (guards against double-redeem)
  const rows = await query<{ id: string }>(
    "UPDATE gift_certificates SET status = 'redeemed', redeemed_by = $1, redeemed_at = now() WHERE id = $2 AND status = 'active' RETURNING id",
    [userId, cert.id]
  );
  if (rows.length === 0) return { ok: false, error: "not_active" };

  await creditBonus(userId, cert.amount, "Подарочный сертификат", cert.id);
  return { ok: true, amount: cert.amount };
}
