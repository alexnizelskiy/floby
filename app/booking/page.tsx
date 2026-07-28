"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Zap, CreditCard, ChevronDown, ShieldCheck, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmsAuthModal } from "@/features/booking/sms-auth-modal";
import { CalculatorControls } from "@/features/calculator/calculator-controls";
import { formatPrice, cn } from "@/lib/utils";
import { activeCities } from "@/content/cities";
import {
  computeCalc,
  calcTitle,
  selectedAddonList,
  getCalcDraft,
  saveCalcDraft,
  clearCalcDraft,
  defaultCalcState,
  calcCleaningTypes,
  type CalcState,
} from "@/lib/calc";
import {
  generateDates,
  generateTimes,
  formatDateLong,
  surgeForSlot,
  subscriptions,
  type PaymentMethod,
  type SubscriptionPlan,
} from "@/lib/booking";

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

export default function BookingPage() {
  const router = useRouter();

  // auth
  const [authChecked, setAuthChecked] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);
  const [smsOpen, setSmsOpen] = React.useState(false);

  // calculator + order fields
  const [state, setState] = React.useState<CalcState>(defaultCalcState);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [city, setCity] = React.useState(activeCities[0]?.name ?? "Ростов-на-Дону");
  const [street, setStreet] = React.useState("");
  const [apartment, setApartment] = React.useState("");
  const [entrance, setEntrance] = React.useState("");
  const [floor, setFloor] = React.useState("");
  const [intercom, setIntercom] = React.useState("");
  const [date, setDate] = React.useState(dates[0]);
  const [time, setTime] = React.useState("12:00");
  const [payment, setPayment] = React.useState<PaymentMethod>("card");
  const [subscription, setSubscription] = React.useState<SubscriptionPlan>("none");
  const [comment, setComment] = React.useState("");
  const [streetError, setStreetError] = React.useState(false);
  const [phoneError, setPhoneError] = React.useState(false);

  // promo + bonus
  const [promoInput, setPromoInput] = React.useState("");
  const [promo, setPromo] = React.useState<{ code: string; discountType: "percent" | "fixed"; value: number } | null>(null);
  const [promoError, setPromoError] = React.useState<string | null>(null);
  const [bonusBalance, setBonusBalance] = React.useState(0);
  const [useBonus, setUseBonus] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // hydrate from draft + check auth
  React.useEffect(() => {
    const d = getCalcDraft();
    if (d) {
      setState({ rooms: d.rooms, cleaningType: d.cleaningType, addons: d.addons });
      if (d.name) setName(d.name);
      if (d.phone) setPhone(d.phone);
      if (d.date) setDate(d.date);
      if (d.time) setTime(d.time);
      if (d.comment) setComment(d.comment);
      if (d.promo) setPromoInput(d.promo);
    }
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setAuthed(true);
          if (data.user.name) setName((n) => n || data.user.name);
          if (data.user.phone) setPhone((p) => p || data.user.phone);
        }
      })
      .finally(() => setAuthChecked(true));
  }, []);

  // load bonuses once authed
  React.useEffect(() => {
    if (!authed) return;
    fetch("/api/bonus/me")
      .then((r) => r.json())
      .then((d) => d.ok && setBonusBalance(d.balance))
      .catch(() => {});
  }, [authed]);

  // keep draft in sync so nothing is lost on reload / navigation
  React.useEffect(() => {
    saveCalcDraft({ ...state, name, phone, date, time, promo: promoInput, comment });
  }, [state, name, phone, date, time, promoInput, comment]);

  const result = React.useMemo(() => computeCalc(state), [state]);
  const surge = surgeForSlot(date, time);
  const surgeAmount = surge > 0 ? Math.round((result.total * surge) / 100) : 0;
  const grossTotal = result.total + surgeAmount;

  const promoDiscount = promo
    ? promo.discountType === "percent"
      ? Math.floor((grossTotal * promo.value) / 100)
      : Math.min(promo.value, grossTotal)
    : 0;
  const afterPromo = grossTotal - promoDiscount;
  const maxBonus = Math.floor(afterPromo * 0.15);
  const bonusApplied = useBonus ? Math.min(bonusBalance, maxBonus) : 0;
  const payable = afterPromo - bonusApplied;

  const services = selectedAddonList(state);

  function startAuth() {
    if (phone.replace(/\D/g, "").length < 10) {
      setPhoneError(true);
      return;
    }
    setSmsOpen(true);
  }

  async function applyPromo() {
    setPromoError(null);
    const res = await fetch("/api/promo/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoInput, total: grossTotal }),
    }).then((r) => r.json());
    if (res.ok) {
      setPromo({ code: res.code, discountType: res.discountType, value: res.value });
    } else {
      setPromo(null);
      const map: Record<string, string> = {
        not_found: "Промокод не найден или неактивен",
        expired: "Срок действия промокода истёк",
        used_up: "Лимит использований исчерпан",
        min_order: `Промокод действует от ${res.value} ₽`,
      };
      setPromoError(map[res.error] ?? "Не удалось применить промокод");
    }
  }

  async function finish() {
    if (!street.trim()) {
      setStreetError(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);
    const baths = 1 + (state.addons.bathroom ?? 0);
    const price = {
      base: result.base,
      optionsTotal: result.addonsTotal + result.ecoAmount,
      surgePercent: surge,
      surgeAmount,
      total: grossTotal,
    };
    const data = {
      rooms: state.rooms,
      baths,
      cleaningType: state.cleaningType,
      phone,
      city,
      street,
      apartment,
      date,
      time,
      payment,
      optionIds: Object.keys(state.addons).filter((id) => state.addons[id] > 0),
      services,
      email: "",
      name,
      entrance,
      floor,
      intercom,
      comment,
      subscription,
      price,
    };
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, total: grossTotal, bonusUsed: bonusApplied, promoCode: promo?.code }),
      });
      if (res.status === 401) {
        setAuthed(false);
        setSaving(false);
        return;
      }
      if (!res.ok) throw new Error();
      const { id } = (await res.json()) as { id: string };
      clearCalcDraft();

      if (payment === "card") {
        const pay = await fetch("/api/payments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: id }),
        });
        const payData = (await pay.json()) as { ok: boolean; url?: string };
        if (payData.ok && payData.url) {
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

  // ── Auth gate ──
  if (authChecked && !authed) {
    return (
      <div className="bg-surface">
        <div className="container-page flex min-h-[60vh] items-center justify-center py-14">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 md:p-8">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700">
              <ShieldCheck className="size-6" />
            </span>
            <h1 className="mt-4 text-2xl font-bold">Вход в личный кабинет</h1>
            <p className="mt-2 text-muted-foreground">
              Подтвердите номер телефона — и вернётесь к оформлению заказа. Всё, что вы выбрали, сохранится.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setPhoneError(false); }}
                placeholder="+7 (___) ___-__-__"
                aria-invalid={phoneError}
                className={cn(inputCls, phoneError && "border-destructive")}
              />
              {phoneError && <p className="text-sm text-destructive">Введите корректный номер</p>}
              <Button size="lg" onClick={startAuth}>Получить код</Button>
            </div>
          </div>
        </div>

        <SmsAuthModal
          open={smsOpen}
          phone={phone}
          onClose={() => setSmsOpen(false)}
          onVerified={() => { setSmsOpen(false); setAuthed(true); }}
        />
      </div>
    );
  }

  if (!authChecked) {
    return <div className="bg-surface"><div className="container-page py-14"><div className="h-64 rounded-3xl border border-border bg-card" /></div></div>;
  }

  // ── Order step with live calculator ──
  return (
    <div className="bg-surface">
      <div className="container-page py-8 md:py-12">
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
          <CheckCircle2 className="size-7 shrink-0 text-brand-600" />
          <div>
            <p className="font-semibold">Оформление заказа</p>
            <p className="text-sm text-muted-foreground">Проверьте состав уборки и укажите адрес — сумма пересчитывается автоматически.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Left: calculator + address */}
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-border bg-card p-5 md:p-7">
              <CalculatorControls state={state} onChange={setState} />
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 md:p-7">
              <h2 className="text-xl font-bold">Где навести порядок</h2>
              <div className="mt-4 flex flex-col gap-4">
                <Field label="Город">
                  <Select value={city} onChange={setCity}>
                    {activeCities.map((c) => (
                      <option key={c.slug} value={c.name}>{c.name}</option>
                    ))}
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
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Подъезд"><input value={entrance} onChange={(e) => setEntrance(e.target.value)} className={inputCls} /></Field>
                  <Field label="Этаж"><input value={floor} onChange={(e) => setFloor(e.target.value)} className={inputCls} /></Field>
                  <Field label="Домофон"><input value={intercom} onChange={(e) => setIntercom(e.target.value)} className={inputCls} /></Field>
                </div>
              </div>
            </div>
          </div>

          {/* Right: order summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 md:p-6">
              <div className="rounded-2xl bg-surface p-5">
                <p className="text-sm text-muted-foreground">{calcTitle(state.rooms)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {calcCleaningTypes.find((t) => t.id === state.cleaningType)?.label} · {result.durationLabel}
                </p>
                <div className="mt-3 flex flex-col gap-1.5 text-sm">
                  <Row label="Базовая уборка" value={formatPrice(result.base)} />
                  {result.addonsTotal > 0 && <Row label="Доп. услуги" value={`+ ${formatPrice(result.addonsTotal)}`} />}
                  {result.ecoAmount > 0 && <Row label="Эко-уборка" value={`+ ${formatPrice(result.ecoAmount)}`} />}
                  {surgeAmount > 0 && <Row label={`Повышенный спрос +${surge}%`} value={`+ ${formatPrice(surgeAmount)}`} />}
                  {promoDiscount > 0 && <Row label={`Промокод ${promo?.code}`} value={`− ${formatPrice(promoDiscount)}`} accent />}
                  {bonusApplied > 0 && <Row label="Бонусы" value={`− ${formatPrice(bonusApplied)}`} accent />}
                </div>
                <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                  <span className="text-sm font-medium">К оплате</span>
                  <span className="text-3xl font-bold">{formatPrice(payable)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Select value={date} onChange={setDate}>
                  {dates.map((d) => (<option key={d} value={d}>{formatDateLong(d)}</option>))}
                </Select>
                <Select value={time} onChange={setTime}>
                  {times.map((t) => (<option key={t} value={t}>{t}</option>))}
                </Select>
              </div>
              {surge > 0 && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="size-4 fill-sky-400 text-sky-400" /> Повышенный спрос — цена временно выше.
                </p>
              )}

              {/* Подписка + постоянный клинер */}
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Регулярность</span>
                <Select value={subscription} onChange={(v) => setSubscription(v as SubscriptionPlan)}>
                  {subscriptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </Select>
                {subscription !== "none" && (
                  <p className="flex items-start gap-1.5 text-xs text-brand-700">
                    <Repeat className="mt-0.5 size-3.5 shrink-0" />
                    На регулярные уборки будет приезжать один и тот же проверенный клинер.
                  </p>
                )}
              </div>

              {/* Payment */}
              <div className="flex gap-5 border-b border-border">
                {(["card", "cash"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPayment(p)}
                    className={cn(
                      "-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors",
                      payment === p ? "border-brand-500 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {p === "card" ? "Картой" : "Наличными"}
                  </button>
                ))}
              </div>
              {payment === "card" && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CreditCard className="size-4" /> Оплата после уборки через защищённую страницу.
                </p>
              )}

              {/* Promo */}
              {promo ? (
                <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm">
                  <span className="font-semibold text-brand-700">Промокод {promo.code} применён</span>
                  <button type="button" onClick={() => { setPromo(null); setPromoInput(""); }} className="ml-auto text-muted-foreground hover:text-foreground">Убрать</button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-2">
                    <input
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(null); }}
                      placeholder="Промокод"
                      className={cn(inputCls, "uppercase")}
                    />
                    <Button type="button" variant="outline" onClick={applyPromo}>ОК</Button>
                  </div>
                  {promoError && <p className="text-sm text-destructive">{promoError}</p>}
                </div>
              )}

              {bonusBalance > 0 && (
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-3.5 text-sm">
                  <input type="checkbox" checked={useBonus} onChange={(e) => setUseBonus(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]" />
                  <span>
                    <span className="font-semibold">Списать бонусы</span> — доступно {formatPrice(bonusBalance)}, до 15% заказа:{" "}
                    <span className="font-semibold text-brand-600">−{formatPrice(Math.min(bonusBalance, maxBonus))}</span>
                  </span>
                </label>
              )}

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="Комментарий к заказу"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
              />

              <Button size="lg" onClick={finish} disabled={saving}>
                {saving ? "Оформляем…" : "Оформить заказ"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Нажимая кнопку, вы принимаете{" "}
                <Link href="/help" className="underline underline-offset-2 hover:text-foreground">условия соглашения</Link>{" "}
                и{" "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">политику конфиденциальности</Link>.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-semibold", accent && "text-brand-600")}>{value}</span>
    </div>
  );
}
