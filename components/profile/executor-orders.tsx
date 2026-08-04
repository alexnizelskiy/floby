"use client";

import * as React from "react";
import { MapPin, Phone, User, Wallet, CheckCircle2, Star, Camera, Check, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import { formatDateCard, endTime, estimateDurationHours, optionMap, type Booking } from "@/lib/booking";
import { ExecutorPayout } from "@/components/profile/executor-payout";

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

interface ExecReview {
  id: string;
  name: string;
  initials: string;
  rating: number;
  text: string | null;
  service: string | null;
  date: string;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  assigned: { label: "Назначен вам", cls: "bg-surface-strong text-foreground" },
  in_progress: { label: "В работе", cls: "bg-warning/15 text-warning" },
  done: { label: "Выполнен", cls: "bg-brand-100 text-brand-700" },
};

function todayStr(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function mapsUrl(o: Order): string {
  const addr = [o.city, o.street, o.apartment && `кв ${o.apartment}`].filter(Boolean).join(", ");
  return `https://yandex.ru/maps/?text=${encodeURIComponent(addr)}`;
}

export function ExecutorOrders() {
  const [orders, setOrders] = React.useState<Order[] | null>(null);
  const [stats, setStats] = React.useState<ExecStats | null>(null);
  const [reviews, setReviews] = React.useState<ExecReview[]>([]);

  const load = React.useCallback(async () => {
    const [o, s, r] = await Promise.all([
      fetch("/api/executor/orders").then((x) => x.json()).catch(() => null),
      fetch("/api/executor/stats").then((x) => x.json()).catch(() => null),
      fetch("/api/executor/reviews").then((x) => x.json()).catch(() => null),
    ]);
    setOrders(o?.ok ? o.orders : []);
    setStats(s?.ok ? s.stats : null);
    setReviews(r?.ok ? r.reviews : []);
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

  if (orders === null) return <div className="h-40 rounded-2xl border border-border bg-card" />;

  const share = stats?.sharePercent ?? 70;
  const today = todayStr();
  const active = orders.filter((o) => o.status === "assigned" || o.status === "in_progress");
  const byDateAsc = (a: Order, b: Order) => `${a.date ?? ""}${a.time ?? ""}`.localeCompare(`${b.date ?? ""}${b.time ?? ""}`);
  const todayOrders = active.filter((o) => o.date === today).sort(byDateAsc);
  const upcoming = active.filter((o) => !o.date || o.date > today).sort(byDateAsc);
  const overdue = active.filter((o) => o.date && o.date < today).sort(byDateAsc);
  const doneOrders = orders.filter((o) => o.status === "done");

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Кабинет клинера</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ваши уборки, расписание и заработок.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Wallet className="size-4" /> Заработано</p>
          <p className="mt-1 text-2xl font-bold">{formatPrice(stats?.earned ?? 0)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{share}% от {formatPrice(stats?.gross ?? 0)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><CheckCircle2 className="size-4" /> Выполнено уборок</p>
          <p className="mt-1 text-2xl font-bold">{stats?.doneCount ?? 0}</p>
          {(stats?.activeCount ?? 0) > 0 && <p className="mt-0.5 text-xs text-muted-foreground">{stats!.activeCount} в работе</p>}
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Star className="size-4" /> Ваш рейтинг</p>
          <p className="mt-1 flex items-baseline gap-1 text-2xl font-bold">
            {stats && stats.rating.count > 0 ? (
              <>{stats.rating.avg.toFixed(1)}<Star className="size-5 self-center fill-warning text-warning" /></>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {stats && stats.rating.count > 0 ? `по ${stats.rating.count} оценкам` : "пока нет оценок"}
          </p>
        </div>
      </div>

      <ExecutorPayout />

      {/* Schedule */}
      {active.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Сейчас нет назначенных заказов. Новые появятся здесь.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {overdue.length > 0 && <OrderGroup title="Просроченные" orders={overdue} share={share} onStatus={setStatus} />}
          {todayOrders.length > 0 && <OrderGroup title="Сегодня" orders={todayOrders} share={share} onStatus={setStatus} />}
          {upcoming.length > 0 && <OrderGroup title="Ближайшие" orders={upcoming} share={share} onStatus={setStatus} />}
        </div>
      )}

      {doneOrders.length > 0 && (
        <details className="rounded-2xl border border-border bg-card p-5">
          <summary className="cursor-pointer text-base font-bold">Завершённые уборки ({doneOrders.length})</summary>
          <div className="mt-4 flex flex-col gap-3">
            {doneOrders.map((o) => <OrderCard key={o.id} o={o} share={share} onStatus={setStatus} />)}
          </div>
        </details>
      )}

      {/* Reviews */}
      <div>
        <h2 className="text-lg font-bold">Отзывы клиентов</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Пока нет отзывов. Они появятся после оценок клиентов.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{r.name}</span>
                  <span className="inline-flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("size-3.5", i < r.rating ? "fill-warning text-warning" : "text-border")} />
                    ))}
                  </span>
                </div>
                {r.service && <p className="mt-0.5 text-xs text-muted-foreground">{r.service}</p>}
                {r.text && <p className="mt-2 text-sm text-foreground">{r.text}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function OrderGroup({
  title,
  orders,
  share,
  onStatus,
}: {
  title: string;
  orders: Order[];
  share: number;
  onStatus: (id: string, status: string) => void;
}) {
  return (
    <div>
      <h2 className="text-base font-bold">{title} <span className="text-muted-foreground">· {orders.length}</span></h2>
      <div className="mt-3 flex flex-col gap-3">
        {orders.map((o) => <OrderCard key={o.id} o={o} share={share} onStatus={onStatus} />)}
      </div>
    </div>
  );
}

function OrderCard({
  o,
  share,
  onStatus,
}: {
  o: Order;
  share: number;
  onStatus: (id: string, status: string) => void;
}) {
  const dur = estimateDurationHours(o.rooms, o.baths);
  const st = STATUS[o.status] ?? STATUS.assigned;
  const payout = Math.round((o.total * share) / 100);
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold">{o.date ? formatDateCard(o.date) : "—"} · {o.time} — {o.time ? endTime(o.time, dur) : ""}</p>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", st.cls)}>{st.label}</span>
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span>
              {[o.city, o.street, o.apartment && `кв. ${o.apartment}`].filter(Boolean).join(", ")}
              {(o.entrance || o.floor || o.intercom) && (
                <span className="block text-xs">подъезд {o.entrance || "—"}, этаж {o.floor || "—"}, домофон {o.intercom || "—"}</span>
              )}
            </span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <User className="size-4 text-muted-foreground" /> {o.client.name || "Клиент"}
            </span>
            <a href={`tel:${o.client.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
              <Phone className="size-3.5" /> {o.client.phone}
            </a>
            <a href={mapsUrl(o)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
              <Navigation className="size-3.5" /> На карте
            </a>
          </div>
          {o.services && o.services.length > 0 ? (
            <p className="mt-1.5 text-sm text-muted-foreground">
              Работы: {o.services.map((s) => (s.qty > 1 ? `${s.title} ×${s.qty}` : s.title)).join(", ")}
            </p>
          ) : o.optionIds && o.optionIds.length > 0 ? (
            <p className="mt-1.5 text-sm text-muted-foreground">
              Работы: {o.optionIds.map((id) => optionMap.get(id)?.title ?? id).join(", ")}
            </p>
          ) : null}
          {o.comment && (
            <p className="mt-1 text-sm"><span className="text-muted-foreground">Пожелания: </span>{o.comment}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{formatPrice(payout)}</p>
          <p className="text-xs text-muted-foreground">ваша выплата</p>
        </div>
      </div>

      <div className="mt-4 flex gap-3 border-t border-border pt-4">
        {o.status === "assigned" && <Button size="sm" onClick={() => onStatus(o.id, "in_progress")}>Взять в работу</Button>}
        {o.status === "in_progress" && <Button size="sm" onClick={() => onStatus(o.id, "done")}>Завершить уборку</Button>}
        {o.status === "done" && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
            <CheckCircle2 className="size-4" /> Заказ выполнен
          </span>
        )}
      </div>

      {(o.status === "in_progress" || o.status === "done") && <OrderPhotoUpload bookingId={o.id} />}
    </div>
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
      <button onClick={() => setOpen(true)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
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
        <Button size="sm" type="submit" disabled={busy}>{busy ? "Загрузка…" : "Отправить"}</Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => setOpen(false)}>Отмена</Button>
      </div>
    </form>
  );
}
