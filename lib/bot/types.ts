/**
 * Транспортно-независимые типы бота заказа уборки.
 * Одно ядро (flow.ts) обслуживает Telegram и MAX — адаптеры лишь переводят
 * входящие апдейты в NormalizedInput и рисуют OutMessage в API мессенджера.
 */
import type { CalcCleaningType, PropertyType } from "@/lib/calc";

export type BotPlatform = "telegram" | "max";

/** Кнопка. `data` — callback; `url` — ссылка; `contact: true` — запрос телефона. */
export interface BotButton {
  text: string;
  data?: string;
  url?: string;
  contact?: boolean;
}

export interface OutMessage {
  text: string;
  /** Сетка inline-кнопок (ряды). */
  keyboard?: BotButton[][];
  /** Убрать нижнюю клавиатуру (после запроса контакта). */
  removeKeyboard?: boolean;
  /** Редактировать сообщение, с которого пришёл callback (для тоггла допуслуг). */
  edit?: boolean;
}

/** Нормализованный вход из любого мессенджера. */
export type NormalizedInput =
  | { kind: "command"; value: string } // /start
  | { kind: "callback"; data: string } // нажата inline-кнопка
  | { kind: "text"; value: string } // произвольный текст
  | { kind: "contact"; phone: string; name?: string };

/** Шаги сценария заказа. */
export type BotStep =
  | "idle"
  | "type"
  | "rooms"
  | "property"
  | "addons"
  | "date"
  | "time"
  | "address"
  | "comment"
  | "contact"
  | "confirm"
  | "list_contact";

/** Состояние диалога (хранится в bot_sessions.state). */
export interface BotState {
  step: BotStep;
  cleaningType?: CalcCleaningType;
  rooms?: number;
  propertyType?: PropertyType;
  addons?: Record<string, number>;
  date?: string;
  time?: string;
  address?: string;
  comment?: string;
  phone?: string;
  name?: string;
  /** Запомненный номер/имя — переживают reset(), чтобы не спрашивать каждый раз. */
  savedPhone?: string;
  savedName?: string;
}

export const initialState: BotState = { step: "idle" };
