import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser, newId } from "@/lib/auth";
import { getBalance, maxBonusForOrder, creditBonus } from "@/lib/bonus";
import { validatePromo, consumePromo } from "@/lib/promo";

interface BookingRow {
  id: string;
  data: unknown;
  status: string;
  total: number;
  paid: boolean;
  created_at: string;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const rows = await query<BookingRow>(
    "SELECT id, data, status, total, paid, created_at FROM bookings WHERE user_id = $1 ORDER BY created_at DESC",
    [user.id]
  );
  const bookings = rows.map((r) => ({
    ...(typeof r.data === "string" ? JSON.parse(r.data) : (r.data as object)),
    id: r.id,
    status: r.status,
    total: r.total,
    paid: r.paid,
    createdAt: r.created_at,
  }));
  return NextResponse.json({ ok: true, bookings });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { data?: Record<string, unknown>; total?: number; bonusUsed?: number; promoCode?: string }
    | null;
  if (!body || typeof body.data !== "object" || body.data === null) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 422 });
  }

  const gross = Math.max(0, Number(body.total ?? 0));

  // Promo code: validated server-side against the gross total
  let promoCode: string | null = null;
  let promoDiscount = 0;
  if (body.promoCode) {
    const pr = await validatePromo(body.promoCode, gross);
    if (pr.ok) {
      promoCode = pr.code!;
      promoDiscount = pr.discount!;
    }
  }
  const afterPromo = gross - promoDiscount;

  // Bonuses: capped at wallet balance and at MAX_BONUS_PERCENT of the discounted total
  let bonusUsed = Math.max(0, Math.floor(Number(body.bonusUsed ?? 0)));
  if (bonusUsed > 0) {
    const balance = await getBalance(user.id);
    bonusUsed = Math.min(bonusUsed, balance, maxBonusForOrder(afterPromo));
  }
  const payable = afterPromo - bonusUsed;

  const id = newId();
  await query(
    `INSERT INTO bookings (id, user_id, data, status, total, bonus_used, promo_code, promo_discount)
     VALUES ($1, $2, $3, 'searching', $4, $5, $6, $7)`,
    [id, user.id, JSON.stringify(body.data), payable, bonusUsed, promoCode, promoDiscount]
  );
  if (bonusUsed > 0) await creditBonus(user.id, -bonusUsed, "Оплата бонусами", id);
  if (promoCode) await consumePromo(promoCode);

  return NextResponse.json({ ok: true, id });
}
