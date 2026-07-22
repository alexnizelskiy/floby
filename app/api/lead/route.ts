import { NextResponse } from "next/server";
import { leadPayloadSchema } from "@/features/lead-form/schema";
import { deliverLead } from "@/services/leads";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = leadPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_error", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  try {
    await deliverLead(parsed.data);
  } catch (err) {
    console.error("[floby] lead delivery failed:", err);
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
