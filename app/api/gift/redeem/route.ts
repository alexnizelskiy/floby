import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { redeemCertificate } from "@/lib/gift";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { code?: string };
  if (!body.code || body.code.trim().length < 6) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const result = await redeemCertificate(body.code, user.id);
  if (!result.ok) {
    const codeMap: Record<string, number> = { not_found: 404, not_active: 409, own: 409 };
    return NextResponse.json(result, { status: codeMap[result.error] ?? 400 });
  }
  return NextResponse.json(result);
}
