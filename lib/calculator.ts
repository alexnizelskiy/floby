import {
  ratePerSqm,
  propertyMultiplier,
  calculatorBase,
  calculatorAddons,
  type CleaningType,
  type PropertyType,
} from "@/content/prices";

export interface CalcInput {
  property: PropertyType;
  cleaning: CleaningType;
  area: number;
  addons: string[];
}

export interface CalcResult {
  base: number;
  addonsTotal: number;
  total: number;
  duration: string;
}

/** Estimate cleaning price from calculator inputs. Deterministic, no I/O. */
export function estimatePrice({ property, cleaning, area, addons }: CalcInput): CalcResult {
  const safeArea = Math.max(20, Math.min(400, area || 0));
  const raw = safeArea * ratePerSqm[cleaning] * propertyMultiplier[property];
  const base = Math.max(calculatorBase, Math.round((raw + calculatorBase) / 100) * 100);

  const addonsTotal = calculatorAddons
    .filter((a) => addons.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  const total = base + addonsTotal;

  // rough duration estimate
  const hoursRate: Record<CleaningType, number> = {
    regular: 0.04,
    deep: 0.07,
    "post-renovation": 0.09,
  };
  const hours = Math.max(2, Math.round(safeArea * hoursRate[cleaning]));
  const duration = `≈ ${hours}–${hours + 1} ч`;

  return { base, addonsTotal, total, duration };
}
