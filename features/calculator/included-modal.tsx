"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { roomChecklists } from "@/content/checklist";
import { calcCleaningTypes, type CalcCleaningType } from "@/lib/calc";

export function IncludedModal({
  open,
  onClose,
  activeType,
}: {
  open: boolean;
  onClose: () => void;
  activeType: CalcCleaningType;
}) {
  const [zone, setZone] = React.useState(roomChecklists[0]?.id ?? "rooms");
  const current = roomChecklists.find((z) => z.id === zone) ?? roomChecklists[0];

  return (
    <Modal open={open} onClose={onClose} title="Что входит в уборку" className="max-w-2xl">
      {/* Зоны */}
      <div className="mt-4 flex flex-wrap gap-2">
        {roomChecklists.map((z) => (
          <button
            key={z.id}
            type="button"
            onClick={() => setZone(z.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              zone === z.id ? "bg-ink-950 text-white" : "bg-surface-strong text-foreground hover:bg-border"
            )}
          >
            {z.label}
          </button>
        ))}
      </div>

      {/* Заголовки типов */}
      <div className="mt-6 grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border pb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Работы</span>
        <div className="flex gap-4 text-center text-xs font-semibold">
          {calcCleaningTypes.map((t) => (
            <span key={t.id} className={cn("w-20", t.id === activeType ? "text-primary" : "text-muted-foreground")}>
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* Список работ */}
      <div className="max-h-[50vh] overflow-y-auto">
        {current.included.map((item) => (
          <div key={item.title} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border py-3 last:border-0">
            <span className="text-sm">{item.title}</span>
            <div className="flex gap-4">
              {calcCleaningTypes.map((t) => (
                <span key={t.id} className="grid w-20 place-items-center">
                  <Check className={cn("size-4", t.id === activeType ? "text-brand-600" : "text-brand-400/70")} />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Генеральная уборка и уборка после ремонта включают все работы регулярной уборки и дополнительно —
        труднодоступные места, технику и следы ремонта.
      </p>
    </Modal>
  );
}
