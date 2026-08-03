"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useRoleFlags } from "@/components/auth/auth-provider";
import {
  getCalcDraft,
  saveCalcDraft,
  defaultCalcState,
  type CalcCleaningType,
} from "@/lib/calc";

const SERVICE_TO_TYPE: Record<string, CalcCleaningType> = {
  "regular-cleaning": "regular",
  "deep-cleaning": "general",
  "post-renovation": "post_renovation",
};

interface OrderButtonProps extends ButtonProps {
  label?: string;
  /** Optional service slug to preselect the cleaning type. */
  defaultService?: string;
}

/**
 * Primary «Заказать» CTA. Instead of opening a lead-form modal, it takes the
 * user to the booking step with the live calculator (via auth if needed).
 * Any in-progress calculator draft is preserved.
 */
export function OrderButton({ label = "Заказать уборку", defaultService, children, ...buttonProps }: OrderButtonProps) {
  const router = useRouter();
  const { canOrder, dashboardPath } = useRoleFlags();

  function go() {
    // Staff / executors can't order — send them to their work panel instead.
    if (!canOrder) {
      if (dashboardPath) router.push(dashboardPath);
      return;
    }
    const type = defaultService ? SERVICE_TO_TYPE[defaultService] : undefined;
    const existing = getCalcDraft();
    if (!existing && type) {
      saveCalcDraft({ ...defaultCalcState, cleaningType: type });
    } else if (existing && type) {
      saveCalcDraft({ ...existing, cleaningType: type });
    }
    router.push("/booking");
  }

  return (
    <Button onClick={go} {...buttonProps}>
      {!canOrder ? "Перейти в панель" : children ?? label}
    </Button>
  );
}
