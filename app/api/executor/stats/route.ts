import { NextResponse } from "next/server";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getExecutorStats } from "@/lib/executor";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  // клинеры и другой персонал видят свою статистику
  if (user.role !== "executor" && !isStaff(user)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const stats = await getExecutorStats(user.id);
  return NextResponse.json({ ok: true, stats });
}
