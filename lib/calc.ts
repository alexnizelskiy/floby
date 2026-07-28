/**
 * Калькулятор уборки (в стиле cleanbros): комнаты × тип уборки + доп.услуги.
 * Реактивная модель — одна на главной и на шаге заказа. Состояние сохраняется
 * в localStorage, чтобы пережить авторизацию и переход в кабинет.
 */

export type CalcCleaningType = "regular" | "general" | "post_renovation";
export type PropertyType = "apartment" | "house";

export const propertyTypes: { id: PropertyType; label: string }[] = [
  { id: "apartment", label: "Квартира" },
  { id: "house", label: "Дом" },
];

/** Дом больше и сложнее — надбавка к базовой стоимости и времени. */
const PROPERTY_MULT: Record<PropertyType, number> = { apartment: 1, house: 1.4 };

export interface RoomTier {
  rooms: number; // 1..5 (5 = «5+»)
  label: string;
  area: string;
}

export const roomTiers: RoomTier[] = [
  { rooms: 1, label: "1", area: "0–49 м²" },
  { rooms: 2, label: "2", area: "50–69 м²" },
  { rooms: 3, label: "3", area: "70–99 м²" },
  { rooms: 4, label: "4", area: "100–149 м²" },
  { rooms: 5, label: "5+", area: "от 150 м²" },
];

export interface CleaningTypeDef {
  id: CalcCleaningType;
  label: string;
  description: string;
}

export const calcCleaningTypes: CleaningTypeDef[] = [
  { id: "regular", label: "Регулярная", description: "Поддерживающая уборка для чистого дома" },
  { id: "general", label: "Генеральная", description: "Глубокая уборка с труднодоступными местами" },
  { id: "post_renovation", label: "После ремонта", description: "Уборка строительной пыли и следов ремонта" },
];

export type AddonMode = "qty" | "toggle" | "percent";

export interface CalcAddon {
  id: string;
  title: string;
  price: number;
  unit?: string; // «шт.», «створка», «30 мин»…
  mode: AddonMode;
  from?: boolean; // цена «от»
  timeMin?: number; // сколько минут добавляет единица
  max?: number;
  hint?: string;
}

export const calcAddons: CalcAddon[] = [
  { id: "errand", title: "Особые поручения", price: 450, unit: "30 мин", mode: "qty", timeMin: 30, hint: "Дополнительное время клинера на ваши задачи." },
  { id: "oven", title: "Мытьё духовки внутри", price: 600, unit: "шт.", mode: "qty", timeMin: 15, hint: "Отмоем духовой шкаф внутри от жира и нагара." },
  { id: "microwave", title: "Мытьё СВЧ внутри", price: 350, unit: "шт.", mode: "qty", timeMin: 10, hint: "Помоем микроволновку внутри и снаружи." },
  { id: "fridge", title: "Мытьё холодильника внутри", price: 500, unit: "шт.", mode: "qty", timeMin: 15, hint: "Помоем холодильник внутри (после разморозки)." },
  { id: "windows", title: "Мойка окон", price: 550, unit: "створка", mode: "qty", timeMin: 20, hint: "Помоем стекло с двух сторон, раму и подоконник." },
  { id: "chandelier", title: "Мытьё люстры", price: 500, unit: "шт.", mode: "qty", timeMin: 15, hint: "Аккуратно помоем люстру и плафоны." },
  { id: "ironing", title: "Глажка", price: 450, unit: "30 мин", mode: "qty", timeMin: 30, hint: "Погладим бельё и одежду в течение оплаченного времени." },
  { id: "linen", title: "Поменять бельё", price: 350, unit: "шт.", mode: "qty", timeMin: 10, hint: "Сменим постельное бельё на чистое (ваше)." },
  { id: "balcony", title: "Уборка на балконе", price: 700, unit: "шт.", mode: "qty", timeMin: 30, hint: "Наведём порядок и помоем пол на балконе." },
  { id: "bathroom", title: "Уборка санузла", price: 600, unit: "шт.", mode: "qty", timeMin: 30, hint: "Дополнительный санузел сверх одного, входящего в уборку." },
  { id: "eco", title: "Эко-уборка", price: 0, mode: "percent", hint: "Уборка гипоаллергенными эко-средствами. +40% к стоимости." },
  { id: "steam", title: "Парогенератор", price: 900, mode: "toggle", timeMin: 20, hint: "Обработка паром сантехники и труднодоступных мест." },
  { id: "equipment", title: "Доставка спец. оборудования", price: 1500, mode: "toggle", hint: "Привезём профессиональное оборудование для уборки." },
  { id: "keys", title: "Заехать за ключами", price: 500, mode: "toggle", hint: "Клинер заберёт ключи из согласованного места." },
  { id: "dryclean", title: "Химчистка", price: 300, from: true, mode: "toggle", hint: "Химчистка мягкой мебели и ковров. Точную цену назовёт клинер." },
];

