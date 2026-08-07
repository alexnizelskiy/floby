"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useAuth, useRoleFlags } from "@/components/auth/auth-provider";
import { SmsAuthModal } from "@/features/booking/sms-auth-modal";
import {
  walkDurations,
  walkPrice,
  petHasOptions,
  accessOptions,
  emptyPetWalkDraft,
  getPetDraft,
  savePetDraft,
  clearPetDraft,
  type PetWalkDraft,
} from "@/lib/pets";

const STEPS = ["Начало", "Питомец", "Поведение", "Выгул", "Контакты"];
const MASCOT: Record<number, string> = {
  0: "Гав! Я помогу подобрать проверенного выгульщика для вашего питомца.",
  1: "Расскажите про питомца — так мы учтём все нюансы прогулки.",
  2: "Теперь про поведение — чтобы всё прошло спокойно и безопасно.",
  3: "Осталось выбрать длительность и детали выгула.",
  4: "Последний шаг — ваши контакты, и мы подберём выгульщика.",
};

const inputCls =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-base focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

function Choice({
  options,
  value,
  onChange,
  cols = "sm:grid-cols-2",
}: {
  options: { v: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  cols?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-2.5", cols)}>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          aria-pressed={value === o.v}
          className={cn(
            "flex items-center gap-2.5 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
            value === o.v ? "border-brand-500" : "border-border hover:border-brand-300"
          )}
        >
          <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2", value === o.v ? "border-brand-500" : "border-input")}>
            {value === o.v && <span className="size-2.5 rounded-full bg-brand-500" />}
          </span>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Q({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-bold">{title}</h3>
      {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function PetOrderWizard() {
  const router = useRouter();
  const { user, refresh: refreshAuth } = useAuth();
  const { canOrder, dashboardPath, loading: roleLoading } = useRoleFlags();

  React.useEffect(() => {
    if (!roleLoading && !canOrder && dashboardPath) router.replace(dashboardPath);
  }, [roleLoading, canOrder, dashboardPath, router]);

  const [step, setStep] = React.useState(0);
  const [d, setD] = React.useState<PetWalkDraft>(emptyPetWalkDraft);
  const [contact, setContact] = React.useState({ name: "", phone: "", email: "", address: "" });
  const [consent, setConsent] = React.useState(true);
  const [smsOpen, setSmsOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    const saved = getPetDraft();
    if (saved) setD({ ...emptyPetWalkDraft, ...saved });
    fetch("/api/auth/me").then((r) => r.json()).then((data) => {
      if (data.user) {
        setContact((c) => ({ ...c, name: c.name || data.user.name || "", phone: c.phone || data.user.phone || "" }));
      }
    }).catch(() => {});
  }, []);

  React.useEffect(() => { savePetDraft(d); }, [d]);

  const firstWalk = d.returning === "no";
  const total = walkPrice(d.walk.durationMin, firstWalk);

  const setPet = (patch: Partial<PetWalkDraft["pet"]>) => setD((s) => ({ ...s, pet: { ...s.pet, ...patch } }));
  const setBeh = (patch: Partial<PetWalkDraft["behavior"]>) => setD((s) => ({ ...s, behavior: { ...s.behavior, ...patch } }));
  const setWalk = (patch: Partial<PetWalkDraft["walk"]>) => setD((s) => ({ ...s, walk: { ...s.walk, ...patch } }));

  function next() {
    setErr("");
    if (step === 0 && !d.returning) return setErr("Выберите вариант");
    if (step === 1 && !d.pet.name.trim()) return setErr("Укажите кличку питомца");
    if (step === 3 && !d.walk.durationMin) return setErr("Выберите длительность");
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setErr("");
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitOrder() {
    const data = {
      kind: "pet_walk",
      title: `Выгул ${d.walk.durationMin} мин`,
      services: [{ id: "pet_walk", title: `Выгул ${d.walk.durationMin} мин`, qty: 1, price: total }],
      pet: d.pet,
      behavior: d.behavior,
      walk: d.walk,
      firstWalk,
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      street: contact.address,
      city: "Ростов-на-Дону",
      payment: "card",
      price: { total },
    };
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, total }),
    });
    if (res.status === 401) return false;
    if (!res.ok) throw new Error();
    const { id } = (await res.json()) as { id: string };
    clearPetDraft();
    const pay = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: id }),
    }).then((r) => r.json()).catch(() => ({ ok: false }));
    if (pay.ok && pay.url) { window.location.href = pay.url; return true; }
    router.push("/profile");
    return true;
  }

  async function finish() {
    setErr("");
    if (!contact.name.trim()) return setErr("Укажите имя");
    if (contact.phone.replace(/\D/g, "").length < 10) return setErr("Укажите телефон");
    if (!consent) return setErr("Нужно согласие на обработку данных");
    setSaving(true);
    try {
      if (!user) {
        // not logged in — verify phone, then submit
        setSaving(false);
        setSmsOpen(true);
        return;
      }
      const ok = await submitOrder();
      if (!ok) { setSaving(false); setSmsOpen(true); }
    } catch {
      setSaving(false);
      setErr("Не удалось оформить заказ. Попробуйте ещё раз.");
    }
  }

  if (!roleLoading && !canOrder) {
    return <div className="container-page py-14"><div className="h-64 rounded-3xl border border-border bg-card" /></div>;
  }

  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-center text-3xl font-bold md:text-4xl">Заказать выгул в Ростове-на-Дону</h1>

      {/* Progress */}
      <div className="mx-auto mt-6 flex max-w-3xl gap-1.5">
        {STEPS.map((_, i) => (
          <span key={i} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-brand-500" : "bg-surface-strong")} />
        ))}
      </div>

      <div className="mx-auto mt-8 grid max-w-3xl gap-6 md:grid-cols-[220px_1fr]">
        {/* Mascot */}
        <aside className="hidden md:block">
          <div className="flex items-start gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-100 text-2xl">🐶</span>
          </div>
          <div className="mt-2 rounded-2xl bg-brand-50 p-4">
            <p className="text-sm font-bold text-brand-700">Денди</p>
            <p className="mt-1 text-sm text-muted-foreground">{MASCOT[step]}</p>
          </div>
        </aside>

        {/* Step body */}
        <div className="rounded-3xl border border-border bg-card p-5 md:p-7">
          <div className="flex flex-col gap-6">
            {step === 0 && (
              <Q title="Вы заказывали у нас раньше?">
                <Choice
                  value={d.returning ?? ""}
                  onChange={(v) => setD((s) => ({ ...s, returning: v as "yes" | "no" }))}
                  options={[{ v: "yes", label: "Да" }, { v: "no", label: "Нет" }]}
                />
              </Q>
            )}

            {step === 1 && (
              <>
                <Q title="Как зовут питомца?">
                  <input className={inputCls} placeholder="Арчи" value={d.pet.name} onChange={(e) => setPet({ name: e.target.value })} />
                </Q>
                <Q title="Какая порода?">
                  <input className={inputCls} placeholder="Кавалер кинг-чарльз-спаниель" value={d.pet.breed} onChange={(e) => setPet({ breed: e.target.value })} />
                </Q>
                <Choice value={d.pet.gender ?? ""} onChange={(v) => setPet({ gender: v as "female" | "male" })} options={[{ v: "female", label: "Девочка" }, { v: "male", label: "Мальчик" }]} />
                <Q title="День рождения любимца" hint="Можно приблизительно">
                  <input className={inputCls} placeholder="10.02.2024" value={d.pet.birthday} onChange={(e) => setPet({ birthday: e.target.value })} />
                </Q>
                <Q title="Вес питомца" hint={`Приблизительно, ${d.pet.weight} кг`}>
                  <input type="range" min={1} max={60} value={d.pet.weight} onChange={(e) => setPet({ weight: Number(e.target.value) })} className="w-full accent-[var(--primary)]" />
                </Q>
                <Q title="Что из этого есть у питомца?" hint="Отметьте один или несколько вариантов">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {petHasOptions.map((o) => {
                      const on = d.pet.has.includes(o);
                      return (
                        <button key={o} type="button" onClick={() => setPet({ has: on ? d.pet.has.filter((x) => x !== o) : [...d.pet.has, o] })}
                          className={cn("flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors", on ? "border-brand-500" : "border-border hover:border-brand-300")}>
                          <span className={cn("grid size-5 shrink-0 place-items-center rounded border-2", on ? "border-brand-500 bg-brand-500 text-white" : "border-input")}>{on && "✓"}</span>
                          {o}
                        </button>
                      );
                    })}
                  </div>
                </Q>
                <Q title="В какую ветклинику ходите?">
                  <input className={inputCls} value={d.pet.clinic} onChange={(e) => setPet({ clinic: e.target.value })} />
                </Q>
                <Q title="Есть ли болезни у питомца?">
                  <Choice value={d.pet.hasIllness ?? ""} onChange={(v) => setPet({ hasIllness: v as "no" | "yes" })} options={[{ v: "no", label: "Нет" }, { v: "yes", label: "Да" }]} />
                  {d.pet.hasIllness === "yes" && (
                    <textarea className={cn(inputCls, "mt-2.5 h-auto py-3")} rows={2} placeholder="Опишите" value={d.pet.illnessText} onChange={(e) => setPet({ illnessText: e.target.value })} />
                  )}
                </Q>
              </>
            )}

            {step === 2 && (
              <>
                <Q title="Тянет за поводок?">
                  <Choice cols="sm:grid-cols-3" value={d.behavior.pullsLeash} onChange={(v) => setBeh({ pullsLeash: v })} options={[{ v: "Нет", label: "Нет" }, { v: "Иногда", label: "Иногда" }, { v: "Сильно", label: "Сильно" }]} />
                </Q>
                <Q title="Подбирает с земли?">
                  <Choice cols="sm:grid-cols-3" value={d.behavior.picksUp} onChange={(v) => setBeh({ picksUp: v })} options={[{ v: "Нет", label: "Нет" }, { v: "Иногда", label: "Иногда" }, { v: "Сильно", label: "Сильно" }]} />
                </Q>
                <Q title="Если подберёт, можно отобрать?">
                  <Choice cols="sm:grid-cols-3" value={d.behavior.canTakeAway} onChange={(v) => setBeh({ canTakeAway: v })} options={[{ v: "Нет", label: "Нет" }, { v: "Да", label: "Да" }, { v: "Будет сложно", label: "Будет сложно" }]} />
                </Q>
                <Q title="Есть к чему-то агрессия?">
                  <Choice value={d.behavior.aggression} onChange={(v) => setBeh({ aggression: v })} options={[{ v: "Нет", label: "Нет" }, { v: "Да", label: "Да" }]} />
                </Q>
                <Q title="Можно отпускать на площадке без поводка?">
                  <Choice value={d.behavior.offLeash} onChange={(v) => setBeh({ offLeash: v })} options={[{ v: "Да", label: "Да" }, { v: "Нет", label: "Нет" }]} />
                </Q>
                <Q title="Можно контактировать с другими собаками?">
                  <Choice value={d.behavior.contactDogs} onChange={(v) => setBeh({ contactDogs: v })} options={[{ v: "Да", label: "Да" }, { v: "Нет", label: "Нет" }]} />
                </Q>
              </>
            )}

            {step === 3 && (
              <>
                <Q title="Какая длительность выгула нужна питомцу?" hint="Цена без учёта накопленной скидки и доп. услуг">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {walkDurations.map((w) => (
                      <button key={w.min} type="button" onClick={() => setWalk({ durationMin: w.min })} aria-pressed={d.walk.durationMin === w.min}
                        className={cn("flex items-center justify-between gap-2 rounded-xl border px-4 py-3.5 text-sm font-medium transition-colors", d.walk.durationMin === w.min ? "border-brand-500" : "border-border hover:border-brand-300")}>
                        <span className="flex items-center gap-2.5">
                          <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2", d.walk.durationMin === w.min ? "border-brand-500" : "border-input")}>
                            {d.walk.durationMin === w.min && <span className="size-2.5 rounded-full bg-brand-500" />}
                          </span>
                          {w.min} минут
                        </span>
                        <span className="text-muted-foreground">{formatPrice(firstWalk ? w.first : w.price)}</span>
                      </button>
                    ))}
                  </div>
                  {firstWalk && (
                    <p className="mt-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
                      🎁 Первый выгул — со скидкой. {d.walk.durationMin} минут за <b>{formatPrice(walkPrice(d.walk.durationMin, true))}</b>.
                    </p>
                  )}
                </Q>
                <Q title="Как часто требуются выгулы?">
                  <Choice value={d.walk.frequency} onChange={(v) => setWalk({ frequency: v })} options={[{ v: "В конкретные даты", label: "В конкретные даты" }, { v: "По расписанию", label: "По постоянному расписанию" }]} />
                </Q>
                <Q title="По какому расписанию надо гулять?" hint="Например, в ПН с 9 до 11 и в ЧТ с 18 до 20">
                  <textarea className={cn(inputCls, "h-auto py-3")} rows={2} value={d.walk.schedule} onChange={(e) => setWalk({ schedule: e.target.value })} />
                </Q>
                <Q title="Покормить после прогулки?">
                  <Choice value={d.walk.feed} onChange={(v) => setWalk({ feed: v })} options={[{ v: "Да", label: "Да" }, { v: "Нет", label: "Нет" }]} />
                </Q>
                <Q title="Помыть лапки после прогулки?">
                  <Choice value={d.walk.washPaws} onChange={(v) => setWalk({ washPaws: v })} options={[{ v: "Да", label: "Да" }, { v: "Нет", label: "Нет" }]} />
                </Q>
                <Q title="Как нам попасть к питомцу?">
                  <Choice value={d.walk.access} onChange={(v) => setWalk({ access: v })} options={accessOptions.map((a) => ({ v: a, label: a }))} />
                </Q>
                <Q title="Нужно ли что-то дополнительно знать?">
                  <textarea className={cn(inputCls, "h-auto py-3")} rows={2} placeholder="Например, лапы мыть только своим шампунем" value={d.walk.notes} onChange={(e) => setWalk({ notes: e.target.value })} />
                </Q>
              </>
            )}

            {step === 4 && (
              <>
                <Q title="Как вас зовут?">
                  <input className={inputCls} placeholder="Наталья" value={contact.name} onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))} />
                </Q>
                <Q title="Телефон">
                  <input type="tel" inputMode="tel" className={inputCls} placeholder="+7 (___) ___-__-__" value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} />
                </Q>
                <Q title="E-mail" hint="Для отчётов и подтверждений">
                  <input type="email" className={inputCls} placeholder="you@mail.ru" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} />
                </Q>
                <Q title="Ваш адрес" hint="Куда приехать выгульщику">
                  <input className={inputCls} placeholder="ул. Пушкинская, 10, кв. 5" value={contact.address} onChange={(e) => setContact((c) => ({ ...c, address: e.target.value }))} />
                </Q>
                <div className="rounded-xl bg-surface-strong p-4 text-sm">
                  <div className="flex items-baseline justify-between">
                    <span className="text-muted-foreground">К оплате</span>
                    <span className="text-2xl font-bold">{formatPrice(total)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Выгул {d.walk.durationMin} мин{firstWalk ? " · первый выгул со скидкой" : ""}. Спишем за 24 часа до прогулки.</p>
                </div>
                <label className="flex items-start gap-2.5 text-sm">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 accent-[var(--primary)]" />
                  <span>Даю согласие на обработку персональных данных в соответствии с{" "}
                    <Link href="/privacy" className="text-primary hover:underline">политикой конфиденциальности</Link>.
                  </span>
                </label>
              </>
            )}

            {err && <p className="text-sm text-destructive">{err}</p>}

            {/* Nav */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              {step > 0 && (
                <button type="button" onClick={back} className="grid size-11 place-items-center rounded-full bg-surface-strong text-foreground hover:bg-border">
                  <ArrowLeft className="size-5" />
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-base font-semibold text-white hover:bg-brand-600">
                  Далее <ArrowRight className="size-4" />
                </button>
              ) : (
                <button type="button" onClick={finish} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-base font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
                  {saving ? "Оформляем…" : "Оформить заказ"} <ArrowRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <SmsAuthModal
        open={smsOpen}
        phone={contact.phone}
        onClose={() => setSmsOpen(false)}
        onVerified={async () => {
          setSmsOpen(false);
          refreshAuth();
          setSaving(true);
          try { await submitOrder(); } catch { setSaving(false); setErr("Не удалось оформить заказ."); }
        }}
      />
    </div>
  );
}
