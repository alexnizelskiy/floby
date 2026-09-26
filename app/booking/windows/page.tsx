"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ChevronDown, ShieldCheck, CreditCard, Banknote, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmsAuthModal } from "@/features/booking/sms-auth-modal";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { useAuth, useRoleFlags } from "@/components/auth/auth-provider";
import { usePricing } from "@/components/pricing/pricing-provider";
import { ymGoal } from "@/components/analytics/yandex-metrika";
import { formatPrice, cn } from "@/lib/utils";
import { activeCities } from "@/content/cities";
import { generateDates, generateTimes, formatDateLong } from "@/lib/booking";
import {
  WINDOW_DEFAULT_SASHES,
  WINDOW_MIN_SASHES,
  WINDOW_MAX_SASHES,
  clampSashes,
  windowSashPrice,
  windowPrice,
  windowLabel,
  getWindowDraft,
  clearWindowDraft,
} from "@/lib/windows";

const dates = generateDates(14);
const times = generateTimes();

const inputCls =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "appearance-none pr-10")}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export default function WindowBookingPage() {
  const router = useRouter();
  const { refresh: refreshAuth } = useAuth();
  const { canOrder, dashboardPath, loading: roleLoading } = useRoleFlags();
  const pricing = usePricing();

  React.useEffect(() => {
    if (!roleLoading && !canOrder && dashboardPath) router.replace(dashboardPath);
  }, [roleLoading, canOrder, dashboardPath, router]);

  const [authChecked, setAuthChecked] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);
  const [smsOpen, setSmsOpen] = React.useState(false);

  const [sashes, setSashes] = React.useState(WINDOW_DEFAULT_SASHES);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [needsPhone, setNeedsPhone] = React.useState(false);
  const [city, setCity] = React.useState(activeCities[0]?.name ?? "Ростов-на-Дону");
  const [street, setStreet] = React.useState("");
  const [apartment, setApartment] = React.useState("");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [payment, setPayment] = React.useState<"card" | "cash">("card");
  const [streetError, setStreetError] = React.useState(false);
  const [contactErr, setContactErr] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const total = windowPrice(sashes, pricing);

  // hydrate draft + auth
  React.useEffect(() => {
    const d = getWindowDraft();
    if (d?.sashes) setSashes(clampSashes(d.sashes));
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setAuthed(true);
          if (data.user.name) setName((n) => n || data.user.name);
          if (data.user.phone) setPhone((p) => p || data.user.phone);
          else setNeedsPhone(true);
        }
      })
      .finally(() => setAuthChecked(true));
  }, []);

  function startAuth() {
    if (phone.replace(/\D/g, "").length < 10) return;
    setSmsOpen(true);
  }

  async function finish() {
    if (needsPhone && phone.replace(/\D/g, "").length < 10) {
      setContactErr("Введите корректный номер");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!street.trim()) {
      setStreetError(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);

    if (needsPhone) {
      const pr = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
        .then((r) => r.json())
        .catch(() => ({ ok: false }));
      if (!pr.ok) {
        setSaving(false);
        setContactErr(
          pr.error === "phone_taken"
            ? "Этот номер уже привязан к другому аккаунту. Войдите по номеру телефона."
            : "Не удалось сохранить номер. Попробуйте ещё раз."
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setNeedsPhone(false);
      refreshAuth();
    }

    const label = windowLabel(sashes);
    const data = {
      kind: "windows",
      windowSashes: sashes,
      title: `Мытьё окон · ${label}`,
      services: [{ id: "windows", title: `Мытьё окон · ${label}`, qty: 1, price: total }],
      city,
      street,
      apartment,
      date,
      time,
      payment,
      name,
      phone,
      email: "",
      price: { base: total, optionsTotal: 0, surgePercent: 0, surgeAmount: 0, total },
    };
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, total }),
      });
      if (res.status === 401) {
        setAuthed(false);
        setSaving(false);
        return;
      }
      if (!res.ok) throw new Error();
      const { id } = (await res.json()) as { id: string };
      clearWindowDraft();
      ymGoal("order_submit", { kind: "windows", total, payment });

      if (payment === "card") {
        const pay = await fetch("/api/payments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: id }),
        });
        const payData = (await pay.json()) as { ok: boolean; url?: string };
        if (payData.ok && payData.url) {
          ymGoal("payment_started", { kind: "windows", total });
          window.location.href = payData.url;
          return;
        }
      }
      router.push("/profile");
    } catch {
      setSaving(false);
      alert("Не удалось оформить заказ. Попробуйте ещё раз.");
    }
  }

  // Staff/executor → panel
  if (!roleLoading && !canOrder) {
    return <div className="bg-background"><div className="container-page py-14"><div className="h-64 rounded-3xl border border-border bg-card" /></div></div>;
  }

  // Auth gate
  if (authChecked && !authed) {
    return (
      <div className="bg-background">
        <div className="container-page flex min-h-[60vh] items-center justify-center py-14">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 md:p-8">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700">
              <ShieldCheck className="size-6" />
            </span>
            <h1 className="mt-4 text-2xl font-bold">Вход в личный кабинет</h1>
            <p className="mt-2 text-muted-foreground">
              Подтвердите номер телефона — и вернётесь к заказу мойки окон. Выбор сохранится.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (___) ___-__-__"
                className={inputCls}
              />
              <Button size="lg" onClick={startAuth}>Получить код</Button>
            </div>
            <div className="mt-5">
              <OAuthButtons onSuccess={() => { setAuthed(true); refreshAuth(); }} />
            </div>
          </div>
        </div>
        <SmsAuthModal
          open={smsOpen}
          phone={phone}
          onClose={() => setSmsOpen(false)}
          onVerified={() => { setSmsOpen(false); setAuthed(true); refreshAuth(); }}
        />
      </div>
    );
  }

  if (!authChecked) {
    return <div className="bg-background"><div className="container-page py-14"><div className="h-64 rounded-3xl border border-border bg-card" /></div></div>;
  }

  // Order step
  return (
    <div className="bg-background">
      <div className="container-page py-8 md:py-12">
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-brand-200 bg-card p-4">
          <CheckCircle2 className="size-7 shrink-0 text-brand-600" />
          <div>
            <p className="font-semibold">Мытьё окон в квартире</p>
            <p className="text-sm text-muted-foreground">Считаем по количеству створок. Укажите, сколько окон помыть, и адрес.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-6">
            {needsPhone && (
              <div className="rounded-3xl border border-brand-200 bg-card p-5 md:p-7">
                <h2 className="text-xl font-bold">Контактный телефон</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Вы вошли через соцсеть — оставьте номер, чтобы клинер мог связаться с вами.
                </p>
                <input
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setContactErr(null); }}
                  placeholder="+7 (___) ___-__-__"
                  aria-invalid={!!contactErr}
                  className={cn(inputCls, "mt-4", contactErr && "border-destructive")}
                />
                {contactErr && <p className="mt-2 text-sm text-destructive">{contactErr}</p>}
              </div>
            )}

            {/* Sashes count */}
            <div className="rounded-3xl border border-border bg-card p-5 md:p-7">
              <h2 className="text-xl font-bold">Сколько окон моем</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Считаем по створкам — {formatPrice(windowSashPrice(pricing))} за створку. Одна створка — это стекло с двух
                сторон, рама и подоконник.
              </p>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3.5">
                <span className="text-sm font-medium">Количество створок</span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setSashes((s) => clampSashes(s - 1))}
                    disabled={sashes <= WINDOW_MIN_SASHES}
                    aria-label="Меньше створок"
                    className="grid size-10 place-items-center rounded-full border border-border transition-colors hover:border-brand-300 disabled:opacity-40"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-8 text-center text-xl font-bold tabular-nums">{sashes}</span>
                  <button
                    type="button"
                    onClick={() => setSashes((s) => clampSashes(s + 1))}
                    disabled={sashes >= WINDOW_MAX_SASHES}
                    aria-label="Больше створок"
                    className="grid size-10 place-items-center rounded-full border border-border transition-colors hover:border-brand-300 disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Панорамное остекление и нестандартные окна клинер уточнит на месте.
              </p>
            </div>

            {/* Address */}
            <div className="rounded-3xl border border-border bg-card p-5 md:p-7">
              <h2 className="text-xl font-bold">Где помыть окна</h2>
              <div className="mt-4 flex flex-col gap-4">
                <Field label="Город">
                  <Select value={city} onChange={setCity}>
                    {activeCities.map((c) => (<option key={c.slug} value={c.name}>{c.name}</option>))}
                  </Select>
                </Field>
                <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                  <Field label="Улица и дом">
                    <input
                      value={street}
                      onChange={(e) => { setStreet(e.target.value); setStreetError(false); }}
                      aria-invalid={streetError}
                      placeholder="ул. Пушкинская, 10"
                      className={cn(inputCls, streetError && "border-destructive")}
                    />
                  </Field>
                  <Field label="Квартира">
                    <input value={apartment} onChange={(e) => setApartment(e.target.value)} placeholder="12" className={inputCls} />
                  </Field>
                </div>
              </div>
            </div>

            {/* When */}
            <div className="rounded-3xl border border-border bg-card p-5 md:p-7">
              <h2 className="text-xl font-bold">Когда к вам приехать</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Select value={date} onChange={setDate}>
                  <option value="" disabled>Дата</option>
                  {dates.map((d) => (<option key={d} value={d}>{formatDateLong(d)}</option>))}
                </Select>
                <Select value={time} onChange={setTime}>
                  <option value="" disabled>Время</option>
                  {times.map((t) => (<option key={t} value={t}>{t}</option>))}
                </Select>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-3xl border border-border bg-card p-5 md:p-7">
              <h2 className="text-xl font-bold">Оплата</h2>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {([["card", "Картой онлайн", CreditCard], ["cash", "Наличными", Banknote]] as const).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPayment(id)}
                    aria-pressed={payment === id}
                    className={cn(
                      "flex items-center gap-2.5 rounded-2xl border px-4 py-3.5 text-sm font-medium transition-colors",
                      payment === id ? "border-brand-500" : "border-border hover:border-brand-300"
                    )}
                  >
                    <Icon className="size-5 text-primary" /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 md:p-6">
              <h2 className="text-lg font-bold">Мытьё окон</h2>
              <div className="flex flex-col gap-2 border-y border-border py-4 text-sm">
                <Row label="Окна" value={windowLabel(sashes)} />
                <Row label="Дата" value={date ? formatDateLong(date) : "не выбрана"} />
                <Row label="Время" value={time || "не выбрано"} />
                <Row label="Оплата" value={payment === "card" ? "Картой онлайн" : "Наличными"} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">К оплате</span>
                <span className="text-3xl font-bold">{formatPrice(total)}</span>
              </div>
              <Button size="lg" onClick={finish} disabled={saving}>
                {saving ? "Оформляем…" : "Оформить заказ"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Нажимая кнопку, вы принимаете{" "}
                <Link href="/help" className="underline underline-offset-2 hover:text-foreground">условия</Link>{" "}
                и{" "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">политику</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
