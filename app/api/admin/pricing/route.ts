import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getPricing, savePricing } from "@/lib/pricing";
import { defaultBase, calcAddons, calcCleaningTypes, roomTiers, ECO_PERCENT, type PricingOverride } from "@/lib/calc";

export async function GET() {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const override = await getPricing();
  return NextResponse.json({
    ok: true,
    override,
    defaults: {
      base: defaultBase,
      ecoPercent: ECO_PERCENT,
      types: calcCleaningTypes.map((t) => ({ id: t.id, label: t.label })),
      rooms: roomTiers.map((r) => ({ rooms: r.rooms, label: r.label, area: r.area })),
      addons: calcAddons
        .filter((a) => a.mode !== "percent")
        .map((a) => ({ id: a.id, title: a.title, unit: a.unit ?? "", price: a.price })),
    },
  });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as { pricing?: PricingOverride };
  const p = body.pricing ?? {};

  // sanitize — keep only positive integers
  const clean: PricingOverride = {};
  if (p.base) {
    clean.base = {};
    for (const [type, rooms] of Object.entries(p.base)) {
      const r: Record<number, number> = {};
      for (const [room, price] of Object.entries(rooms ?? {})) {
        const v = Math.round(Number(price));
        if (Number.isFinite(v) && v > 0) r[Number(room)] = v;
      }
      if (Object.keys(r).length) (clean.base as Record<string, Record<number, number>>)[type] = r;
    }
  }
  if (p.addons) {
    clean.addons = {};
    for (const [id, price] of Object.entries(p.addons)) {
      const v = Math.round(Number(price));
      if (Number.isFinite(v) && v >= 0) clean.addons[id] = v;
    }
  }
  if (p.ecoPercent !== undefined) {
    const v = Math.round(Number(p.ecoPercent));
    if (Number.isFinite(v) && v >= 0 && v <= 100) clean.ecoPercent = v;
  }

  await savePricing(clean);

  // Обновляем статические витрины, которые читают цены (калькулятор — клиентский, обновляется сам).
  revalidatePath("/");
  revalidatePath("/prices");

  return NextResponse.json({ ok: true });
}
