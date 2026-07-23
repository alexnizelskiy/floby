import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validatePromo } from "@/lib/promo";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { code?: string; total?: number };
  const result = await validatePromo(body.code ?? "", Math.max(0, Number(body.total ?? 0)));
  return NextResponse.json(result);
}
