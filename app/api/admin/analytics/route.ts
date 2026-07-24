import { NextResponse } from "next/server";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getAdminAnalytics } from "@/lib/analytics";

export async function GET() {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const analytics = await getAdminAnalytics();
  return NextResponse.json({ ok: true, analytics });
}
