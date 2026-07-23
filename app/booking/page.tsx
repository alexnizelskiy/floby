"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, CheckCircle2, Zap, CreditCard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "@/features/booking/summary-card";
import { getIcon } from "@/lib/icons";
import { formatPrice, cn } from "@/lib/utils";
import { activeCities } from "@/content/cities";
import {
  getDraft,
  clearDraft,
  getAuthPhone,
  bookingOptions,
  subscriptions,
  computePrice,
  estimateDurationHours,
  generateDates,
  generateTimes,
  formatDateLong,
  surgeForSlot,
  type PaymentMethod,
  type SubscriptionPlan,
} from "@/lib/booking";

const dates = generateDates(14);
const times = generateTimes();

function StepLabel({ n }: { n: number }) {
  return <p className="text-sm font-medium text-muted-foreground">Шаг {n} из 4</p>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {hint && <span className="-mt-1 text-xs text-muted-foreground">{hint}</span>}
      {children}
    </label>
  );
}

const inputCls =
  "h-13 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputCls, "appearance-none pr-10")}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export default function BookingPage() {
  const router = useRouter();

  const [rooms, setRooms] = React.useState(1);
  const [baths, setBaths] = React.useState(1);
  const [phone, setPhone] = React.useState("");

  const [step, setStep] = React.useState(1);

  // Step 1
  const [city, setCity] = React.useState(activeCities[0]?.name ?? "Ростов-на-Дону");
  const [street, setStreet] = React.useState("");
  const [apartment, setApartment] = React.useState("");
  const [date, setDate] = React.useState(dates[0]);
  const [time, setTime] = React.useState("12:00");
  const [payment, setPayment] = React.useState<PaymentMethod>("card");
  const [streetError, setStreetError] = React.useState(false);

  // Step 2
  const [optionIds, setOptionIds] = React.useState<string[]>([]);
  // Step 3
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [entrance, setEntrance] = React.useState("");
  const [floor, setFloor] = React.useState("");
  const [intercom, setIntercom] = React.useState("");
  const [comment, setComment] = React.useState("");
  // Step 4
  const [subscription, setSubscription] = React.useState<SubscriptionPlan>("none");
  // Bonuses
  const [bonusBalance, setBonusBalance] = React.useState(0);
  const [useBonus, setUseBonus] = React.useState(false);

  React.useEffect(() => {
    const d = getDraft();
    if (d) {
      setRooms(d.rooms);
      setBaths(d.baths);
      setPhone(d.phone);
    }
    const auth = getAuthPhone();
    if (auth) setPhone((p) => p || auth);
    fetch("/api/bonus/me")
      .then((r) => r.json())
      .then((d) => d.ok && setBonusBalance(d.balance))
      .catch(() => {});
  }, []);

  const surge = surgeForSlot(date, time);
  const price = computePrice(rooms, baths, optionIds, surge);
  const duration = estimateDurationHours(rooms, baths);
  const paymentLabel = payment === "card" ? "Картой" : "Наличные";
  const maxBonus = Math.floor(price.total * 0.15);
  const bonusApplied = useBonus ? Math.min(bonusBalance, maxBonus) : 0;

  function toggleOption(id: string) {
    setOptionIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function goStep1Next() {
    if (!street.trim()) {
      setStreetError(true);
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const [saving, setSaving] = React.useState(false);

  async function finish() {
    setSaving(true);
    const data = {
      rooms, baths, phone, city, street, apartment, date, time, payment,
      optionIds, email, name, entrance, floor, intercom, comment, subscription, price,
      bonusUsed: bonusApplied,
    };
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, total: price.total, bonusUsed: bonusApplied }),
      });
      if (res.status === 401) {
        router.push("/"); // session lost — re-auth
        return;
      }
      if (!res.ok) throw new Error();
      const { id } = (await res.json()) as { id: string };
      clearDraft();

      if (payment === "card") {
        // Create a payment and go to the checkout (ЮKassa hosted page or test return)
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
      alert("Не удалось сохранить уборку. Попробуйте ещё раз.");
    }
  }

  return (
    <div className="bg-surface">
      <div className="container-page py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* ── Left: step content ── */}
          <div className="min-w-0">
            {step >= 2 && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
                <CheckCircle2 className="size-7 shrink-0 text-brand-600" />
                <div>
                  <p className="font-semibold">Уборка запланирована</p>
                  <p className="text-sm text-muted-foreground">
                    За сутки до уборки мы пришлём смс с напоминанием
                  </p>
                </div>
              </div>
            )}

            <StepLabel n={step} />
            <div className="mt-3 h-px bg-border" />

            {/* STEP 1 */}
            {step === 1 && (
              <div className="mt-6 flex flex-col gap-8">
                <section className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold">Где навести порядок</h2>
                  <Field label="Город">
                    <Select value={city} onChange={setCity}>
                      {activeCities.map((c) => (
                        <option key={c.slug} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                    <Field label="Улица и дом">
                      <input
                        value={street}
                        onChange={(e) => {
                          setStreet(e.target.value);
                          setStreetError(false);
                        }}
                        aria-invalid={streetError}
                        placeholder="ул. Пушкинская, 10"
                        className={cn(inputCls, streetError && "border-destructive")}
                      />
                    </Field>
                    <Field label="Квартира">
                      <input
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder="12"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </section>

                <section className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold">Когда к вам приехать</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select value={date} onChange={setDate}>
                      {dates.map((d) => (
                        <option key={d} value={d}>
                          {formatDateLong(d)}
                        </option>
                      ))}
                    </Select>
                    <Select value={time} onChange={setTime}>
                      {times.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {surge > 0 && (
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Zap className="size-4 fill-sky-400 text-sky-400" />
                      Повышенный спрос. Цена временно увеличена, чтобы привлечь больше клинеров
                    </p>
                  )}
                </section>

                <section className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold">Как удобно заплатить</h2>
                  <div className="flex gap-6 border-b border-border">
                    {(["card", "cash"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPayment(p)}
                        className={cn(
                          "-mb-px border-b-2 pb-3 text-base font-medium transition-colors",
                          payment === p
                            ? "border-brand-500 text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {p === "card" ? "Картой" : "Наличными"}
                      </button>
                    ))}
                  </div>

                  {payment === "card" ? (
                    <div className="flex flex-col gap-4">
                      <p className="text-sm text-muted-foreground">
                        Деньги спишутся только после уборки. Для проверки карты мы спишем 1 рубль и
                        вернём обратно
                      </p>
                      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
                        <div className="relative">
                          <input placeholder="Номер карты" className={cn(inputCls, "pr-16")} />
                          <CreditCard className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                        </div>
                        <input placeholder="ММ/ГГ" className={inputCls} />
                        <input placeholder="CVC" className={inputCls} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Демо: платёж не проводится, данные карты не сохраняются.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Оплата наличными клинеру после приёмки уборки.
                    </p>
                  )}

                  <button type="button" className="w-fit text-sm font-medium text-primary hover:underline">
                    Ввести промокод
                  </button>

                  {bonusBalance > 0 && (
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                      <input
                        type="checkbox"
                        checked={useBonus}
                        onChange={(e) => setUseBonus(e.target.checked)}
                        className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
                      />
                      <span className="text-sm">
                        <span className="font-semibold">Списать бонусы</span> — на счету{" "}
                        {formatPrice(bonusBalance)}. Оплатить можно до 15% заказа:{" "}
                        <span className="font-semibold text-brand-600">
                          −{formatPrice(Math.min(bonusBalance, maxBonus))}
                        </span>
                      </span>
                    </label>
                  )}
                </section>

                <div className="h-px bg-border" />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button size="xl" className="sm:w-72" onClick={goStep1Next}>
                    Запланировать уборку
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Нажимая «Запланировать уборку», я соглашаюсь с{" "}
                    <Link href="/help" className="text-primary hover:underline">
                      условиями обработки данных
                    </Link>{" "}
                    и{" "}
                    <Link href="/help" className="text-primary hover:underline">
                      условиями использования Сервиса
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="mt-6 flex flex-col gap-6">
                <h2 className="text-2xl font-bold">Выберите дополнительные опции</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {bookingOptions.map((opt) => {
                    const Icon = getIcon(opt.icon);
                    const active = optionIds.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleOption(opt.id)}
                        className={cn(
                          "flex flex-col items-center gap-3 rounded-2xl border p-4 text-center transition-all",
                          active
                            ? "border-brand-400 bg-brand-50 shadow-[var(--shadow-sm)]"
                            : "border-border bg-card hover:border-brand-200"
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-10 place-items-center rounded-full",
                            active ? "bg-brand-500 text-white" : "bg-surface-strong text-muted-foreground"
                          )}
                        >
                          {active ? <Check className="size-5" /> : <Icon className="size-5" />}
                        </span>
                        <span className="flex-1 text-sm font-medium leading-snug">{opt.title}</span>
                        <span className="text-sm font-semibold text-brand-600">
                          + {formatPrice(opt.price)}
                          {opt.perUnit ?? ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <Button size="xl" className="sm:w-72" onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                  Далее
                </Button>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="mt-6 flex flex-col gap-8">
                <section className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold">Расскажите о себе</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Электронная почта" hint="Напомним об уборке">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Имя" hint="Так мы будем обращаться к вам в письмах">
                      <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                    </Field>
                  </div>
                </section>

                <section className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold">Помогите клинеру вас найти</h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Подъезд">
                      <input value={entrance} onChange={(e) => setEntrance(e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="Этаж">
                      <input value={floor} onChange={(e) => setFloor(e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="Домофон">
                      <input value={intercom} onChange={(e) => setIntercom(e.target.value)} className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Комментарий для клинера" hint="Как быстрее вас найти и на что обратить внимание во время уборки">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                    />
                  </Field>
                </section>

                <Button size="xl" className="sm:w-72" onClick={() => { setStep(4); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                  Далее
                </Button>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="mt-6 flex flex-col gap-6">
                <h2 className="text-2xl font-bold">Оформить подписку</h2>
                <div className="flex flex-col gap-3">
                  {subscriptions.map((s) => {
                    const active = subscription === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSubscription(s.id)}
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-5 py-4 text-left transition-all",
                          active ? "border-brand-500 bg-brand-50" : "border-border bg-card hover:border-brand-200"
                        )}
                      >
                        <span className="font-semibold">{s.title}</span>
                        {active ? (
                          <Check className="size-5 text-brand-600" />
                        ) : (
                          <span className="text-sm font-semibold text-muted-foreground">ВЫБРАТЬ</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <Button size="xl" className="sm:w-72" onClick={finish} disabled={saving}>
                  {saving ? "Сохраняем…" : "В личный кабинет"}
                </Button>
              </div>
            )}
          </div>

          {/* ── Right: summary ── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <SummaryCard
              rooms={rooms}
              baths={baths}
              date={date}
              time={time}
              durationHours={duration}
              subscription={subscription}
              paymentLabel={step >= 2 ? paymentLabel : undefined}
              price={price}
              bonus={bonusApplied}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
