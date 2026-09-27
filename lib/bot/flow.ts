/**
 * Ядро диалога бота — машина состояний заказа уборки.
 * Транспортно-независимо: принимает NormalizedInput, возвращает OutMessage[]
 * и следующее состояние. Побочные эффекты (создание заказа, список заказов)
 * выполняются здесь через lib/bot/order.
 */
import {
  calcCleaningTypes,
  roomTiers,
  propertyTypes,
  computeCalc,
  calcTitle,
  type CalcState,
} from "@/lib/calc";
import { getPricing } from "@/lib/pricing";
import { generateDates, generateTimes, formatDateShort, formatDateCard } from "@/lib/booking";
import { createBotOrder, listOrdersByPhone } from "./order";
import {
  type BotButton,
  type BotPlatform,
  type BotState,
  type NormalizedInput,
  type OutMessage,
  initialState,
} from "./types";

const SITE = "https://floby.ru";

function rub(n: number): string {
  return `${n.toLocaleString("ru-RU")} ₽`;
}

/* ─── Экраны ──────────────────────────────────────────────── */

function greeting(): OutMessage {
  return {
    text: "Привет! Я бот floby 🧹\nПомогу заказать уборку в Ростове-на-Дону за минуту.",
    removeKeyboard: true,
    keyboard: [
      [{ text: "🧽 Заказать уборку", data: "order" }],
      [{ text: "📋 Мои заказы", data: "list" }],
    ],
  };
}

function askType(): OutMessage {
  return {
    text: "Какая уборка нужна?",
    keyboard: calcCleaningTypes.map((t) => [{ text: t.label, data: `type:${t.id}` }]),
  };
}

function askRooms(): OutMessage {
  return {
    text: "Сколько комнат?",
    keyboard: [roomTiers.map((r) => ({ text: r.label, data: `rooms:${r.rooms}` }))],
  };
}

