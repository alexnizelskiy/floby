"use client";

import * as React from "react";
import { Minus, Plus, ChevronLeft, ChevronRight, Info, HelpCircle } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import {
  roomTiers,
  calcCleaningTypes,
  calcAddons,
  propertyTypes,
  type CalcState,
  type CalcAddon,
} from "@/lib/calc";
import { IncludedModal } from "@/features/calculator/included-modal";

const VISIBLE_ADDONS = 9;

export function CalculatorControls({
  state,
  onChange,
}: {
  state: CalcState;
  onChange: (next: CalcState) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [includedOpen, setIncludedOpen] = React.useState(false);

  const setRooms = (rooms: number) => onChange({ ...state, rooms });
  const setProperty = (propertyType: CalcState["propertyType"]) => onChange({ ...state, propertyType });
  const setAddon = (id: string, qty: number) =>
    onChange({ ...state, addons: { ...state.addons, [id]: Math.max(0, qty) } });
  const clearAddons = () => onChange({ ...state, addons: {} });

  const typeIndex = calcCleaningTypes.findIndex((t) => t.id === state.cleaningType);
  const cycleType = (dir: 1 | -1) => {
    const next = (typeIndex + dir + calcCleaningTypes.length) % calcCleaningTypes.length;
    onChange({ ...state, cleaningType: calcCleaningTypes[next].id });
  };

  const addonsShown = expanded ? calcAddons : calcAddons.slice(0, VISIBLE_ADDONS);
  const hasAddons = Object.values(state.addons).some((q) => q > 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Тип помещения */}
      <div>
        <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Тип помещения
        </span>
        <div className="mt-4 inline-flex rounded-full border border-border bg-white p-1">
          {propertyTypes.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProperty(p.id)}
              aria-pressed={state.propertyType === p.id}
              className={cn(
                "rounded-full px-6 py-2 text-sm font-semibold transition-colors",
                state.propertyType === p.id ? "bg-ink-950 text-white" : "text-foreground hover:bg-surface"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Комнаты + тип уборки */}
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Количество комнат
            </span>
            <RoomsHint />
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {roomTiers.map((t) => (
              <button
                key={t.rooms}
                type="button"
                onClick={() => setRooms(t.rooms)}
                aria-pressed={state.rooms === t.rooms}
                className={cn(
                  "grid size-12 place-items-center rounded-full text-base font-semibold transition-colors",
                  state.rooms === t.rooms
                    ? "bg-ink-950 text-white"
                    : "bg-surface-strong text-foreground hover:bg-border"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Тип уборки
          </span>
          <div className="mt-4 flex items-center rounded-full border border-border bg-white">
            <button
              type="button"
              aria-label="Предыдущий тип"
              onClick={() => cycleType(-1)}
              className="grid size-12 place-items-center rounded-full text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-5" />
            </button>
            <span className="flex flex-1 items-center justify-center gap-2 text-base font-medium">
              {calcCleaningTypes[typeIndex]?.label}
              <button
                type="button"
                aria-label="Что входит в уборку"
                onClick={() => setIncludedOpen(true)}
                className="text-muted-foreground hover:text-primary"
              >
                <Info className="size-4" />
              </button>
            </span>
            <button
              type="button"
              aria-label="Следующий тип"
              onClick={() => cycleType(1)}
              className="grid size-12 place-items-center rounded-full text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Доп. услуги */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Дополнительные услуги
          </span>
          {hasAddons && (
            <button
              type="button"
              onClick={clearAddons}
              className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground hover:bg-surface"
            >
              Очистить
            </button>
          )}
        </div>

        <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-white">
          {addonsShown.map((a) => (
            <AddonRow key={a.id} addon={a} qty={state.addons[a.id] ?? 0} onQty={(q) => setAddon(a.id, q)} />
          ))}
        </div>

        {calcAddons.length > VISIBLE_ADDONS && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 w-full rounded-full bg-surface-strong py-3 text-sm font-semibold text-foreground transition-colors hover:bg-border"
          >
            {expanded ? "Свернуть" : "Показать ещё опции"}
          </button>
        )}
      </div>

      <IncludedModal
        open={includedOpen}
        onClose={() => setIncludedOpen(false)}
        activeType={state.cleaningType}
      />
    </div>
  );
}

function AddonRow({
  addon,
  qty,
  onQty,
}: {
  addon: CalcAddon;
  qty: number;
  onQty: (q: number) => void;
}) {
  const active = qty > 0;
  const priceLabel = addon.mode === "percent"
    ? "+40 % к стоимости"
    : `${addon.from ? "от " : ""}${formatPrice(addon.price)}${addon.unit ? ` / ${addon.unit}` : ""}`;

  return (
    <div className={cn("flex items-center gap-3 px-4 py-3.5 transition-colors sm:px-5", active && "bg-brand-50")}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{addon.title}</p>
        <p className="text-xs text-muted-foreground">{priceLabel}</p>
      </div>

      {addon.mode === "qty" ? (
        <Stepper qty={qty} onQty={onQty} max={addon.max ?? 20} active={active} />
      ) : active ? (
        <button
          type="button"
          onClick={() => onQty(0)}
          className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Убрать
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onQty(1)}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
        >
          Добавить
        </button>
      )}

      {addon.hint && (
        <span className="group relative hidden sm:block">
          <HelpCircle className="size-4 shrink-0 text-muted-foreground" />
          <span className="pointer-events-none absolute right-0 top-6 z-10 hidden w-56 rounded-xl bg-ink-950 px-3 py-2 text-xs leading-snug text-white group-hover:block">
            {addon.hint}
          </span>
        </span>
      )}
    </div>
  );
}

function Stepper({ qty, onQty, max, active }: { qty: number; onQty: (q: number) => void; max: number; active: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Уменьшить"
        onClick={() => onQty(qty - 1)}
        disabled={qty <= 0}
        className={cn(
          "grid size-8 place-items-center rounded-full transition-colors disabled:opacity-30",
          active ? "bg-brand-500 text-white hover:bg-brand-600" : "bg-surface-strong text-foreground hover:bg-border"
        )}
      >
        <Minus className="size-4" />
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
      <button
        type="button"
        aria-label="Увеличить"
        onClick={() => onQty(Math.min(max, qty + 1))}
        disabled={qty >= max}
        className={cn(
          "grid size-8 place-items-center rounded-full transition-colors disabled:opacity-30",
          active ? "bg-brand-500 text-white hover:bg-brand-600" : "bg-surface-strong text-foreground hover:bg-border"
        )}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function RoomsHint() {
  return (
    <span className="group relative">
      <HelpCircle className="size-4 cursor-help text-muted-foreground" />
      <span className="pointer-events-none absolute left-0 top-6 z-10 hidden w-60 flex-col gap-1 rounded-xl bg-ink-950 px-4 py-3 text-xs text-white group-hover:flex">
        {roomTiers.map((t) => (
          <span key={t.rooms} className="flex justify-between gap-4">
            <span>{t.label} комн.</span>
            <span className="text-white/70">{t.area}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
