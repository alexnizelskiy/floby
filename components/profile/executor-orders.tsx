"use client";

import * as React from "react";
import { MapPin, Phone, User, Wallet, CheckCircle2, Star, Camera, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import { formatDateCard, endTime, estimateDurationHours, optionMap, type Booking } from "@/lib/booking";

interface Order extends Booking {
  total: number;
  client: { phone: string; name: string | null };
}

interface ExecStats {
  doneCount: number;
  activeCount: number;
  earned: number;
  gross: number;
  sharePercent: number;
  rating: { avg: number; count: number };
}

const STATUS: Record<string, { label: string; cls: string }> = {
  assigned: { label: "Назначен вам", cls: "bg-surface-strong text-foreground" },
  in_progress: { label: "В работе", cls: "bg-warning/15 text-warning" },
  done: { label: "Выполнен", cls: "bg-brand-100 text-brand-700" },
};

export function ExecutorOrders() {
  const [orders, setOrders] = React.useState<Order[] | null>(null);
  const [stats, setStats] = React.useState<ExecStats | null>(null);

  const load = React.useCallback(async () => {
    const [o, s] = await Promise.all([
      fetch("/api/executor/orders").then((x) => x.json()).catch(() => null),
      fetch("/api/executor/stats").then((x) => x.json()).catch(() => null),
    ]);
    setOrders(o?.ok ? o.orders : []);
    setStats(s?.ok ? s.stats : null);
  }, []);
  React.useEffect(() => { load(); }, [load]);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/executor/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (orders === null) return <div className="h-24 rounded-2xl border border-border bg-card" />;
  // Скрываем блок, только если человек ещё не исполнитель (нет ни заказов, ни статистики)
  const hasHistory = (stats?.doneCount ?? 0) > 0 || (stats?.activeCount ?? 0) > 0;
  if (orders.length === 0 && !hasHistory) return null;

  return (
    <section className="rounded-2xl border border-brand-200 bg-brand-50/40 p-5 md:p-6">
      <h2 className="text-lg font-bold">Кабинет клинера</h2>

      {stats && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Wallet className="size-4" /> Заработано
            </p>
            <p className="mt-1 text-2xl font-bold">{formatPrice(stats.earned)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {stats.sharePercent}% от {formatPrice(stats.gross)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4" /> Выполнено уборок
            </p>
            <p className="mt-1 text-2xl font-bold">{stats.doneCount}</p>
            {stats.activeCount > 0 && (
              <p className="mt-0.5 text-xs text-muted-foreground">{stats.activeCount} в работе</p>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Star className="size-4" /> Ваш рейтинг
            </p>
            <p className="mt-1 flex items-baseline gap-1 text-2xl font-bold">
              {stats.rating.count > 0 ? (
                <>
                  {stats.rating.avg.toFixed(1)}
                  <Star className="size-5 self-center fill-warning text-warning" />
                </>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {stats.rating.count > 0 ? `по ${stats.rating.count} оценкам` : "пока нет оценок"}
            </p>
          </div>
        </div>
      )}

      <h3 className="mt-6 text-base font-bold">Заказы на исполнение</h3>
      {orders.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Сейчас нет назначенных заказов. Новые появятся здесь.
        </p>
      ) : (
      <div className="mt-4 flex flex-col gap-3">
        {orders.map((o) => {
          const dur = estimateDurationHours(o.rooms, o.baths);
          const st = STATUS[o.status] ?? STATUS.assigned;
          return (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{o.date ? formatDateCard(o.date) : "—"} · {o.time} — {o.time ? endTime(o.time, dur) : ""}</p>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", st.cls)}>{st.label}</span>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    {[o.city, o.street, o.apartment && `кв. ${o.apartment}`].filter(Boolean).join(", ")}
                    {(o.entrance || o.floor || o.intercom) && (
                      <span> · подъезд {o.entrance || "—"}, этаж {o.floor || "—"}, домофон {o.intercom || "—"}</span>
                    )}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm">
                    <User className="size-4 text-muted-foreground" /> {o.client.name || "Клиент"} ·
                    <a href={`tel:${o.client.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                      <Phone className="size-3.5" /> {o.client.phone}
                    </a>
                  </p>
                  {o.services && o.services.length > 0 ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Опции: {o.services.map((s) => (s.qty > 1 ? `${s.title} ×${s.qty}` : s.title)).join(", ")}
                    </p>
                  ) : o.optionIds && o.optionIds.length > 0 ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Опции: {o.optionIds.map((id) => optionMap.get(id)?.title ?? id).join(", ")}
                    </p>
                  ) : null}
                  {o.comment && (
                    <p className="mt-1 text-sm"><span className="text-muted-foreground">Пожелания: </span>{o.comment}</p>
                  )}
                </div>
                <p className="text-lg font-bold">{formatPrice(o.total)}</p>
              </div>

              <div className="mt-4 flex gap-3 border-t border-border pt-4">
                {o.status === "assigned" && (
                  <Button size="sm" onClick={() => setStatus(o.id, "in_progress")}>Взять в работу</Button>
                )}
                {o.status === "in_progress" && (
                  <Button size="sm" onClick={() => setStatus(o.id, "done")}>Завершить уборку</Button>
                )}
                {o.status === "done" && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                    <CheckCircle2 className="size-4" /> Заказ выполнен
                  </span>
                )}
              </div>

              {(o.status === "in_progress" || o.status === "done") && (
                <OrderPhotoUpload bookingId={o.id} />
              )}
            </div>
          );
        })}
      </div>
      )}
    </section>
  );
}

const UPLOAD_ERR: Record<string, string> = {
  missing_files: "Добавьте оба фото — «до» и «после»",
  unsupported_type: "Только JPG, PNG или WebP",
  too_large: "Файл больше 8 МБ",
  storage_unavailable: "Загрузка фото пока недоступна",
};

/** Executor uploads a before/after pair tied to this order (goes to moderation). */
function OrderPhotoUpload({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [err, setErr] = React.useState("");
  const beforeRef = React.useRef<HTMLInputElement>(null);
  const afterRef = React.useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const before = beforeRef.current?.files?.[0];
    const after = afterRef.current?.files?.[0];
    if (!before || !after) {
      setErr(UPLOAD_ERR.missing_files);
      return;
    }
    const fd = new FormData();
    fd.append("before", before);
    fd.append("after", after);
    fd.append("bookingId", bookingId);
    setBusy(true);
    const r = await fetch("/api/gallery", { method: "POST", body: fd })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "upload_failed" }));
    setBusy(false);
    if (r.ok) setDone(true);
    else setErr(UPLOAD_ERR[r.error] ?? "Не удалось загрузить");
  }

  if (done) {
    return (
      <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
        <Check className="size-4" /> Фото отправлены на модерацию
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <Camera className="size-4" /> Добавить фото до/после
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 rounded-xl border border-dashed border-border bg-surface p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-muted-foreground">Фото «до»</span>
          <input ref={beforeRef} type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted-foreground">Фото «после»</span>
          <input ref={afterRef} type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
        </label>
      </div>
      {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
      <div className="mt-3 flex gap-2">
        <Button size="sm" type="submit" disabled={busy}>
          {busy ? "Загрузка…" : "Отправить"}
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => setOpen(false)}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
