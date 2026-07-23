"use client";

import * as React from "react";
import { MapPin, User, Plus, HelpCircle, Check, Repeat } from "lucide-react";
import { QuickOrder } from "@/components/profile/quick-order";
import { getIcon } from "@/lib/icons";
import { formatPrice, cn } from "@/lib/utils";
import {
  optionMap,
  subscriptions,
  estimateDurationHours,
  endTime,
  formatDateCard,
  type Booking,
} from "@/lib/booking";

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

  return (
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

      {tab === "done" ? (
        <p className="p-10 text-center text-muted-foreground">
          Здесь появятся выполненные уборки.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} onCancel={() => cancel(b.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking: b, onCancel }: { booking: Booking; onCancel: () => void }) {
  const duration = estimateDurationHours(b.rooms, b.baths);
  const selected = b.optionIds.map((id) => optionMap.get(id)).filter(Boolean).slice(0, 3);

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
          </div>
          <p className="mt-1 text-lg font-semibold text-muted-foreground">
            {b.time} — {endTime(b.time, duration)}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {[b.city, b.street, b.apartment && `кв. ${b.apartment}`].filter(Boolean).join(", ")}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
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
          </div>
        </div>

        <div className="hidden shrink-0 flex-col items-center gap-2 sm:flex">
          <span className="grid size-20 place-items-center rounded-full border-2 border-dashed border-border text-muted-foreground">
            <User className="size-8" />
          </span>
          <span className="text-sm text-muted-foreground">Ищем клинера</span>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {selected.map((o) => {
            const Icon = getIcon(o!.icon);
            return (
              <div key={o!.id} className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center">
                <Icon className="size-5 text-muted-foreground" />
                <span className="text-xs font-medium leading-snug">{o!.title}</span>
                <span className="text-sm font-semibold text-brand-600">+ {formatPrice(o!.price)}</span>
              </div>
            );
          })}
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-center text-muted-foreground">
            <Plus className="size-5" />
            <span className="text-xs font-medium">Показать ещё опции</span>
          </div>
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
