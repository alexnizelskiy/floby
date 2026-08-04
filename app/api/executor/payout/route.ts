import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { getExecutorPayoutState } from "@/lib/payouts";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const state = await getExecutorPayoutState(user.id);
  const req = await queryOne<{ payout_details: string | null; inn: string | null }>(
    "SELECT payout_details, inn FROM users WHERE id = $1",
    [user.id]
  );
  return NextResponse.json({
    ok: true,
    ...state,
    payoutDetails: req?.payout_details ?? null,
    inn: req?.inn ?? null,
  });
}
