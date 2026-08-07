/**
 * Dog-walking order model — durations + prices (first walk discounted),
 * behaviour/pet options. Prices are placeholders — adjust walkDurations.
 */
export interface WalkDuration {
  min: number;
  price: number; // обычная цена
  first: number; // цена первого выгула (скидка)
}

export const walkDurations: WalkDuration[] = [
  { min: 20, price: 890, first: 299 },
  { min: 45, price: 1090, first: 349 },
  { min: 60, price: 1290, first: 449 },
  { min: 90, price: 1490, first: 649 },
  { min: 120, price: 1690, first: 749 },
  { min: 180, price: 2190, first: 949 },
];

export function walkPrice(min: number, firstWalk: boolean): number {
  const d = walkDurations.find((x) => x.min === min) ?? walkDurations[2];
  return firstWalk ? d.first : d.price;
}

export const petHasOptions = [
  "Ветпаспорт",
  "Прививки",
  "Защита от клещей",
  "Кастрация или стерилизация",
  "Нет ничего из этого",
] as const;

export const accessOptions = [
  "Дома встретят",
  "Ключи будут в тайном месте",
  "Передам ключи выгульщику",
  "Ключи уже у выгульщика",
] as const;

export interface PetWalkDraft {
  returning: "yes" | "no" | null;
  pet: {
    name: string;
    breed: string;
    gender: "female" | "male" | null;
    birthday: string;
    weight: number;
    has: string[];
    clinic: string;
    hasIllness: "no" | "yes" | null;
    illnessText: string;
  };
  behavior: {
    pullsLeash: string;
    picksUp: string;
    canTakeAway: string;
    aggression: string;
    offLeash: string;
    contactDogs: string;
  };
  walk: {
    durationMin: number;
    frequency: string;
    schedule: string;
    feed: string;
    washPaws: string;
    access: string;
    notes: string;
  };
}

export const emptyPetWalkDraft: PetWalkDraft = {
  returning: null,
  pet: { name: "", breed: "", gender: null, birthday: "", weight: 10, has: [], clinic: "", hasIllness: null, illnessText: "" },
  behavior: { pullsLeash: "", picksUp: "", canTakeAway: "", aggression: "", offLeash: "", contactDogs: "" },
  walk: { durationMin: 60, frequency: "", schedule: "", feed: "", washPaws: "", access: "", notes: "" },
};

const KEY = "floby-pet-walk-draft";

export function savePetDraft(d: PetWalkDraft): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* ignore */ }
}
export function getPetDraft(): PetWalkDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PetWalkDraft) : null;
  } catch { return null; }
}
export function clearPetDraft(): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
