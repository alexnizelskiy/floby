"use client";

import * as React from "react";
import { Gift, ShieldCheck, Copy, Check, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { SmsAuthModal } from "@/features/booking/sms-auth-modal";
import { formatPrice, cn } from "@/lib/utils";

const PRESETS = [2000, 3000, 5000];
const MIN = 1000;
const MAX = 50000;

const inputCls =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-base placeholder:text-muted-foreground focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

export default function GiftPage() {
  const [authChecked, setAuthChecked] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [phoneError, setPhoneError] = React.useState(false);
  const [smsOpen, setSmsOpen] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) { setAuthed(true); if (d.user.phone) setPhone((p) => p || d.user.phone); } })
      .finally(() => setAuthChecked(true));
  }, []);

  function startAuth() {
    if (phone.replace(/\D/g, "").length < 10) { setPhoneError(true); return; }
    setSmsOpen(true);
  }

  return (
    <>
      <PageHeader
        eyebrow="Подарок"
        title="Подарочный сертификат floby"
        description="Подарите близким чистоту и свободное время. Сумма зачисляется на бонусный счёт получателя и тратится на любые уборки."
        crumbs={[{ label: "Подарочный сертификат", href: "/gift" }]}
      />

      <Section>
        {!authChecked ? (
          <div className="mx-auto h-64 max-w-xl rounded-3xl border border-border bg-card" />
        ) : !authed ? (
          <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-6 md:p-8">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700">
              <ShieldCheck className="size-6" />
            </span>
            <h2 className="mt-4 text-2xl font-bold">Вход в личный кабинет</h2>
            <p className="mt-2 text-muted-foreground">Подтвердите номер телефона, чтобы купить или активировать сертификат.</p>
            <div className="mt-6 flex flex-col gap-3">
              <input
                type="tel" inputMode="tel" value={phone}
                onChange={(e) => { setPhone(e.target.value); setPhoneError(false); }}
                placeholder="+7 (___) ___-__-__"
                className={cn(inputCls, phoneError && "border-destructive")}
              />
              {phoneError && <p className="text-sm text-destructive">Введите корректный номер</p>}
              <Button size="lg" onClick={startAuth}>Получить код</Button>
            </div>
            <SmsAuthModal open={smsOpen} phone={phone} onClose={() => setSmsOpen(false)} onVerified={() => { setSmsOpen(false); setAuthed(true); }} />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <BuyCard />
            <RedeemCard />
          </div>
        )}
      </Section>
    </>
  );
}

function BuyCard() {
  const [amount, setAmount] = React.useState(3000);
  const [custom, setCustom] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [issued, setIssued] = React.useState<{ code: string; amount: number } | null>(null);
  const [copied, setCopied] = React.useState(false);

  const value = custom ? Math.round(Number(custom) || 0) : amount;

  async function buy() {
    setError(null);
    if (value < MIN || value > MAX) { setError(`Сумма от ${formatPrice(MIN)} до ${formatPrice(MAX)}`); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/gift/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value, message }),
      });
      const data = await res.json();
      if (data.ok && data.url) { window.location.href = data.url; return; }
      if (data.ok && data.code) { setIssued({ code: data.code, amount: data.amount }); return; }
      setError("Не удалось оформить сертификат. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  if (issued) {
    return (
      <div className="rounded-3xl border border-brand-200 bg-brand-50/50 p-6 md:p-8">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700"><Sparkles className="size-6" /></span>
        <h2 className="mt-4 text-2xl font-bold">Сертификат готов!</h2>
        <p className="mt-2 text-muted-foreground">Передайте этот код получателю — он активирует его в своём кабинете.</p>
        <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-brand-300 bg-white p-4">
          <span className="font-mono text-xl font-bold tracking-wider">{issued.code}</span>
          <button
            type="button"
            onClick={() => { navigator.clipboard?.writeText(issued.code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface"
          >
            {copied ? <Check className="size-4 text-brand-600" /> : <Copy className="size-4" />}
            {copied ? "Скопировано" : "Копировать"}
          </button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Номинал: <span className="font-semibold text-foreground">{formatPrice(issued.amount)}</span></p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
      <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700"><Gift className="size-6" /></span>
      <h2 className="mt-4 text-2xl font-bold">Купить сертификат</h2>
      <p className="mt-1 text-muted-foreground">Выберите номинал.</p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => { setAmount(p); setCustom(""); }}
            className={cn(
              "rounded-xl border py-3 text-center font-semibold transition-colors",
              !custom && amount === p ? "border-brand-400 bg-brand-50 text-brand-800" : "border-border hover:border-brand-200"
            )}
          >
            {formatPrice(p)}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <input
          type="number" inputMode="numeric" value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Другая сумма, ₽"
          className={inputCls}
        />
      </div>

      <div className="mt-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="Пожелание получателю (необязательно)"
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
        />
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <Button size="lg" className="mt-4 w-full" onClick={buy} disabled={busy}>
        {busy ? "Оформляем…" : `Купить за ${formatPrice(value || 0)}`}
      </Button>
    </div>
  );
}

function RedeemCard() {
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<{ ok: boolean; text: string } | null>(null);

  async function redeem() {
    setResult(null);
    setBusy(true);
    try {
      const res = await fetch("/api/gift/redeem", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult({ ok: true, text: `Сертификат на ${formatPrice(data.amount)} зачислен на бонусный счёт!` });
        setCode("");
      } else {
        const map: Record<string, string> = {
          not_found: "Сертификат не найден. Проверьте код.",
          not_active: "Сертификат уже активирован или ещё не оплачен.",
          own: "Нельзя активировать свой же сертификат.",
        };
        setResult({ ok: false, text: map[data.error] ?? "Не удалось активировать сертификат." });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
      <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700"><Sparkles className="size-6" /></span>
      <h2 className="mt-4 text-2xl font-bold">Активировать сертификат</h2>
      <p className="mt-1 text-muted-foreground">Введите код — сумма зачислится на ваш бонусный счёт.</p>

      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="FLOBY-XXXX-XXXX"
        className={cn(inputCls, "mt-5 font-mono uppercase tracking-wider")}
      />

      {result && (
        <p className={cn("mt-3 text-sm", result.ok ? "text-brand-700" : "text-destructive")}>{result.text}</p>
      )}

      <Button size="lg" variant="outline" className="mt-4 w-full" onClick={redeem} disabled={busy || code.length < 6}>
        {busy ? "Проверяем…" : "Активировать"}
      </Button>
    </div>
  );
}
