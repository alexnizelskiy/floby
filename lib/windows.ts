/**
 * Мытьё окон — считаем по створкам. Цена за одну створку берётся из
 * конфигурации калькулятора (доп.услуга «windows», редактируется в админке),
 * поэтому окна и калькулятор всегда согласованы. Отдельный поток заказа от
 * комнатного калькулятора.
 */
import { addonPrice, type PricingOverride } from "@/lib/calc";

export const WINDOW_MIN_SASHES = 1;
export const WINDOW_MAX_SASHES = 30;
export const WINDOW_DEFAULT_SASHES = 4;

/** Цена за одну створку (с учётом правок из админки). */
export function windowSashPrice(pricing?: PricingOverride): number {
  return addonPrice("windows", pricing);
}

export function clampSashes(n: number): number {
  const v = Math.round(Number(n) || WINDOW_MIN_SASHES);
  return Math.max(WINDOW_MIN_SASHES, Math.min(WINDOW_MAX_SASHES, v));
}

export function windowPrice(sashes: number, pricing?: PricingOverride): number {
  return clampSashes(sashes) * windowSashPrice(pricing);
}

function sashWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "створка";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "створки";
  return "створок";
}

export function windowLabel(sashes: number): string {
  const n = clampSashes(sashes);
  return `${n} ${sashWord(n)}`;
}

export interface WindowDraft {
  sashes: number;
  name?: string;
  phone?: string;
  date?: string;
  time?: string;
}

const KEY = "floby-window-draft";

export function saveWindowDraft(draft: WindowDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

export function getWindowDraft(): WindowDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as WindowDraft;
    if (typeof d.sashes !== "number") return null;
    return { ...d, sashes: clampSashes(d.sashes) };
  } catch {
    return null;
  }
}

export function clearWindowDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
