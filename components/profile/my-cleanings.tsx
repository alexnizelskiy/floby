"use client";

import * as React from "react";
import { MapPin, User, Plus, HelpCircle, Check, Repeat, Star, ChevronDown } from "lucide-react";
import { QuickOrder } from "@/components/profile/quick-order";
import { RateOrder } from "@/components/profile/rate-order";
import { getIcon } from "@/lib/icons";
import { formatPrice, cn } from "@/lib/utils";
import {
  optionMap,
  subscriptions,
  estimateDurationHours,
  endTime,
  formatDateCard,
  generateDates,
  generateTimes,
  formatDateLong,
  type Booking,
} from "@/lib/booking";

const rescheduleDates = generateDates(14);
const rescheduleTimes = generateTimes();

export function MyCleanings() {
  const [bookings, setBookings] = React.useState<Booking[] | null>(null);
  const [tab, setTab] = React.useState<"upcoming" | "done">("upcoming");

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(res.ok && data.ok ? (data.bookings as Booking[]) : []);
    } catch {
      setBookings([]);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function cancel(id: string) {
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    load();
  }

  // initial (SSR / not yet read) — render nothing to avoid hydration flicker
  if (bookings === null) {
    return <div className="h-40 rounded-2xl border border-border bg-card" />;
  }

  if (bookings.length === 0) {
    return <QuickOrder />;
  }

  const upcoming = bookings.filter((b) => b.status !== "done" && b.status !== "cancelled");
  const done = bookings.filter((b) => b.status === "done");
  const list = tab === "done" ? done : upcoming;

  return (
    <div className="flex flex-col gap-5">
    <PreferredCleanerCard />
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex gap-6 border-b border-border px-6 pt-5">
        {(
          [
            ["upcoming", "Ближайшие"],
            ["done", "Выполненные"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "-mb-px border-b-2 pb-3 text-base font-semibold transition-colors",
              tab === id
                ? "border-brand-500 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="p-10 text-center text-muted-foreground">
          {tab === "done"
            ? "Здесь появятся выполненные уборки."
            : "Нет запланированных уборок."}
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {list.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onCancel={() => cancel(b.id)}
              onReviewed={load}
            />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

function PreferredCleanerCard() {
  const [cleaner, setCleaner] = React.useState<{ name: string; rating: number; doneCount: number } | null>(null);

  React.useEffect(() => {
    fetch("/api/profile/cleaner")
      .then((r) => r.json())
      .then((d) => d.ok && setCleaner(d.cleaner))
      .catch(() => {});
  }, []);

  if (!cleaner) return null;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
      <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
        {cleaner.name[0]?.toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-700">
          <Repeat className="size-4" /> Ваш постоянный клинер
        </p>
        <p className="mt-0.5 text-lg font-bold">{cleaner.name}</p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          {cleaner.rating > 0 && (
            <span className="inline-flex items-center gap-1">
              <Star className="size-4 fill-warning text-warning" /> {cleaner.rating.toFixed(1)}
            </span>
          )}
          {cleaner.doneCount > 0 && <span>{cleaner.doneCount} уборок для вас и других</span>}
        </p>
      </div>
    </div>
  );
}

function BookingCard({
  booking: b,
  onCancel,
  onReviewed,
}: {
  booking: Booking;
  onCancel: () => void;
  onReviewed: () => void;
}) {
  const duration = estimateDurationHours(b.rooms, b.baths);
  // предпочитаем читаемый список услуг из калькулятора, иначе старые optionIds
  const selected = (b.services && b.services.length > 0
    ? b.services.map((s) => ({ id: s.id, title: s.qty > 1 ? `${s.title} ×${s.qty}` : s.title, price: s.price }))
    : b.optionIds
        .map((id) => optionMap.get(id))
        .filter(Boolean)
        .map((o) => ({ id: o!.id, title: o!.title, price: o!.price }))
  ).slice(0, 8);
  const isDone = b.status === "done";

  const [rescheduling, setRescheduling] = React.useState(false);
  const [rDate, setRDate] = React.useState(b.date);
  const [rTime, setRTime] = React.useState(b.time);
  const [busy, setBusy] = React.useState(false);

  async function patch(payload: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/bookings/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      onReviewed();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xl font-bold">{formatDateCard(b.date)}</p>
            {b.subscription && b.subscription !== "none" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                <Repeat className="size-3.5" />
                {subscriptions.find((s) => s.id === b.subscription)?.title}
              </span>
            )}
            {isDone && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                <Check className="size-3.5" /> Выполнена
              </span>
            )}
          </div>
          <p className="mt-1 text-lg font-semibold text-muted-foreground">
            {b.time} — {endTime(b.time, duration)}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {[b.city, b.street, b.apartment && `кв. ${b.apartment}`].filter(Boolean).join(", ")}
          </p>
          {isDone ? (
            <div className="mt-4">
              {b.reviewed ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <Star className="size-4 fill-warning text-warning" /> Вы оценили уборку
                </span>
              ) : (
                <RateOrder bookingId={b.id} onDone={onReviewed} />
              )}
            </div>
          ) : rescheduling ? (
            <div className="mt-4 flex flex-col gap-3">
              <div className="grid max-w-md grid-cols-2 gap-2">
                <SlotSelect value={rDate} onChange={setRDate}>
                  {rescheduleDates.map((d) => (
                    <option key={d} value={d}>{formatDateLong(d)}</option>
                  ))}
                </SlotSelect>
                <SlotSelect value={rTime} onChange={setRTime}>
                  {rescheduleTimes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </SlotSelect>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => { await patch({ action: "reschedule", date: rDate, time: rTime }); setRescheduling(false); }}
                  className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                >
                  {busy ? "Сохраняем…" : "Сохранить"}
                </button>
                <button
                  type="button"
                  onClick={() => { setRescheduling(false); setRDate(b.date); setRTime(b.time); }}
                  className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setRescheduling(true)}
                className="rounded-xl bg-ink-950 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-900"
              >
                Перенести
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
              >
                Отменить
              </button>
              {b.subscription && b.subscription !== "none" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => patch({ action: "cancel_subscription" })}
                  className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface disabled:opacity-50"
                >
                  Отменить подписку
                </button>
              )}
            </div>
          )}
        </div>

        {b.assignee ? (
          <div className="hidden w-36 shrink-0 flex-col items-center gap-1.5 text-center sm:flex">
            <span className="grid size-20 place-items-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
              {b.assignee.name[0]?.toUpperCase()}
            </span>
            <span className="text-sm font-semibold">{b.assignee.name}</span>
            {b.assignee.rating > 0 && (
              <span className="inline-flex items-center gap-1 text-sm font-medium">
                <Star className="size-4 fill-warning text-warning" />
                {b.assignee.rating.toFixed(1)}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {b.assignee.doneCount > 0 ? `${b.assignee.doneCount} уборок` : "Ваш клинер"}
            </span>
            {b.subscription && b.subscription !== "none" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                <Repeat className="size-3" /> Постоянный
              </span>
            )}
          </div>
        ) : (
          <div className="hidden shrink-0 flex-col items-center gap-2 sm:flex">
            <span className="grid size-20 place-items-center rounded-full border-2 border-dashed border-border text-muted-foreground">
              <User className="size-8" />
            </span>
            <span className="text-sm text-muted-foreground">
              {isDone ? "Уборка завершена" : "Ищем клинера"}
            </span>
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {selected.map((o) => (
            <span key={o.id} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium">
              {o.title}
              {o.price > 0 && <span className="font-semibold text-brand-600">+{formatPrice(o.price)}</span>}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">К оплате:</span>
          <span className="font-bold">{formatPrice(b.price.total)}</span>
          <HelpCircle className="size-4 text-muted-foreground" />
        </p>
        {b.paid ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
            <Check className="size-3.5" /> Оплачено картой
          </span>
        ) : (
          <span className="rounded-full bg-surface-strong px-3 py-1 text-xs font-medium text-muted-foreground">
            Оплата наличными
          </span>
        )}
      </div>
    </div>
  );
}

function SlotSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-input bg-background px-3 pr-9 text-sm focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
