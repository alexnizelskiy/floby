"use client";

import * as React from "react";
import type { PricingOverride } from "@/lib/calc";

const PricingContext = React.createContext<PricingOverride>({});

/** Editable price overrides (from /api/pricing) for the calculator. */
export function usePricing(): PricingOverride {
  return React.useContext(PricingContext);
}

export function PricingProvider({ children }: { children: React.ReactNode }) {
  const [pricing, setPricing] = React.useState<PricingOverride>({});

  React.useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((d) => { if (d?.ok && d.pricing) setPricing(d.pricing); })
      .catch(() => {});
  }, []);

  return <PricingContext.Provider value={pricing}>{children}</PricingContext.Provider>;
}
