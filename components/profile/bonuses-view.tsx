"use client";

import * as React from "react";
import { Gift, Wallet } from "lucide-react";
import { ReferralShare } from "@/components/profile/referral-share";
import { referralSteps } from "@/content/profile";
import { getIcon } from "@/lib/icons";
import { formatPrice } from "@/lib/utils";

interface BonusData {
  balance: number;
  refCode: string;
  ledger: { amount: number; reason: string; created_at: string }[];
  rules: { welcome: number; referrer: number; maxPercent: number };
}

export function BonusesView() {
  const [data, setData] = React.useState<BonusData | null>(null);
  const [origin, setOrigin] = React.useState("https://floby.ru");

  React.useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/bonus/me").then((r) => r.json()).then((d) => d.ok && setData(d)).catch(() => {});
  }, []);

  const link = data ? `${origin}/?ref=${data.refCode}` : "";

  return (
    <div className="flex flex-col gap-6">
      {/* Balance */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-brand-100 text-brand-700">
            <Wallet className="size-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Бонусный счёт</p>
            <p className="text-3xl font-extrabold text-primary">
              {data ? formatPrice(data.balance) : "…"}
            </p>
          </div>
        </div>
        <p className="hidden max-w-xs text-right text-sm text-muted-foreground sm:block">
          Бонусами можно оплатить до {data?.rules.maxPercent ?? 15}% стоимости каждой уборки.
        </p>
      </div>

      {/* Referral hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-7 text-white md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
              <Gift className="size-4" /> Бонусная программа
            </span>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">
              По {data?.rules.welcome ?? 500} рублей — на уборку тебе и другу
            </h2>
            <p className="mt-4 max-w-lg text-white/85">
              Поделитесь ссылкой с друзьями. Они получат {data?.rules.welcome ?? 500} ₽ на первый
              заказ, а вы — {data?.rules.referrer ?? 500} ₽ на бонусный счёт после их первой уборки.
            </p>
            <div className="mt-6">{link && <ReferralShare link={link} />}</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-white/20">
              <Gift className="size-8" />
            </div>
            <p className="mt-4 text-2xl font-bold">Ваш код: {data?.refCode ?? "…"}</p>
            <p className="mt-1 text-sm text-white/80">делитесь ссылкой или кодом</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="rounded-2xl border border-border bg-card p-7 md:p-8">
        <h3 className="text-xl font-bold">Как это работает</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {referralSteps.map((step, i) => {
            const Icon = getIcon(step.icon);
            return (
              <div key={step.title} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-100 text-brand-700">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-3xl font-extrabold text-brand-200">{i + 1}</span>
                </div>
                <h4 className="font-semibold">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* History */}
      {data && data.ledger.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-7 md:p-8">
          <h3 className="text-xl font-bold">История бонусов</h3>
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {data.ledger.map((e, i) => (
              <li key={i} className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm">{e.reason}</span>
                <span className={e.amount >= 0 ? "font-semibold text-brand-600" : "font-semibold text-destructive"}>
                  {e.amount >= 0 ? "+" : "−"}
                  {formatPrice(Math.abs(e.amount))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
