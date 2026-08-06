/**
 * Window-cleaning offer — flat price for all windows + optional balconies.
 * Separate from the room-based calculator. Prices are placeholders — adjust
 * WINDOW_BASE / WINDOW_BALCONY to real values.
 */
export type WindowOption = "only" | "balcony1" | "balcony2" | "balcony3";

export const WINDOW_BASE = 3490; // «Только окна»
export const WINDOW_BALCONY = 900; // доплата за каждый балкон

export const windowOptions: { id: WindowOption; label: string; balconies: number }[] = [
  { id: "only", label: "Только окна", balconies: 0 },
  { id: "balcony1", label: "Все окна + 1 балкон", balconies: 1 },
  { id: "balcony2", label: "Все окна + 2 балкона", balconies: 2 },
  { id: "balcony3", label: "Все окна + 3 балкона", balconies: 3 },
];

export function windowPrice(option: WindowOption): number {
  const o = windowOptions.find((x) => x.id === option) ?? windowOptions[0];
  return WINDOW_BASE + o.balconies * WINDOW_BALCONY;
}

export function windowLabel(option: WindowOption): string {
  return (windowOptions.find((x) => x.id === option) ?? windowOptions[0]).label;
}

export interface WindowDraft {
  option: WindowOption;
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
    if (!windowOptions.some((o) => o.id === d.option)) return null;
    return d;
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
