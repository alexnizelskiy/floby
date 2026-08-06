"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { windowOptions, saveWindowDraft, type WindowOption } from "@/lib/windows";
import { useRoleFlags } from "@/components/auth/auth-provider";
import { StaffPanelCard } from "@/components/auth/staff-panel-card";

/**
 * Window-cleaning hero form: pick «только окна / + N балконов» (flat price),
 * then «Рассчитать стоимость» → /booking/windows (auth gate for guests).
 */
export function WindowOrderForm({ className }: { className?: string }) {
  const router = useRouter();
  const { canOrder } = useRoleFlags();
  const [option, setOption] = React.useState<WindowOption>("only");

  if (!canOrder) {
    return (
      <div className={cn("w-full max-w-md", className)}>
        <StaffPanelCard />
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    saveWindowDraft({ option });
    router.push("/booking/windows");
  }

  return (
    <form onSubmit={submit} className={cn("w-full", className)}>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {windowOptions.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setOption(o.id)}
            aria-pressed={option === o.id}
            className={cn(
              "flex h-[56px] items-center gap-2.5 rounded-2xl border bg-white px-4 text-left text-sm font-medium transition-colors",
              option === o.id ? "border-brand-500" : "border-border hover:border-brand-300"
            )}
          >
            <span
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                option === o.id ? "border-brand-500" : "border-input"
              )}
            >
              {option === o.id && <span className="size-2.5 rounded-full bg-brand-500" />}
            </span>
            {o.label}
          </button>
        ))}
      </div>

      <button
        type="submit"
        className="mt-2.5 flex h-[56px] w-full items-center justify-center rounded-2xl bg-brand-500 px-6 text-base font-medium text-white transition-colors hover:bg-brand-600"
      >
        Рассчитать стоимость
      </button>
    </form>
  );
}
