"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  saveCalcDraft,
  defaultCalcState,
  calcCleaningTypes,
  type CalcCleaningType,
} from "@/lib/calc";
import { useRoleFlags } from "@/components/auth/auth-provider";
import { StaffPanelCard } from "@/components/auth/staff-panel-card";

function Stepper({
  label,
  value,
  onChange,
  min = 1,
  max = 6,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex h-[52px] items-center justify-between rounded-full border border-border bg-white">
      <button
        type="button"
        aria-label="Уменьшить"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="grid h-full w-[52px] place-items-center rounded-full text-foreground transition-colors hover:bg-surface disabled:opacity-30"
      >
        <Minus className="size-4" />
      </button>
      <span className="whitespace-nowrap text-base font-medium text-foreground">{label}</span>
      <button
        type="button"
        aria-label="Увеличить"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="grid h-full w-[52px] place-items-center rounded-full text-foreground transition-colors hover:bg-surface disabled:opacity-30"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/**
 * Rooms + cleaning-type mini calculator used on the homepage hero and on the
 * cleaning-service pages. "Рассчитать стоимость" saves the draft and goes to
 * /booking, which authorizes guests (auth gate) before the order step.
 * `presetType` preselects the type on a specific service page.
 */
export function HeroCalcForm({
  presetType,
  className,
}: {
  presetType?: CalcCleaningType;
  className?: string;
}) {
  const router = useRouter();
  const { canOrder } = useRoleFlags();
  const [rooms, setRooms] = React.useState(1);
  const [type, setType] = React.useState<CalcCleaningType>(presetType ?? "regular");

  // Staff / executors don't order — show a link to their panel.
  if (!canOrder) {
    return (
      <div className={cn("w-full max-w-md", className)}>
        <StaffPanelCard />
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    saveCalcDraft({ ...defaultCalcState, rooms, cleaningType: type });
    router.push("/booking");
  }

  return (
    <form onSubmit={submit} className={cn("flex w-full flex-col gap-2.5", className)}>
      <Stepper label={`${rooms}-комнатная`} value={rooms} onChange={setRooms} max={6} />

      <div className="grid grid-cols-3 gap-2">
        {calcCleaningTypes.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setType(t.id)}
            aria-pressed={type === t.id}
            className={cn(
              "flex h-[52px] items-center justify-center rounded-full border px-2 text-center text-sm font-medium leading-tight transition-colors",
              type === t.id
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-border bg-white text-foreground hover:border-brand-300"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <button
        type="submit"
        className="flex h-[52px] items-center justify-center rounded-full bg-brand-500 px-6 text-base font-medium text-white transition-colors hover:bg-brand-600"
      >
        Рассчитать стоимость
      </button>
    </form>
  );
}
