"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn, formatPrice, formatPhoneRu } from "@/lib/utils";
import { CalculatorControls } from "@/features/calculator/calculator-controls";
import {
  computeCalc,
  calcTitle,
  getCalcDraft,
  saveCalcDraft,
  defaultCalcState,
  type CalcState,
} from "@/lib/calc";
import { generateDates, generateTimes, formatDateLong } from "@/lib/booking";
import { useAuth } from "@/components/auth/auth-provider";
import { usePricing } from "@/components/pricing/pricing-provider";

const dates = generateDates(14);
const times = generateTimes();

const fieldCls =
  "h-12 w-full rounded-2xl border border-border bg-white px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

export function HomeCalculator() {
  const router = useRouter();
  const { user } = useAuth();
  const pricing = usePricing();
  const [state, setState] = React.useState<CalcState>(defaultCalcState);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [promo, setPromo] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [errors, setErrors] = React.useState<{ name?: boolean; phone?: boolean }>({});

  // restore previous draft (e.g. user came back from auth)
  React.useEffect(() => {
    const d = getCalcDraft();
    if (d) {
      setState({ rooms: d.rooms, cleaningType: d.cleaningType, propertyType: d.propertyType, addons: d.addons });
      if (d.name) setName(d.name);
      if (d.phone) setPhone(d.phone);
      if (d.date) setDate(d.date);
      if (d.time) setTime(d.time);
      if (d.promo) setPromo(d.promo);
      if (d.comment) setComment(d.comment);
    }
  }, []);

  // Prefill contact fields from the profile once the user is known.
  React.useEffect(() => {
    if (!user) return;
    if (user.name) setName((prev) => prev || user.name!);
    if (user.phone) setPhone((prev) => prev || user.phone!);
  }, [user]);

  const result = React.useMemo(() => computeCalc(state, pricing), [state, pricing]);

  function order() {
    const nextErrors = {
      name: !name.trim(),
      phone: phone.replace(/\D/g, "").length < 10,
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.phone) return;

    saveCalcDraft({ ...state, name, phone, date, time, promo, comment });
    router.push("/booking");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      {/* Controls */}
      <div className="rounded-3xl border border-border bg-card p-5 md:p-7">
        <CalculatorControls state={state} onChange={setState} />
      </div>

      {/* Order card */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 md:p-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{calcTitle(state.rooms, state.propertyType)}</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">К оплате</span>
              <span className="text-3xl font-bold">{formatPrice(result.total)}</span>
            </div>
            <p className="mt-1 text-right text-xs text-muted-foreground">
              Примерное время уборки {result.durationLabel}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <div>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: false })); }}
                placeholder="Укажите имя"
                aria-invalid={errors.name}
                className={cn(fieldCls, errors.name && "border-destructive")}
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">Укажите имя</p>}
            </div>
            <div>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => { setPhone(formatPhoneRu(e.target.value)); setErrors((x) => ({ ...x, phone: false })); }}
                placeholder="+7 (___) ___-__-__"
                aria-invalid={errors.phone}
                className={cn(fieldCls, errors.phone && "border-destructive")}
              />
              {errors.phone && <p className="mt-1 text-xs text-destructive">Укажите телефон</p>}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <SelectField value={date} onChange={setDate} placeholder="Дата">
                {dates.map((d) => (
                  <option key={d} value={d}>{formatDateLong(d)}</option>
                ))}
              </SelectField>
              <SelectField value={time} onChange={setTime} placeholder="Время">
                {times.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </SelectField>
            </div>

            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value.toUpperCase())}
              placeholder="Промокод"
              className={cn(fieldCls, "uppercase")}
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Комментарий к заказу (например, помыть кота или забрать вещи из химчистки)"
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            />
          </div>

          <button
            type="button"
            onClick={order}
            className="h-13 rounded-2xl bg-brand-500 text-base font-semibold text-white transition-colors hover:bg-brand-600"
          >
            Заказать
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Нажимая кнопку, вы принимаете{" "}
            <Link href="/offer" className="underline underline-offset-2 hover:text-foreground">условия оферты</Link>{" "}
            и даёте согласие на{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">обработку персональных данных</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

function SelectField({
  value,
  onChange,
  placeholder,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(fieldCls, "appearance-none pr-9", !value && "text-muted-foreground")}
      >
        <option value="" disabled>{placeholder}</option>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
