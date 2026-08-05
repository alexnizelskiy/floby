"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  saveCalcDraft,
  defaultCalcState,
  calcCleaningTypes,
  type CalcCleaningType,
} from "@/lib/calc";
import { IncludedModal } from "@/features/calculator/included-modal";
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
 * variant "row" lays out rooms/type/button in one line (hero); "stack" stacks
 * them (narrow service card).
 */
export function HeroCalcForm({
  presetType,
  variant = "stack",
  className,
}: {
  presetType?: CalcCleaningType;
  variant?: "row" | "stack";
  className?: string;
}) {
  const router = useRouter();
  const { canOrder } = useRoleFlags();
  const [rooms, setRooms] = React.useState(1);
  const [type, setType] = React.useState<CalcCleaningType>(presetType ?? "regular");
  const [includedOpen, setIncludedOpen] = React.useState(false);

  const typeIndex = calcCleaningTypes.findIndex((t) => t.id === type);
  const cycle = (dir: number) => {
    const next = (typeIndex + dir + calcCleaningTypes.length) % calcCleaningTypes.length;
    setType(calcCleaningTypes[next].id);
  };

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

  const typeSlider = (
    <div className="flex h-[52px] items-center rounded-full border border-border bg-white">
      <button
        type="button"
        aria-label="Предыдущий тип"
        onClick={() => cycle(-1)}
        className="grid h-full w-[52px] shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-5" />
      </button>
      <span className="flex flex-1 items-center justify-center gap-2 px-1 text-center text-base font-medium">
        {calcCleaningTypes[typeIndex]?.label}
        <button
          type="button"
          aria-label="Что входит в уборку"
          onClick={() => setIncludedOpen(true)}
          className="shrink-0 text-muted-foreground hover:text-primary"
        >
          <Info className="size-4" />
        </button>
      </span>
      <button
        type="button"
        aria-label="Следующий тип"
        onClick={() => cycle(1)}
        className="grid h-full w-[52px] shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );

  const submitBtn = (
    <button
      type="submit"
      className="flex h-[52px] items-center justify-center rounded-full bg-brand-500 px-6 text-base font-medium text-white transition-colors hover:bg-brand-600"
    >
      Рассчитать стоимость
    </button>
  );

  return (
    <>
      <form onSubmit={submit} className={cn("w-full", className)}>
        {variant === "row" ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <Stepper label={`${rooms}-комнатная`} value={rooms} onChange={setRooms} max={6} />
            {typeSlider}
            {submitBtn}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <Stepper label={`${rooms}-комнатная`} value={rooms} onChange={setRooms} max={6} />
            {typeSlider}
            {submitBtn}
          </div>
        )}
      </form>

      <IncludedModal open={includedOpen} onClose={() => setIncludedOpen(false)} activeType={type} />
    </>
  );
}
