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
  calcAddons,
  addonPrice,
  selectedAddonList,
  type PricingOverride,
} from "@/lib/calc";
import { getPricing } from "@/lib/pricing";
import { generateDates, generateTimes, formatDateShort, formatDateCard } from "@/lib/booking";
import { createBotOrder, createBotPaymentLink, botOrderTotal, listOrdersByPhone } from "./order";
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

function greeting(state?: BotState): OutMessage {
  const keyboard = [
    [{ text: "🧽 Заказать уборку", data: "order" }],
    [{ text: "📋 Мои заказы", data: "list" }],
  ];
  if (state?.savedPhone) keyboard.push([{ text: "📱 Сменить номер", data: "resetphone" }]);
  return {
    text: "Привет! Я бот floby 🧹\nПомогу заказать уборку в Ростове-на-Дону за минуту.",
    removeKeyboard: true,
    keyboard,
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

const ADDON_LIST = calcAddons.filter((a) => a.mode !== "percent");

function addonsScreen(state: BotState, pricing: PricingOverride, edit: boolean): OutMessage {
  const sel = state.addons ?? {};
  const count = Object.values(sel).filter((v) => v > 0).length;
  const rows = ADDON_LIST.map((a) => {
    const on = (sel[a.id] ?? 0) > 0;
    const price = addonPrice(a.id, pricing);
    const unit = a.unit ? `/${a.unit}` : "";
    return [{ text: `${on ? "✅" : "◻️"} ${a.title} · ${price}₽${unit}`, data: `addon:${a.id}` }];
  });
  rows.push([{ text: count ? `Готово (${count}) →` : "Без доп. услуг →", data: "adone" }]);
  return {
    text: "Добавить доп. услуги? Отметьте нужные и нажмите «Готово».",
    keyboard: rows,
    edit,
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

function confirmScreen(state: BotState, total: number, pricing: PricingOverride): OutMessage {
  const typeLabel = calcCleaningTypes.find((t) => t.id === state.cleaningType)?.label ?? "Уборка";
  const propLabel = propertyTypes.find((p) => p.id === state.propertyType)?.label ?? "Квартира";
  const addons = selectedAddonList(
    {
      rooms: state.rooms ?? 1,
      cleaningType: state.cleaningType ?? "regular",
      propertyType: state.propertyType ?? "apartment",
      addons: state.addons ?? {},
    },
    pricing
  );
  const lines = [
    "Проверьте заказ:",
    "",
    `🧹 ${typeLabel} · ${state.rooms} комн. · ${propLabel}`,
    addons.length ? `➕ ${addons.map((a) => a.title).join(", ")}` : "",
    `📅 ${state.date ? formatDateCard(state.date) : "—"}${state.time ? `, ${state.time}` : ""}`,
    `📍 ${state.address || "—"}`,
    state.comment ? `💬 ${state.comment}` : "",
    "",
    `Стоимость: ~${rub(total)}`,
    "Точную сумму менеджер подтвердит перед выездом.",
    "",
    "Как оплатите?",
  ].filter(Boolean);
  return {
    text: lines.join("\n"),
    removeKeyboard: true,
    keyboard: [
      [{ text: "💳 Оплатить картой", data: "confirm:pay" }],
      [{ text: "💵 Оплата при уборке", data: "confirm:cash" }],
      [{ text: "✖️ Отменить", data: "confirm:no" }],
    ],
  };
}

/* ─── Машина состояний ────────────────────────────────────── */

export interface FlowResult {
  state: BotState;
  messages: OutMessage[];
}

/** Сброс диалога с сохранением запомненного номера. */
function reset(state?: BotState): BotState {
  return { ...initialState, savedPhone: state?.savedPhone, savedName: state?.savedName };
}

/** После комментария: если номер уже запомнен — сразу к подтверждению. */
async function afterComment(state: BotState): Promise<FlowResult> {
  if (state.savedPhone) {
    const st: BotState = { ...state, phone: state.savedPhone, name: state.name ?? state.savedName };
    const pricing = await getPricing();
    const total = await botOrderTotal(st);
    return { state: { ...st, step: "confirm" }, messages: [confirmScreen(st, total, pricing)] };
  }
  return { state: { ...state, step: "contact" }, messages: [askContact("order")] };
}

/** Обработать один вход и вернуть следующее состояние + ответы. */
export async function handleFlow(
  platform: BotPlatform,
  state: BotState,
  input: NormalizedInput
): Promise<FlowResult> {
  // Глобальные команды
  if (input.kind === "command" || (input.kind === "text" && /^\/start\b/.test(input.value))) {
    const s = reset(state);
    return { state: s, messages: [greeting(s)] };
  }

  if (input.kind === "callback") {
    // режем только по первому ":" — значение может содержать ":" (например время 10:00)
    const idx = input.data.indexOf(":");
    const key = idx === -1 ? input.data : input.data.slice(0, idx);
    const value = idx === -1 ? "" : input.data.slice(idx + 1);

    switch (key) {
      case "order":
        return { state: { ...reset(state), step: "type" }, messages: [askType()] };
      case "list": {
        if (state.savedPhone) {
          const list = await listOrdersByPhone(state.savedPhone);
          const s = reset(state);
          return { state: s, messages: [{ text: list }, greeting(s)] };
        }
        return { state: { ...reset(state), step: "list_contact" }, messages: [askContact("list")] };
      }
      case "resetphone": {
        const s: BotState = { step: "idle" }; // забываем номер
        return { state: s, messages: [{ text: "Номер сброшен. При следующем заказе спрошу его снова." }, greeting(s)] };
      }
      case "type":
        return { state: { ...state, step: "rooms", cleaningType: value as BotState["cleaningType"] }, messages: [askRooms()] };
      case "rooms":
        return { state: { ...state, step: "property", rooms: Number(value) }, messages: [askProperty()] };
      case "prop": {
        const next = { ...state, step: "addons" as const, propertyType: value as BotState["propertyType"], addons: state.addons ?? {} };
        return { state: next, messages: [addonsScreen(next, await getPricing(), false)] };
      }
      case "addon": {
        const addons = { ...(state.addons ?? {}) };
        addons[value] = addons[value] ? 0 : 1; // тоггл вкл/выкл
        const next = { ...state, addons };
        return { state: next, messages: [addonsScreen(next, await getPricing(), true)] };
      }
      case "adone":
        return { state: { ...state, step: "date" }, messages: [askDate()] };
      case "date":
        return { state: { ...state, step: "time", date: value }, messages: [askTime()] };
      case "time":
        return { state: { ...state, step: "address", time: value }, messages: [askAddress()] };
      case "comment":
        if (value === "skip") return afterComment({ ...state, comment: "" });
        break;
      case "confirm": {
        if (value === "no") {
          const s = reset(state);
          return { state: s, messages: [{ text: "Заказ отменён." }, greeting(s)] };
        }
        if ((value === "pay" || value === "cash") && state.step === "confirm" && state.phone) {
          const payment = value === "pay" ? "card" : "cash";
          const { id, total } = await createBotOrder(platform, state, payment);
          const num = id.slice(0, 8).toUpperCase();
          const footer = [
            "",
            `Заказ уже в вашем личном кабинете на сайте — войдите по этому же номеру телефона:`,
            `${SITE}/profile`,
          ];

          if (payment === "cash") {
            const done: OutMessage = {
              text: [
                "Заказ оформлен! 🎉",
                `Номер: ${num} · к оплате ~${rub(total)} (при уборке).`,
                `Менеджер свяжется с вами по телефону ${state.phone}.`,
                ...footer,
              ].join("\n"),
              removeKeyboard: true,
            };
            const s = reset(state);
            return { state: s, messages: [done, greeting(s)] };
          }

          // Оплата картой — ссылка ЮKassa
          const pay = await createBotPaymentLink(id, total);
          const done: OutMessage = pay.test
            ? {
                text: [
                  "Заказ оформлен! 🎉",
                  `Номер: ${num}. Оплата в тестовом режиме — заказ отмечен оплаченным.`,
                  `Менеджер свяжется с вами по телефону ${state.phone}.`,
                  ...footer,
                ].join("\n"),
                removeKeyboard: true,
              }
            : {
                text: [
                  "Заказ оформлен! 🎉",
                  `Номер: ${num}. Осталось оплатить ${rub(total)} по кнопке ниже.`,
                  `После оплаты менеджер свяжется с вами по телефону ${state.phone}.`,
                  ...footer,
                ].join("\n"),
                removeKeyboard: true,
                keyboard: [[{ text: `💳 Оплатить ${rub(total)}`, url: pay.url }]],
              };
          const s = reset(state);
          return { state: s, messages: [done, greeting(s)] };
        }
        return { state, messages: [greeting(state)] };
      }
    }
    // callback не совпал с текущим шагом — мягко подсказываем
    return { state, messages: [resendCurrent(state)] };
  }

  if (input.kind === "contact") {
    // Запоминаем номер и имя на будущее
    const st: BotState = {
      ...state,
      phone: input.phone,
      name: input.name ?? state.name,
      savedPhone: input.phone,
      savedName: input.name ?? state.savedName,
    };
    if (state.step === "list_contact") {
      const list = await listOrdersByPhone(input.phone);
      const s = reset(st);
      return { state: s, messages: [{ text: list, removeKeyboard: true }, greeting(s)] };
    }
    // основной сценарий: телефон → подтверждение
    const pricing = await getPricing();
    const total = await botOrderTotal(st);
    return { state: { ...st, step: "confirm" }, messages: [confirmScreen(st, total, pricing)] };
  }

  if (input.kind === "text") {
    if (state.step === "address") {
      const address = input.value.trim();
      if (address.length < 5) return { state, messages: [{ text: "Уточните адрес подробнее (улица и дом)." }] };
      return { state: { ...state, step: "comment", address }, messages: [askComment()] };
    }
    if (state.step === "comment") {
      return afterComment({ ...state, comment: input.value.trim() });
    }
    // неожиданный текст — повторяем текущий экран
    return { state, messages: [resendCurrent(state)] };
  }

  return { state, messages: [greeting(state)] };
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
    case "addons":
      return { text: "Отметьте доп. услуги кнопками выше или нажмите «Готово»." };
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
