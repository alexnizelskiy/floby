import { queryOne, query } from "@/lib/db";

export interface PromoResult {
  ok: boolean;
  error?: string;
  code?: string;
  discount?: number;
  discountType?: "percent" | "fixed";
  value?: number;
}

interface PromoRow {
  code: string;
  discount_type: "percent" | "fixed";
  value: number;
  active: boolean;
  max_uses: number;
  used_count: number;
  min_order: number;
  expires_at: string | null;
}

/** Validate a promo code against an order total. Does not consume it. */
export async function validatePromo(codeInput: string, total: number): Promise<PromoResult> {
  const code = codeInput.trim().toUpperCase();
  if (!code) return { ok: false, error: "empty" };

  const p = await queryOne<PromoRow>(
    "SELECT code, discount_type, value, active, max_uses, used_count, min_order, expires_at FROM promo_codes WHERE code = $1",
    [code]
  );
  if (!p || !p.active) return { ok: false, error: "not_found" };
  if (p.expires_at && new Date(p.expires_at).getTime() < Date.now()) return { ok: false, error: "expired" };
  if (p.max_uses > 0 && p.used_count >= p.max_uses) return { ok: false, error: "used_up" };
  if (total < p.min_order) return { ok: false, error: "min_order", value: p.min_order };

  const discount =
    p.discount_type === "percent"
      ? Math.floor((total * p.value) / 100)
      : Math.min(p.value, total);

  return { ok: true, code: p.code, discount, discountType: p.discount_type, value: p.value };
}

/** Increment usage after a booking with this promo is created. */
export async function consumePromo(code: string): Promise<void> {
  await query("UPDATE promo_codes SET used_count = used_count + 1 WHERE code = $1", [
    code.trim().toUpperCase(),
  ]);
}