export const addonMap = new Map(calcAddons.map((a) => [a.id, a]));

export const ECO_PERCENT = 40;

/** Базовая цена по числу комнат и типу уборки (включён один санузел). */
const BASE: Record<CalcCleaningType, Record<number, number>> = {
  regular: { 1: 2050, 2: 2950, 3: 3850, 4: 4750, 5: 5950 },
  general: { 1: 4900, 2: 5900, 3: 7500, 4: 9500, 5: 12500 },
  post_renovation: { 1: 6200, 2: 7500, 3: 9500, 4: 12000, 5: 15500 },
};

/** Базовое время уборки в минутах по числу комнат (регулярная). */
const BASE_MIN: Record<number, number> = { 1: 150, 2: 180, 3: 240, 4: 300, 5: 360 };
const TYPE_TIME_MULT: Record<CalcCleaningType, number> = { regular: 1, general: 1.4, post_renovation: 1.6 };

export interface CalcState {
  rooms: number;
  cleaningType: CalcCleaningType;
  propertyType: PropertyType;
  addons: Record<string, number>; // id -> qty (toggle = 0/1)
}

export interface CalcResult {
  base: number;
  addonsTotal: number;
  ecoAmount: number;
  total: number;
  minutes: number;
  durationLabel: string;
}

export function clampRooms(r: number) {
  return Math.max(1, Math.min(5, Math.round(r || 1)));
}

export function computeCalc(state: CalcState): CalcResult {
  const rooms = clampRooms(state.rooms);
  const propMult = PROPERTY_MULT[state.propertyType] ?? 1;
  const base = Math.round(((BASE[state.cleaningType]?.[rooms] ?? BASE.regular[rooms]) * propMult) / 10) * 10;

  let addonsTotal = 0;
  let extraMin = 0;
  let eco = false;
  for (const a of calcAddons) {
    const qty = state.addons[a.id] ?? 0;
    if (qty <= 0) continue;
    if (a.mode === "percent") {
      eco = true;
      continue;
    }
    addonsTotal += a.price * qty;
    extraMin += (a.timeMin ?? 0) * qty;
  }

  const beforeEco = base + addonsTotal;
  const ecoAmount = eco ? Math.round((beforeEco * ECO_PERCENT) / 100) : 0;
  const total = Math.round((beforeEco + ecoAmount) / 10) * 10;

  const minutes = Math.round((BASE_MIN[rooms] ?? 180) * TYPE_TIME_MULT[state.cleaningType] * propMult + extraMin);

  return { base, addonsTotal, ecoAmount, total, minutes, durationLabel: formatDuration(minutes) };
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `≈ ${m} мин`;
  if (m === 0) return `≈ ${h} ч`;
  return `≈ ${h} ч ${m} мин`;
}

const RU_ROOMS = ["", "одной жилой комнатой", "двумя жилыми комнатами", "тремя жилыми комнатами", "четырьмя жилыми комнатами", "пятью+ жилыми комнатами"];

export function calcTitle(rooms: number, propertyType: PropertyType = "apartment"): string {
  const r = clampRooms(rooms);
  const place = propertyType === "house" ? "дома" : "квартиры";
  return `Уборка ${place} с ${RU_ROOMS[r]} и одним санузлом`;
}

/** Человекочитаемый список выбранных доп.услуг (для кабинета / заказа). */
export function selectedAddonList(state: CalcState): { id: string; title: string; qty: number; price: number }[] {
  return calcAddons
    .filter((a) => (state.addons[a.id] ?? 0) > 0)
    .map((a) => ({ id: a.id, title: a.title, qty: state.addons[a.id], price: a.mode === "percent" ? 0 : a.price * state.addons[a.id] }));
}

/* ─── Draft persistence (localStorage) ──────────────────────── */

export interface CalcDraft extends CalcState {
  phone?: string;
  name?: string;
  date?: string;
  time?: string;
  promo?: string;
  comment?: string;
}

const DRAFT_KEY = "floby-calc-draft";

export const defaultCalcState: CalcState = { rooms: 1, cleaningType: "regular", propertyType: "apartment", addons: {} };

export function saveCalcDraft(d: CalcDraft) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* ignore quota */
  }
}

export function getCalcDraft(): CalcDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as CalcDraft;
    return { ...defaultCalcState, ...d, addons: d.addons ?? {} };
  } catch {
    return null;
  }
}

export function clearCalcDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}
