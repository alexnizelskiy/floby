"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import {
  WINDOW_DEFAULT_SASHES,
  WINDOW_MIN_SASHES,
  WINDOW_MAX_SASHES,
  clampSashes,
  windowPrice,
  windowLabel,
  saveWindowDraft,
} from "@/lib/windows";
import { usePricing } from "@/components/pricing/pricing-provider";
import { useRoleFlags } from "@/components/auth/auth-provider";
import { StaffPanelCard } from "@/components/auth/staff-panel-card";

/**
 * Window-cleaning hero form: pick the number of створок (цена за створку),
 * then «Рассчитать стоимость» → /booking/windows (auth gate for guests).
 */
export function WindowOrderForm({ className }: { className?: string }) {
  const router = useRouter();
  const { canOrder } = useRoleFlags();
  const pricing = usePricing();
  const [sashes, setSashes] = React.useState(WINDOW_DEFAULT_SASHES);

  if (!canOrder) {
    return (
      <div className={cn("w-full max-w-md", className)}>
        <StaffPanelCard />
      </div>
    );
  }

  const total = windowPrice(sashes, pricing);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    saveWindowDraft({ sashes });
    router.push("/booking/windows");
  }

  return (
    <form onSubmit={submit} className={cn("w-full", className)}>
      <div className="flex flex-col gap-2.5 rounded-2xl bg-white p-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5">
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Количество створок</p>
            <p className="text-xs text-muted-foreground">Стекло с двух сторон, рама и подоконник</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSashes((s) => clampSashes(s - 1))}
              disabled={sashes <= WINDOW_MIN_SASHES}
              aria-label="Меньше створок"
              className="grid size-9 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-brand-300 disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-6 text-center text-lg font-bold tabular-nums">{sashes}</span>
            <button
              type="button"
              onClick={() => setSashes((s) => clampSashes(s + 1))}
              disabled={sashes >= WINDOW_MAX_SASHES}
              aria-label="Больше створок"
              className="grid size-9 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-brand-300 disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-2.5 sm:flex-col sm:items-end sm:justify-center sm:border-0 sm:px-2 sm:py-0">
          <span className="text-sm text-muted-foreground sm:hidden">Стоимость</span>
          <span className="text-2xl font-bold text-foreground">{formatPrice(total)}</span>
        </div>
      </div>

      <button
        type="submit"
        className="mt-2.5 flex h-[56px] w-full items-center justify-center rounded-2xl bg-brand-500 px-6 text-base font-medium text-white transition-colors hover:bg-brand-600"
      >
        Рассчитать стоимость · {windowLabel(sashes)}
      </button>
    </form>
  );
}
