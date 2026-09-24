"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";

interface Defaults {
  base: Record<string, Record<string, number>>;
  ecoPercent: number;
  types: { id: string; label: string }[];
  rooms: { rooms: number; label: string; area: string }[];
  addons: { id: string; title: string; unit: string; price: number }[];
}

const numInput =
  "h-10 w-24 rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

export function PricingManager() {
  const [defaults, setDefaults] = React.useState<Defaults | null>(null);
  const [base, setBase] = React.useState<Record<string, Record<string, string>>>({});
  const [addons, setAddons] = React.useState<Record<string, string>>({});
  const [eco, setEco] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/admin/pricing")
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) return;
        const def: Defaults = d.defaults;
        const ov = d.override ?? {};
        setDefaults(def);
        const b: Record<string, Record<string, string>> = {};
        for (const t of def.types) {
          b[t.id] = {};
          for (const r of def.rooms) {
            b[t.id][r.rooms] = String(ov.base?.[t.id]?.[r.rooms] ?? def.base[t.id][r.rooms]);
          }
        }
        setBase(b);
        const a: Record<string, string> = {};
        for (const ad of def.addons) a[ad.id] = String(ov.addons?.[ad.id] ?? ad.price);
        setAddons(a);
        setEco(String(ov.ecoPercent ?? def.ecoPercent));
      })
      .catch(() => {});
  }, []);

  async function save() {
    if (!defaults) return;
    setSaving(true);
    const pricing = {
      base: Object.fromEntries(
        defaults.types.map((t) => [
          t.id,
          Object.fromEntries(defaults.rooms.map((r) => [r.rooms, Math.round(Number(base[t.id]?.[r.rooms])) || defaults.base[t.id][r.rooms]])),
        ])
      ),
      addons: Object.fromEntries(defaults.addons.map((a) => [a.id, Math.round(Number(addons[a.id])) || 0])),
      ecoPercent: Math.round(Number(eco)) || defaults.ecoPercent,
    };
    await fetch("/api/admin/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pricing }),
    }).catch(() => {});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!defaults) return <div className="mt-6 h-48 rounded-2xl border border-border bg-card" />;

  return (
    <div className="mt-6 flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Цены применяются к калькулятору, карточкам услуг и странице «Цены». Пусто/по умолчанию — эталонные цены калькулятора.
      </p>

      {/* Base grid */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card p-5">
        <h2 className="font-bold">Базовые цены уборки, ₽</h2>
        <p className="mt-1 text-sm text-muted-foreground">За уборку по числу комнат (включён один санузел).</p>
        <table className="mt-4 w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-2 font-medium">Тип уборки</th>
              {defaults.rooms.map((r) => (
                <th key={r.rooms} className="px-2 py-2 font-medium">{r.label} комн.</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {defaults.types.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="py-2.5 font-medium">{t.label}</td>
                {defaults.rooms.map((r) => (
                  <td key={r.rooms} className="px-2 py-2.5">
                    <input
                      type="number"
                      className={numInput}
                      value={base[t.id]?.[r.rooms] ?? ""}
                      onChange={(e) => setBase((s) => ({ ...s, [t.id]: { ...s[t.id], [r.rooms]: e.target.value } }))}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Addons */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-bold">Дополнительные услуги, ₽</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {defaults.addons.map((a) => (
            <label key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5">
              <span className="text-sm">
                {a.title}
                {a.unit && <span className="text-muted-foreground"> / {a.unit}</span>}
              </span>
              <input
                type="number"
                className={numInput}
                value={addons[a.id] ?? ""}
                onChange={(e) => setAddons((s) => ({ ...s, [a.id]: e.target.value }))}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Eco */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-bold">Эко-уборка</h2>
        <label className="mt-3 flex items-center gap-3 text-sm">
          Надбавка за эко-средства
          <input type="number" className={numInput} value={eco} onChange={(e) => setEco(e.target.value)} />
          %
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          Сохранить цены
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
            <Check className="size-4" /> Сохранено. Обновите страницы сайта, чтобы увидеть новые цены.
          </span>
        )}
      </div>
    </div>
  );
}
