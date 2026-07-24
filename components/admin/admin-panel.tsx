"use client";

import * as React from "react";
import { MapPin, Phone, Search, User, CreditCard, Banknote, TrendingUp, Repeat, Wallet, Star } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { formatDateCard, optionMap } from "@/lib/booking";
import type { Role } from "@/lib/auth";

interface Analytics {
  revenue: { today: number; week: number; month: number; total: number };
  orders: { total: number; done: number; active: number; cancelled: number };
  avgCheck: number;
  repeatRate: number;
  clients: { total: number; withOrders: number };
  statusFunnel: { status: string; count: number }[];
  revenueByDay: { day: string; revenue: number }[];
  topExecutors: { name: string; done: number; rating: number }[];
}

interface AdminBooking {
  id: string;
  status: string;
  total: number;
  paid: boolean;
  createdAt: string;
  assigneeId: string | null;
  client: { phone: string; name: string | null };
  assignee: { phone: string; name: string | null } | null;
  city?: string; street?: string; apartment?: string;
  date?: string; time?: string; payment?: string;
  comment?: string; entrance?: string; floor?: string; intercom?: string;
  optionIds?: string[];
}
interface AdminUser {
  id: string; phone: string; name: string | null; email: string | null;
  role: Role; orders: number;
}

const STATUS_LABEL: Record<string, string> = {
  searching: "Ищем исполнителя",
  assigned: "Назначен",
  in_progress: "В работе",
  done: "Выполнен",
  cancelled: "Отменён",
};
const ROLE_LABEL: Record<string, string> = {
  client: "Клиент",
  executor: "Исполнитель",
  manager: "Менеджер",
  admin: "Админ",
};
const selectCls =
  "h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

interface Promo {
  id: string; code: string; discount_type: "percent" | "fixed"; value: number;
  active: boolean; max_uses: number; used_count: number; min_order: number; expires_at: string | null;
}

