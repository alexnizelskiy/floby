import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getAdminAnalytics } from "@/lib/analytics";

export async function GET() {
  const user = await getCurrentUser();
  // Financial analytics — admin only (managers don't see finances).
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const analytics = await getAdminAnalytics();
  return NextResponse.json({ ok: true, analytics });
}
