import type { PriceTier, AddonPrice } from "@/types";

/** Price table by apartment size (used on /prices). */
export const priceTiers: PriceTier[] = [
  { id: "studio", title: "Студия", area: "до 30 м²", regular: 2500, deep: 4900 },
  { id: "1room", title: "1 комната", area: "30–45 м²", regular: 2900, deep: 5900, popular: true },
  { id: "2room", title: "2 комнаты", area: "45–65 м²", regular: 3600, deep: 7500 },
  { id: "3room", title: "3 комнаты", area: "65–90 м²", regular: 4500, deep: 9500 },
  { id: "4room", title: "4+ комнаты", area: "от 90 м²", regular: 5600, deep: 12500 },
];

/** Дополнительные услуги. */
export const addons: AddonPrice[] = [
  { title: "Мытьё окна (створка)", price: 500, unit: "шт" },
  { title: "Мытьё холодильника внутри", price: 700, unit: "шт" },
  { title: "Мытьё духового шкафа", price: 700, unit: "шт" },
  { title: "Мытьё микроволновки", price: 400, unit: "шт" },
  { title: "Глажка белья", price: 900, unit: "час" },
  { title: "Уборка балкона / лоджии", price: 1200, unit: "шт" },
  { title: "Химчистка дивана (место)", price: 1500, unit: "место" },
  { title: "Мытьё люстры", price: 600, unit: "шт" },
];

/* ─── Конфигурация калькулятора ─────────────────────────────── */

export type PropertyType = "apartment" | "house" | "office";
export type CleaningType = "regular" | "deep" | "post-renovation";

export const propertyTypes: { id: PropertyType; label: string; icon: string }[] = [
  { id: "apartment", label: "Квартира", icon: "home" },
  { id: "house", label: "Дом", icon: "building" },
  { id: "office", label: "Офис", icon: "building" },
];

export const cleaningTypes: {
  id: CleaningType;
  label: string;
  description: string;
}[] = [
  { id: "regular", label: "Поддерживающая", description: "Регулярная уборка" },
  { id: "deep", label: "Генеральная", description: "Глубокая чистка" },
  { id: "post-renovation", label: "После ремонта", description: "Строительная пыль" },
];

/** Base price per m² by cleaning type. */
export const ratePerSqm: Record<CleaningType, number> = {
  regular: 70,
  deep: 140,
  "post-renovation": 190,
};

/** Property-type multiplier. */
export const propertyMultiplier: Record<PropertyType, number> = {
  apartment: 1,
  house: 1.2,
  office: 1.1,
};

export const calculatorBase = 1500; // минимальный выезд

/** Калькуляторные допы (переключаемые чекбоксы). */
export const calculatorAddons: { id: string; label: string; price: number }[] = [
  { id: "windows", label: "Мытьё окон", price: 1500 },
  { id: "fridge", label: "Холодильник внутри", price: 700 },
  { id: "oven", label: "Духовой шкаф", price: 700 },
  { id: "balcony", label: "Балкон / лоджия", price: 1200 },
  { id: "ironing", label: "Глажка белья", price: 900 },
  { id: "furniture", label: "Химчистка дивана", price: 1500 },
];
