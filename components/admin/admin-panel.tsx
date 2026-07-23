"use client";

import * as React from "react";
import { MapPin, Phone, Search, User, CreditCard, Banknote } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { formatDateCard, optionMap } from "@/lib/booking";
import type { Role } from "@/lib/auth";

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
  const [tab, setTab] = React.useState<"bookings" | "users" | "promos">("bookings");
  const [bookings, setBookings] = React.useState<AdminBooking[]>([]);
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [promos, setPromos] = React.useState<Promo[]>([]);
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

  React.useEffect(() => {
    loadBookings();
    loadUsers();
    loadPromos();
  }, [loadBookings, loadUsers, loadPromos]);

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
