"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
  propertyTypes,
  cleaningTypes,
  calculatorAddons,
  type PropertyType,
  type CleaningType,
} from "@/content/prices";
import { estimatePrice } from "@/lib/calculator";
import { getIcon } from "@/lib/icons";
import { formatPrice, cn } from "@/lib/utils";
import { OrderCta } from "@/components/forms/order-cta";

export function Calculator() {
  const [property, setProperty] = React.useState<PropertyType>("apartment");
  const [cleaning, setCleaning] = React.useState<CleaningType>("regular");
  const [area, setArea] = React.useState(45);
  const [addons, setAddons] = React.useState<string[]>([]);

  const result = React.useMemo(
    () => estimatePrice({ property, cleaning, area, addons }),
    [property, cleaning, area, addons]
  );

  const toggleAddon = (id: string) =>
    setAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      {/* Controls */}
      <div className="flex flex-col gap-7 rounded-3xl border border-border bg-card p-6 md:p-8">
        <Field label="Тип помещения">
          <div className="grid grid-cols-3 gap-2">
            {propertyTypes.map((p) => {
              const Icon = getIcon(p.icon);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProperty(p.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all",
                    property === p.id
                      ? "border-brand-400 bg-brand-50 text-brand-800"
                      : "border-border hover:border-brand-200"
                  )}
                >
                  <Icon className="size-5" />
                  {p.label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Тип уборки">
          <div className="grid gap-2 sm:grid-cols-3">
            {cleaningTypes.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCleaning(c.id)}
                className={cn(
                  "flex flex-col gap-0.5 rounded-xl border p-4 text-left transition-all",
                  cleaning === c.id
                    ? "border-brand-400 bg-brand-50"
                    : "border-border hover:border-brand-200"
                )}
              >
                <span className="text-sm font-semibold">{c.label}</span>
                <span className="text-xs text-muted-foreground">{c.description}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label={`Площадь: ${area} м²`}>
          <input
            type="range"
            min={20}
            max={200}
            step={5}
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--primary)]"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>20 м²</span>
            <span>200 м²</span>
          </div>
        </Field>

        <Field label="Дополнительно">
          <div className="grid gap-2 sm:grid-cols-2">
            {calculatorAddons.map((a) => {
              const active = addons.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAddon(a.id)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-all",
                    active ? "border-brand-400 bg-brand-50" : "border-border hover:border-brand-200"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "grid size-5 place-items-center rounded-md border transition-colors",
                        active ? "border-primary bg-primary text-primary-foreground" : "border-input"
                      )}
                    >
                      {active && <Check className="size-3.5" />}
                    </span>
                    {a.label}
                  </span>
                  <span className="text-muted-foreground">+{a.price}₽</span>
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      {/* Result */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex flex-col gap-5 rounded-3xl border border-border bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-[var(--shadow-lg)] md:p-8">
          <p className="text-sm text-white/80">Предварительная стоимость</p>
          <motion.p
            key={result.total}
            initial={{ opacity: 0.4, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold"
          >
            {formatPrice(result.total)}
          </motion.p>
          <div className="flex flex-col gap-2 text-sm">
            <Row label="Базовая уборка" value={formatPrice(result.base)} />
            {result.addonsTotal > 0 && (
              <Row label="Доп. услуги" value={`+ ${formatPrice(result.addonsTotal)}`} />
            )}
            <Row label="Ориентир по времени" value={result.duration} />
          </div>

          <div className="h-px bg-white/20" />

          <OrderCta
            variant="white"
            size="lg"
            className="w-full"
            source="calculator"
            total={result.total}
            label="Заказать за эту цену"
          />
          <p className="text-center text-xs text-white/70">
            Итоговая цена подтверждается перед уборкой. Без скрытых доплат.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/80">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
