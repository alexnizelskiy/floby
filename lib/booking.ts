/**
 * Booking domain: pricing, options, slots, and browser persistence.
 * Demo-only — no backend. Draft лежит в sessionStorage, подтверждённые
 * уборки — в localStorage (появляются в личном кабинете).
 */

export type PaymentMethod = "card" | "cash";
export type SubscriptionPlan = "none" | "monthly" | "weekly" | "biweekly";
export type BookingStatus = "searching" | "assigned" | "in_progress" | "done" | "cancelled";

export interface BookingOption {
  id: string;
  title: string;
  icon: string;
  price: number;
  /** per-hour pricing label suffix, e.g. "/час" */
  perUnit?: string;
}

export interface BookingDraft {
  rooms: number;
  baths: number;
  phone: string;
}

export interface Booking extends BookingDraft {
  id: string;
  city: string;
  street: string;
  apartment: string;
  date: string; // ISO date (yyyy-mm-dd)
  time: string; // HH:mm
  payment: PaymentMethod;
  optionIds: string[];
  email: string;
  name: string;
  entrance: string;
  floor: string;
  intercom: string;
  comment: string;
  subscription: SubscriptionPlan;
  price: PriceBreakdown;
  status: BookingStatus;
  paid?: boolean;
  reviewed?: boolean;
  assignee?: { name: string; rating: number; doneCount: number } | null;
  createdAt: string;
}

export interface PriceBreakdown {
  base: number;
  optionsTotal: number;
  surgePercent: number;
  surgeAmount: number;
  total: number;
}

/* ─── Options (as in Qlean) ─────────────────────────────── */

export const bookingOptions: BookingOption[] = [
  { id: "pro", title: "Опытный клинер", icon: "star", price: 1200 },
  { id: "premium", title: "Премиум уборка", icon: "sparkles", price: 2300 },
  { id: "keys-take", title: "Забрать ключи", icon: "key", price: 800 },
  { id: "keys-deliver", title: "Доставка ключей", icon: "key", price: 800 },
  { id: "fur", title: "Удаление шерсти", icon: "brush", price: 500 },
  { id: "window", title: "Помыть окно", icon: "window", price: 800 },
  { id: "fridge", title: "Помыть холодильник", icon: "refrigerator", price: 700 },
  { id: "balcony-glass", title: "Помыть балконное остекление", icon: "window", price: 1800 },
  { id: "oven", title: "Помыть духовку", icon: "oven", price: 600 },
  { id: "balcony", title: "Убрать балкон", icon: "home", price: 1000 },
  { id: "microwave", title: "Помыть микроволновку", icon: "microwave", price: 300 },
  { id: "kitchen-hard", title: "Сложная кухня + опции в подарок", icon: "sparkles", price: 1700 },
  { id: "rust", title: "Удаление налёта и ржавчины в санузле", icon: "spray", price: 900 },
  { id: "cabinets", title: "Помыть шкафы на кухне", icon: "cabinet", price: 900 },
  { id: "ironing", title: "Погладить вещи (1 час)", icon: "shirt", price: 800, perUnit: "/час" },
  { id: "wardrobe", title: "Убраться в гардеробной", icon: "shirt", price: 800 },
  { id: "pet", title: "Помыть лоток питомца", icon: "cat", price: 300 },
  { id: "chandelier", title: "Почистить люстру", icon: "lamp", price: 600 },
  { id: "stairs", title: "Убрать лестницу", icon: "home", price: 1200 },
  { id: "extra", title: "Убрать что-то ещё (30 мин)", icon: "clock", price: 500 },
  { id: "vacuum-in", title: "Привезти пылесос (внутри МКАД / КАД)", icon: "window", price: 1000 },
  { id: "vacuum-out", title: "Привезти пылесос (за МКАД / КАД)", icon: "window", price: 1500 },
];

export const optionMap = new Map(bookingOptions.map((o) => [o.id, o]));

/* ─── Subscriptions ─────────────────────────────────────── */

export const subscriptions: { id: SubscriptionPlan; title: string }[] = [
  { id: "none", title: "Без подписки" },
  { id: "monthly", title: "Раз в месяц" },
  { id: "weekly", title: "Раз в неделю" },
  { id: "biweekly", title: "Раз в 2 недели" },
];

/* ─── Pricing ───────────────────────────────────────────── */

const BASE_1_1 = 2050;
const PER_ROOM = 900;
const PER_BATH = 600;

export function computeBase(rooms: number, baths: number) {
  return BASE_1_1 + Math.max(0, rooms - 1) * PER_ROOM + Math.max(0, baths - 1) * PER_BATH;
}

export function estimateDurationHours(rooms: number, baths: number) {
  return Math.min(9, 2 + Math.max(0, rooms - 1) + Math.max(0, baths - 1));
}

export function computePrice(
  rooms: number,
  baths: number,
  optionIds: string[],
  surgePercent: number
): PriceBreakdown {
  const base = computeBase(rooms, baths);
  const optionsTotal = optionIds.reduce((s, id) => s + (optionMap.get(id)?.price ?? 0), 0);
  const surgeAmount = Math.round(((base + optionsTotal) * surgePercent) / 100);
  return {
    base,
    optionsTotal,
    surgePercent,
    surgeAmount,
    total: base + optionsTotal + surgeAmount,
  };
}

/* ─── Date / time slots ─────────────────────────────────── */

const WEEKDAYS = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

export function formatDateLong(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const wd = WEEKDAYS[d.getDay()];
  return `${wd[0].toUpperCase()}${wd.slice(1)}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateCard(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const wd = WEEKDAYS[d.getDay()];
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${wd}`;
}

export function formatDateShort(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const wdShort = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][d.getDay()];
  return `${wdShort}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function generateDates(count = 14): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function generateTimes(): string[] {
  const out: string[] = [];
  for (let h = 8; h <= 20; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 20) out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
}

/** Peak slots (weekend afternoons) get a surge, as in Qlean. */
export function surgeForSlot(dateIso: string, time: string): number {
  const day = new Date(dateIso + "T00:00:00").getDay();
  const hour = parseInt(time.slice(0, 2), 10);
  const weekend = day === 0 || day === 6;
  if (weekend && hour >= 12 && hour <= 18) return 25;
  if (hour >= 17 && hour <= 20) return 15;
  return 0;
}

export function endTime(time: string, hours: number) {
  const [h, m] = time.split(":").map(Number);
  const end = (h + hours) % 24;
  return `${String(end).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function summaryTitle(rooms: number, baths: number) {
  const rWord = rooms === 1 ? "комната" : rooms >= 2 && rooms <= 4 ? "комнаты" : "комнат";
  const bWord = baths === 1 ? "санузел" : baths >= 2 && baths <= 4 ? "санузла" : "санузлов";
  return `Стандартная уборка квартиры: ${rooms} ${rWord} и ${baths} ${bWord}`;
}

/* ─── Persistence ───────────────────────────────────────── */

const DRAFT_KEY = "floby-booking-draft";
const BOOKINGS_KEY = "floby-bookings";
const AUTH_KEY = "floby-auth-phone";

export function saveDraft(d: BookingDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
}
export function getDraft(): BookingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as BookingDraft) : null;
  } catch {
    return null;
  }
}
export function clearDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DRAFT_KEY);
}

export function setAuthPhone(phone: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, phone);
}
export function getAuthPhone(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_KEY);
}

export function getBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    return [];
  }
}
export function saveBooking(b: Booking) {
  if (typeof window === "undefined") return;
  const all = getBookings();
  all.unshift(b);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
}
export function removeBooking(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(getBookings().filter((b) => b.id !== id)));
}