export function AdminPanel({ role }: { role: Role }) {
  const [tab, setTab] = React.useState<"analytics" | "bookings" | "users" | "promos">("analytics");
  const [bookings, setBookings] = React.useState<AdminBooking[]>([]);
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [promos, setPromos] = React.useState<Promo[]>([]);
  const [analytics, setAnalytics] = React.useState<Analytics | null>(null);
  const [q, setQ] = React.useState("");
  const [newPromo, setNewPromo] = React.useState({ code: "", discountType: "percent", value: "", maxUses: "", minOrder: "" });
  const [promoErr, setPromoErr] = React.useState("");

  const loadBookings = React.useCallback(async () => {
    const r = await fetch("/api/admin/bookings").then((x) => x.json());
    if (r.ok) setBookings(r.bookings);
  }, []);
  const loadUsers = React.useCallback(async (query = "") => {
    const r = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`).then((x) => x.json());
    if (r.ok) setUsers(r.users);
  }, []);

  const loadPromos = React.useCallback(async () => {
    const r = await fetch("/api/admin/promos").then((x) => x.json());
    if (r.ok) setPromos(r.promos);
  }, []);
  const loadAnalytics = React.useCallback(async () => {
    const r = await fetch("/api/admin/analytics").then((x) => x.json()).catch(() => null);
    if (r?.ok) setAnalytics(r.analytics);
  }, []);

  React.useEffect(() => {
    loadAnalytics();
    loadBookings();
    loadUsers();
    loadPromos();
  }, [loadAnalytics, loadBookings, loadUsers, loadPromos]);

  async function createPromo() {
    setPromoErr("");
    const res = await fetch("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: newPromo.code,
        discountType: newPromo.discountType,
        value: Number(newPromo.value),
        maxUses: Number(newPromo.maxUses || 0),
        minOrder: Number(newPromo.minOrder || 0),
      }),
    }).then((x) => x.json());
    if (res.ok) {
      setNewPromo({ code: "", discountType: "percent", value: "", maxUses: "", minOrder: "" });
      loadPromos();
    } else {
      setPromoErr(res.error === "duplicate" ? "Такой код уже есть" : "Проверьте поля (код A-Z0-9, значение > 0)");
    }
  }
  async function togglePromo(id: string, active: boolean) {
    await fetch(`/api/admin/promos/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active }),
    });
    loadPromos();
  }
  async function deletePromo(id: string) {
    await fetch(`/api/admin/promos/${id}`, { method: "DELETE" });
    loadPromos();
  }

  const executors = users.filter((u) => u.role === "executor");

  async function assign(id: string, assigneeId: string) {
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId: assigneeId || null }),
    });
    loadBookings();
  }
  async function setStatus(id: string, status: string) {
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadBookings();
  }
  async function setRole(id: string, newRole: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    loadUsers(q);
  }

  return (
    <div className="bg-surface">
      <div className="container-page py-10 md:py-14">
        <h1 className="text-3xl font-bold">Панель управления</h1>
        <p className="mt-1 text-muted-foreground">
          {role === "admin" ? "Администратор" : "Менеджер"} · заявки и сотрудники
        </p>

        <div className="mt-6 flex gap-2">
          {(
            [
              ["analytics", "Аналитика"],
              ["bookings", `Заявки (${bookings.length})`],
              ["users", `Пользователи (${users.length})`],
              ["promos", `Промокоды (${promos.length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                tab === id ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-surface-strong"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Analytics ── */}
        {tab === "analytics" && (
          <div className="mt-6">
            {!analytics ? (
              <div className="h-40 rounded-2xl border border-border bg-card" />
            ) : (
              <div className="flex flex-col gap-6">
                {/* Ключевые метрики */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <StatCard icon={<Wallet className="size-4" />} label="Выручка за месяц" value={formatPrice(analytics.revenue.month)} hint={`сегодня ${formatPrice(analytics.revenue.today)}`} />
                  <StatCard icon={<TrendingUp className="size-4" />} label="Средний чек" value={formatPrice(analytics.avgCheck)} hint={`${analytics.orders.done} выполнено`} />
                  <StatCard icon={<Repeat className="size-4" />} label="Повторные клиенты" value={`${analytics.repeatRate}%`} hint={`${analytics.clients.withOrders} с заказами`} />
                  <StatCard icon={<User className="size-4" />} label="Клиентов всего" value={String(analytics.clients.total)} hint={`${analytics.orders.total} заявок`} />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Выручка по дням */}
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="text-base font-bold">Выручка, 14 дней</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">Итого: {formatPrice(analytics.revenue.total)} за всё время</p>
                    <RevenueBars data={analytics.revenueByDay} />
                  </div>

                  {/* Воронка статусов */}
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="text-base font-bold">Заказы по статусам</h3>
                    <div className="mt-4 flex flex-col gap-2.5">
                      {analytics.statusFunnel.length === 0 && (
                        <p className="text-sm text-muted-foreground">Пока нет заказов.</p>
                      )}
                      {analytics.statusFunnel.map((s) => {
                        const max = Math.max(...analytics.statusFunnel.map((x) => x.count), 1);
                        return (
                          <div key={s.status} className="flex items-center gap-3">
                            <span className="w-36 shrink-0 text-sm text-muted-foreground">{STATUS_LABEL[s.status] ?? s.status}</span>
                            <div className="h-6 flex-1 overflow-hidden rounded-lg bg-surface-strong">
                              <div className="h-full rounded-lg bg-brand-400" style={{ width: `${(s.count / max) * 100}%` }} />
                            </div>
                            <span className="w-8 shrink-0 text-right text-sm font-semibold">{s.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Топ клинеров */}
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-base font-bold">Топ клинеров</h3>
                  {analytics.topExecutors.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">Ещё нет назначенных исполнителей.</p>
                  ) : (
                    <div className="mt-4 flex flex-col divide-y divide-border">
                      {analytics.topExecutors.map((e, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 py-2.5">
                          <span className="flex items-center gap-3">
                            <span className="grid size-9 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{e.name[0]?.toUpperCase()}</span>
                            <span className="font-medium">{e.name}</span>
                          </span>
                          <span className="flex items-center gap-4 text-sm">
                            {e.rating > 0 && (
                              <span className="inline-flex items-center gap-1"><Star className="size-4 fill-warning text-warning" />{e.rating.toFixed(1)}</span>
                            )}
                            <span className="text-muted-foreground">{e.done} уборок</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Bookings ── */}
        {tab === "bookings" && (
          <div className="mt-6 flex flex-col gap-4">
            {bookings.length === 0 && (
              <p className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                Заявок пока нет.
              </p>
            )}
            {bookings.map((b) => (
              <div key={b.id} className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">
                        {b.date ? formatDateCard(b.date) : "—"} · {b.time ?? ""}
                      </span>
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        b.status === "done" ? "bg-brand-100 text-brand-700"
                          : b.status === "cancelled" ? "bg-muted text-muted-foreground"
                          : "bg-surface-strong text-foreground"
                      )}>
                        {STATUS_LABEL[b.status] ?? b.status}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        {b.paid ? <><CreditCard className="size-3.5" /> оплачено</> : <><Banknote className="size-3.5" /> наличные</>}
                      </span>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-sm">
                      <User className="size-4 text-muted-foreground" />
                      {b.client.name || "Без имени"} ·
                      <a href={`tel:${b.client.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Phone className="size-3.5" /> {b.client.phone}
                      </a>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-4" />
                      {[b.city, b.street, b.apartment && `кв. ${b.apartment}`].filter(Boolean).join(", ") || "адрес не указан"}
                      {(b.entrance || b.floor || b.intercom) && (
                        <span> · подъезд {b.entrance || "—"}, этаж {b.floor || "—"}, домофон {b.intercom || "—"}</span>
                      )}
                    </p>
                    {b.optionIds && b.optionIds.length > 0 && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Опции: {b.optionIds.map((id) => optionMap.get(id)?.title ?? id).join(", ")}
                      </p>
                    )}
                    {b.comment && (
                      <p className="mt-1 text-sm">
                        <span className="text-muted-foreground">Пожелания: </span>{b.comment}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatPrice(b.total)}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Исполнитель:</span>
                    <select
                      className={selectCls}
                      value={b.assigneeId ?? ""}
                      onChange={(e) => assign(b.id, e.target.value)}
                    >
                      <option value="">— не назначен —</option>
                      {executors.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name || ex.phone}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Статус:</span>
                    <select className={selectCls} value={b.status} onChange={(e) => setStatus(b.id, e.target.value)}>
                      {Object.entries(STATUS_LABEL).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            ))}
            {executors.length === 0 && bookings.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Чтобы назначать заказы, сделайте кого-то «Исполнителем» во вкладке «Пользователи».
              </p>
            )}
          </div>
        )}

        {/* ── Users ── */}
        {tab === "users" && (
          <div className="mt-6">
            <div className="relative mb-4 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); loadUsers(e.target.value); }}
                placeholder="Поиск по телефону, имени, email"
                className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-sm focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
              />
            </div>
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Телефон</th>
                    <th className="px-4 py-3 font-medium">Имя</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Заказов</th>
                    <th className="px-4 py-3 font-medium">Роль</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 font-medium">{u.phone}</td>
                      <td className="px-4 py-3">{u.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email || "—"}</td>
                      <td className="px-4 py-3">{u.orders}</td>
                      <td className="px-4 py-3">
                        {u.role === "admin" ? (
                          <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">Админ</span>
                        ) : (
                          <select className={selectCls} value={u.role} onChange={(e) => setRole(u.id, e.target.value)}>
                            <option value="client">Клиент</option>
                            <option value="executor">Исполнитель</option>
                            {role === "admin" && <option value="manager">Менеджер</option>}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Никого не найдено</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Promo codes ── */}
        {tab === "promos" && (
          <div className="mt-6 flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <h3 className="font-bold">Новый промокод</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <input placeholder="КОД" value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  className={cn(selectCls, "uppercase")} />
                <select value={newPromo.discountType}
                  onChange={(e) => setNewPromo({ ...newPromo, discountType: e.target.value })} className={selectCls}>
                  <option value="percent">Процент %</option>
                  <option value="fixed">Сумма ₽</option>
                </select>
                <input type="number" placeholder={newPromo.discountType === "percent" ? "% скидки" : "₽ скидки"}
                  value={newPromo.value} onChange={(e) => setNewPromo({ ...newPromo, value: e.target.value })} className={selectCls} />
                <input type="number" placeholder="Лимит (0=∞)" value={newPromo.maxUses}
                  onChange={(e) => setNewPromo({ ...newPromo, maxUses: e.target.value })} className={selectCls} />
                <input type="number" placeholder="От суммы ₽" value={newPromo.minOrder}
                  onChange={(e) => setNewPromo({ ...newPromo, minOrder: e.target.value })} className={selectCls} />
                <button onClick={createPromo}
                  className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
                  Создать
                </button>
              </div>
              {promoErr && <p className="mt-2 text-sm text-destructive">{promoErr}</p>}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Код</th>
                    <th className="px-4 py-3 font-medium">Скидка</th>
                    <th className="px-4 py-3 font-medium">Использован</th>
                    <th className="px-4 py-3 font-medium">От суммы</th>
                    <th className="px-4 py-3 font-medium">Активен</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-bold">{p.code}</td>
                      <td className="px-4 py-3">{p.discount_type === "percent" ? `${p.value}%` : formatPrice(p.value)}</td>
                      <td className="px-4 py-3">{p.used_count}{p.max_uses > 0 ? ` / ${p.max_uses}` : ""}</td>
                      <td className="px-4 py-3">{p.min_order > 0 ? formatPrice(p.min_order) : "—"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => togglePromo(p.id, !p.active)}
                          className={cn("rounded-full px-2.5 py-1 text-xs font-semibold",
                            p.active ? "bg-brand-100 text-brand-700" : "bg-muted text-muted-foreground")}>
                          {p.active ? "Вкл" : "Выкл"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => deletePromo(p.id)} className="text-sm text-destructive hover:underline">Удалить</button>
                      </td>
                    </tr>
                  ))}
                  {promos.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Промокодов пока нет</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">{icon} {label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function RevenueBars({ data }: { data: { day: string; revenue: number }[] }) {
  if (data.length === 0) {
    return <p className="mt-6 text-sm text-muted-foreground">Пока нет выполненных заказов.</p>;
  }
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="mt-5 flex h-40 items-end gap-1.5">
      {data.map((d) => (
        <div key={d.day} className="group relative flex flex-1 flex-col items-center justify-end">
          <div
            className="w-full rounded-t bg-brand-400 transition-colors group-hover:bg-brand-500"
            style={{ height: `${Math.max((d.revenue / max) * 100, d.revenue > 0 ? 4 : 0)}%` }}
          />
          <span className="mt-1 text-[10px] text-muted-foreground">{d.day.slice(8)}</span>
          <span className="pointer-events-none absolute -top-6 hidden whitespace-nowrap rounded bg-ink-950 px-2 py-1 text-[11px] font-medium text-white group-hover:block">
            {formatPrice(d.revenue)}
          </span>
        </div>
      ))}
    </div>
  );
}
