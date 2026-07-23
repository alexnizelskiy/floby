import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getBalance, getLedger, ensureRefCode, WELCOME_BONUS, REFERRER_BONUS, MAX_BONUS_PERCENT } from "@/lib/bonus";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const [balance, refCode, ledger] = await Promise.all([
    getBalance(user.id),
    ensureRefCode(user.id),
    getLedger(user.id),
  ]);

  return NextResponse.json({
    ok: true,
    balance,
    refCode,
    ledger,
    rules: { welcome: WELCOME_BONUS, referrer: REFERRER_BONUS, maxPercent: MAX_BONUS_PERCENT },
  });
}
