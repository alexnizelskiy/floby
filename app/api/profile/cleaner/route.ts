import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPreferredExecutor } from "@/lib/preferred";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const cleaner = await getPreferredExecutor(user.id);
  return NextResponse.json({ ok: true, cleaner });
}
