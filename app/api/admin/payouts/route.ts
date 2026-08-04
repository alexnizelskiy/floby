import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { EXECUTOR_SHARE_PERCENT } from "@/lib/executor";
import { getPayoutSummaries, recordPayout } from "@/lib/payouts";

export async function GET() {
  const user = await getCurrentUser();
  // Payouts are financial data — admin only.
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const payouts = await getPayoutSummaries();
  return NextResponse.json({ ok: true, payouts, sharePercent: EXECUTOR_SHARE_PERCENT });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as {
    executorId?: string;
    amount?: number;
    note?: string;
  };
  const executorId = (body.executorId ?? "").trim();
  const amount = Math.round(Number(body.amount ?? 0));
  if (!executorId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });
  }

  await recordPayout(executorId, amount, (body.note ?? "").slice(0, 200).trim() || null, user!.id);
  return NextResponse.json({ ok: true });
}
