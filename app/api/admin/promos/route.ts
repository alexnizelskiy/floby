import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser, isStaff, newId } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const promos = await query(
    "SELECT id, code, discount_type, value, active, max_uses, used_count, min_order, expires_at, created_at FROM promo_codes ORDER BY created_at DESC"
  );
  return NextResponse.json({ ok: true, promos });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const b = (await request.json().catch(() => ({}))) as {
    code?: string; discountType?: string; value?: number;
    maxUses?: number; minOrder?: number; expiresAt?: string | null;
  };
  const code = (b.code ?? "").trim().toUpperCase();
  const type = b.discountType === "fixed" ? "fixed" : "percent";
  const value = Math.max(0, Math.floor(Number(b.value ?? 0)));
  if (!code || !/^[A-Z0-9]{3,20}$/.test(code) || value <= 0) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });
  }
  if (type === "percent" && value > 100) {
    return NextResponse.json({ ok: false, error: "percent_gt_100" }, { status: 422 });
  }

  try {
    await query(
      `INSERT INTO promo_codes (id, code, discount_type, value, max_uses, min_order, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        newId(), code, type, value,
        Math.max(0, Math.floor(Number(b.maxUses ?? 0))),
        Math.max(0, Math.floor(Number(b.minOrder ?? 0))),
        b.expiresAt || null,
      ]
    );
  } catch {
    return NextResponse.json({ ok: false, error: "duplicate" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
