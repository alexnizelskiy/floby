import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getExecutorReviews } from "@/lib/reviews";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const reviews = await getExecutorReviews(user.id, 20);
  return NextResponse.json({ ok: true, reviews });
}
