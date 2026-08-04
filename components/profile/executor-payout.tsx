"use client";

import * as React from "react";
import { Wallet, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";

interface PayoutRecord {
  id: string;
  amount: number;
  note: string | null;
  created_at: string;
}
interface PayoutState {
  earned: number;
  paid: number;
  balance: number;
  history: PayoutRecord[];
  payoutDetails: string | null;
  inn: string | null;
}

const inputCls =
  "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

export function ExecutorPayout() {
  const [state, setState] = React.useState<PayoutState | null>(null);
  const [details, setDetails] = React.useState("");
  const [inn, setInn] = React.useState("");
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    const r = await fetch("/api/executor/payout", { cache: "no-store" }).then((x) => x.json()).catch(() => null);
    if (r?.ok) {
      setState(r);
      setDetails(r.payoutDetails ?? "");
      setInn(r.inn ?? "");
    }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payoutDetails: details, inn }),
    }).catch(() => {});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!state) return <div className="h-32 rounded-2xl border border-border bg-card" />;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Wallet className="size-5 text-brand-600" /> Выплаты
      </h2>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-surface p-3 text-center">
          <p className="text-xs text-muted-foreground">Заработано</p>
          <p className="mt-1 text-lg font-bold">{formatPrice(state.earned)}</p>
        </div>
        <div className="rounded-xl bg-surface p-3 text-center">
          <p className="text-xs text-muted-foreground">Выплачено</p>
          <p className="mt-1 text-lg font-bold">{formatPrice(state.paid)}</p>
        </div>
        <div className="rounded-xl bg-brand-50 p-3 text-center">
          <p className="text-xs text-brand-700">К выплате</p>
          <p className="mt-1 text-lg font-bold text-brand-700">{formatPrice(state.balance)}</p>
        </div>
      </div>

      {/* Requisites */}
      <form onSubmit={save} className="mt-5">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <CreditCard className="size-4 text-muted-foreground" /> Реквизиты для выплат
        </p>
        <div className="mt-2 grid gap-2.5 sm:grid-cols-[2fr_1fr]">
          <input
            className={inputCls}
            placeholder="Номер карты или телефон для СБП"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
          <input
            className={inputCls}
            placeholder="ИНН (самозанятый)"
            inputMode="numeric"
            value={inn}
            onChange={(e) => setInn(e.target.value.replace(/\D/g, "").slice(0, 12))}
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button size="sm" type="submit" disabled={saving}>{saving ? "Сохраняем…" : "Сохранить реквизиты"}</Button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
              <Check className="size-4" /> Сохранено
            </span>
          )}
        </div>
      </form>

      {/* History */}
      {state.history.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-medium">История выплат</p>
          <ul className="mt-2 flex flex-col divide-y divide-border">
            {state.history.map((h) => (
              <li key={h.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-muted-foreground">
                  {new Date(h.created_at).toLocaleDateString("ru-RU")}
                  {h.note ? ` · ${h.note}` : ""}
                </span>
                <span className="font-semibold">{formatPrice(h.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
