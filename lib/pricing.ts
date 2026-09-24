/**
 * Editable pricing — overrides on top of the calculator defaults (lib/calc.ts).
 * Empty override = default calculator prices (the reference). Managers edit it
 * in the admin panel; the calculator, service cards and /prices read it.
 *
 * Server-only.
 */
import { cache } from "react";
import { query, queryOne } from "@/lib/db";
import type { PricingOverride } from "@/lib/calc";

async function readPricing(): Promise<PricingOverride> {
  try {
    const row = await queryOne<{ data: unknown }>("SELECT data FROM pricing WHERE id = 'current'");
    if (!row?.data) return {};
    return (typeof row.data === "string" ? JSON.parse(row.data) : row.data) as PricingOverride;
  } catch {
    return {};
  }
}

/** Cached per request (React cache) — always fresh across deploys/edits. */
export const getPricing = cache(readPricing);

export async function savePricing(override: PricingOverride): Promise<void> {
  await query(
    `INSERT INTO pricing (id, data) VALUES ('current', $1)
     ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = now()`,
    [JSON.stringify(override)]
  );
}