function askProperty(): OutMessage {
  return {
    text: "Квартира или дом?",
    keyboard: [propertyTypes.map((p) => ({ text: p.label, data: `prop:${p.id}` }))],
  };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function askDate(): OutMessage {
  const buttons: BotButton[] = generateDates(14).map((iso) => ({ text: formatDateShort(iso), data: `date:${iso}` }));
  return { text: "Выберите дату:", keyboard: chunk(buttons, 2) };
}

function askTime(): OutMessage {
  const hourly = generateTimes().filter((t) => t.endsWith(":00"));
  const buttons: BotButton[] = hourly.map((t) => ({ text: t, data: `time:${t}` }));
  return { text: "Во сколько приехать?", keyboard: chunk(buttons, 3) };
}

function askAddress(): OutMessage {
  return { text: "Напишите адрес: улица, дом, квартира.\nНапример: ул. Пушкинская, 10, кв. 12" };
}

function askComment(): OutMessage {
  return {
    text: "Добавьте комментарий (домофон, пожелания, доп. услуги) или нажмите «Пропустить».",
    keyboard: [[{ text: "Пропустить", data: "comment:skip" }]],
  };
}

function askContact(purpose: "order" | "list"): OutMessage {
  return {
    text:
      purpose === "order"
        ? "Остался последний шаг — отправьте номер телефона кнопкой ниже. Заказ сохранится в вашем личном кабинете на сайте."
        : "Отправьте номер телефона кнопкой ниже — покажу ваши заказы.",
    keyboard: [[{ text: "📱 Отправить телефон", contact: true }]],
  };
}

function confirmScreen(state: BotState, total: number): OutMessage {
  const typeLabel = calcCleaningTypes.find((t) => t.id === state.cleaningType)?.label ?? "Уборка";
  const propLabel = propertyTypes.find((p) => p.id === state.propertyType)?.label ?? "Квартира";
  const lines = [
    "Проверьте заказ:",
    "",
    `🧹 ${typeLabel} · ${state.rooms} комн. · ${propLabel}`,
    `📅 ${state.date ? formatDateCard(state.date) : "—"}${state.time ? `, ${state.time}` : ""}`,
    `📍 ${state.address || "—"}`,
    state.comment ? `💬 ${state.comment}` : "",
    "",
    `Стоимость: ~${rub(total)}`,
    "Это базовая цена — доп. услуги и точную сумму менеджер уточнит при подтверждении.",
  ].filter(Boolean);
  return {
    text: lines.join("\n"),
    removeKeyboard: true,
    keyboard: [
      [{ text: "✅ Подтвердить заказ", data: "confirm:yes" }],
      [{ text: "✖️ Отменить", data: "confirm:no" }],
    ],
  };
}

async function orderTotal(state: BotState): Promise<number> {
  const pricing = await getPricing();
  const calcState: CalcState = {
    rooms: state.rooms ?? 1,
    cleaningType: state.cleaningType ?? "regular",
    propertyType: state.propertyType ?? "apartment",
    addons: {},
  };
  return computeCalc(calcState, pricing).total;
}

/* ─── Машина состояний ────────────────────────────────────── */

export interface FlowResult {
  state: BotState;
  messages: OutMessage[];
}

function reset(): BotState {
  return { ...initialState };
}

/** Обработать один вход и вернуть следующее состояние + ответы. */
export async function handleFlow(
  platform: BotPlatform,
  state: BotState,
  input: NormalizedInput
): Promise<FlowResult> {
  // Глобальные команды
  if (input.kind === "command" || (input.kind === "text" && /^\/start\b/.test(input.value))) {
    return { state: reset(), messages: [greeting()] };
  }

  if (input.kind === "callback") {
    // режем только по первому ":" — значение может содержать ":" (например время 10:00)
    const idx = input.data.indexOf(":");
    const key = idx === -1 ? input.data : input.data.slice(0, idx);
    const value = idx === -1 ? "" : input.data.slice(idx + 1);

    switch (key) {
      case "order":
        return { state: { step: "type" }, messages: [askType()] };
      case "list":
        return { state: { step: "list_contact" }, messages: [askContact("list")] };
      case "type":
        return { state: { ...state, step: "rooms", cleaningType: value as BotState["cleaningType"] }, messages: [askRooms()] };
      case "rooms":
        return { state: { ...state, step: "property", rooms: Number(value) }, messages: [askProperty()] };
      case "prop":
        return { state: { ...state, step: "date", propertyType: value as BotState["propertyType"] }, messages: [askDate()] };
      case "date":
        return { state: { ...state, step: "time", date: value }, messages: [askTime()] };
      case "time":
        return { state: { ...state, step: "address", time: value }, messages: [askAddress()] };
      case "comment":
        if (value === "skip") return { state: { ...state, step: "contact", comment: "" }, messages: [askContact("order")] };
        break;
      case "confirm":
        if (value === "no") return { state: reset(), messages: [{ text: "Заказ отменён." }, greeting()] };
        if (value === "yes") {
          if (state.step !== "confirm" || !state.phone) {
            return { state, messages: [greeting()] };
          }
          const { id, total } = await createBotOrder(platform, state);
          const done: OutMessage = {
            text: [
              "Заказ оформлен! 🎉",
              `Номер заказа: ${id.slice(0, 8).toUpperCase()}`,
              "",
              `Стоимость: ~${rub(total)}. Менеджер свяжется с вами по телефону ${state.phone}.`,
              "",
              `Заказ уже в вашем личном кабинете на сайте — войдите по этому же номеру телефона:`,
              `${SITE}/profile`,
            ].join("\n"),
            removeKeyboard: true,
          };
          return { state: reset(), messages: [done, greeting()] };
        }
        break;
    }
    // callback не совпал с текущим шагом — мягко подсказываем
    return { state, messages: [resendCurrent(state)] };
  }

  if (input.kind === "contact") {
    const st: BotState = { ...state, phone: input.phone, name: input.name ?? state.name };
    if (state.step === "list_contact") {
      const list = await listOrdersByPhone(input.phone);
      return { state: reset(), messages: [{ text: list, removeKeyboard: true }, greeting()] };
    }
    // основной сценарий: телефон → подтверждение
    const total = await orderTotal(st);
    return { state: { ...st, step: "confirm" }, messages: [confirmScreen(st, total)] };
  }

  if (input.kind === "text") {
    if (state.step === "address") {
      const address = input.value.trim();
      if (address.length < 5) return { state, messages: [{ text: "Уточните адрес подробнее (улица и дом)." }] };
      return { state: { ...state, step: "comment", address }, messages: [askComment()] };
    }
    if (state.step === "comment") {
      return { state: { ...state, step: "contact", comment: input.value.trim() }, messages: [askContact("order")] };
    }
    // неожиданный текст — повторяем текущий экран
    return { state, messages: [resendCurrent(state)] };
  }

  return { state, messages: [greeting()] };
}

/** Повторно показать экран текущего шага (когда пришло что-то не то). */
function resendCurrent(state: BotState): OutMessage {
  switch (state.step) {
    case "type":
      return askType();
    case "rooms":
      return askRooms();
    case "property":
      return askProperty();
    case "date":
      return askDate();
    case "time":
      return askTime();
    case "address":
      return askAddress();
    case "comment":
      return askComment();
    case "contact":
      return askContact("order");
    case "list_contact":
      return askContact("list");
    default:
      return greeting();
  }
}
