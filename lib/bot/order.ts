/** Создание заказа из бота и выборка заказов клиента по телефону. */
import { query } from "@/lib/db";
import { newId, upsertUserByPhone, normalizePhone } from "@/lib/auth";
import { getPricing } from "@/lib/pricing";
import { computeCalc, calcTitle, calcCleaningTypes, selectedAddonList, type CalcState } from "@/lib/calc";
import { notifyOwnerNewBooking } from "@/lib/notify";
import { createPayment } from "@/lib/yookassa";
import { formatDateCard } from "@/lib/booking";
import { siteConfig } from "@/lib/site";
import type { BotPlatform, BotState } from "./types";

function typeLabel(id?: string): string {
  return calcCleaningTypes.find((t) => t.id === id)?.label ?? "Уборка";
}

/** Итоговая цена по состоянию бота (с учётом допуслуг и правок цен из админки). */
export async function botOrderTotal(state: BotState): Promise<number> {
  const pricing = await getPricing();
  return computeCalc(botCalcState(state), pricing).total;
}

function botCalcState(state: BotState): CalcState {
  return {
    rooms: state.rooms ?? 1,
    cleaningType: state.cleaningType ?? "regular",
    propertyType: state.propertyType ?? "apartment",
    addons: state.addons ?? {},
  };
}

/** Создаёт заказ под аккаунтом пользователя (ищем/создаём по телефону). */
export async function createBotOrder(
  platform: BotPlatform,
  state: BotState,
  payment: "card" | "cash"
): Promise<{ id: string; total: number }> {
  const phone = normalizePhone(state.phone ?? "") ?? state.phone!;
  const user = await upsertUserByPhone(phone);

  // если у аккаунта ещё нет имени, а бот его знает — сохраняем
  if (state.name && !user.name) {
    await query("UPDATE users SET name = $1 WHERE id = $2 AND (name IS NULL OR name = '')", [state.name, user.id]).catch(
      () => {}
    );
  }

  const pricing = await getPricing();
  const calcState = botCalcState(state);
  const result = computeCalc(calcState, pricing);
  const total = result.total;
  const services = selectedAddonList(calcState, pricing);

  const data = {
    kind: "cleaning",
    source: platform, // "telegram" | "max" — видно в админке, откуда заказ
    title: calcTitle(calcState.rooms, calcState.propertyType),
    cleaningType: state.cleaningType,
    cleaningTypeLabel: typeLabel(state.cleaningType),
    rooms: state.rooms,
    baths: 1,
    propertyType: state.propertyType,
    services,
    city: "Ростов-на-Дону",
    street: state.address ?? "",
    apartment: "",
    date: state.date ?? "",
    time: state.time ?? "",
    payment,
    name: state.name ?? "",
    phone,
    email: "",
    comment: state.comment ?? "",
    price: { base: result.base, optionsTotal: result.addonsTotal, surgePercent: 0, surgeAmount: result.ecoAmount, total },
  };

  const id = newId();
  await query(
    `INSERT INTO bookings (id, user_id, data, status, total) VALUES ($1, $2, $3, 'searching', $4)`,
    [id, user.id, JSON.stringify(data), total]
  );

  await notifyOwnerNewBooking(data, phone, total).catch(() => {});

  return { id, total };
}

/**
 * Ссылка на оплату заказа картой (ЮKassa). Без ключей ЮKassa — тест-режим:
 * помечаем заказ оплаченным и ведём в личный кабинет.
 */
export async function createBotPaymentLink(
  bookingId: string,
  total: number
): Promise<{ url: string; test: boolean }> {
  const returnUrl = `${siteConfig.url}/profile?paid=${bookingId}`;
  try {
    const payment = await createPayment({
      amount: total,
      description: `Уборка floby, заказ ${bookingId.slice(0, 8)}`,
      metadata: { booking_id: bookingId },
      returnUrl,
    });
    if (payment) {
      await query("UPDATE bookings SET payment_id = $1 WHERE id = $2", [payment.id, bookingId]);
      return { url: payment.confirmationUrl, test: false };
    }
  } catch {
    /* ниже — фолбэк */
  }
  // Тест-режим (нет ключей ЮKassa): помечаем оплаченным
  await query("UPDATE bookings SET paid = true WHERE id = $1", [bookingId]).catch(() => {});
  return { url: returnUrl, test: true };
}

export interface BotOrderSummary {
  date: string;
  time: string;
  title: string;
  total: number;
  status: string;
}

const STATUS_LABEL: Record<string, string> = {
  searching: "🔎 Ищем клинера",
  assigned: "✅ Назначен клинер",
  in_progress: "🧹 Идёт уборка",
  done: "🎉 Выполнено",
  cancelled: "✖️ Отменён",
};

/** Последние заказы клиента по телефону — для «Мои заказы» в боте. */
export async function listOrdersByPhone(rawPhone: string, limit = 5): Promise<string> {
  const phone = normalizePhone(rawPhone) ?? rawPhone;
  const rows = await query<{ data: unknown; status: string; total: number; created_at: string }>(
    `SELECT b.data, b.status, b.total, b.created_at
       FROM bookings b JOIN users u ON u.id = b.user_id
      WHERE u.phone = $1 ORDER BY b.created_at DESC LIMIT $2`,
    [phone, limit]
  );
  if (!rows.length) return "У вас пока нет заказов. Нажмите «Заказать уборку», чтобы оформить первый.";

  const lines = rows.map((r) => {
    const d = (typeof r.data === "string" ? JSON.parse(r.data) : r.data) as {
      title?: string;
      date?: string;
      time?: string;
    };
    const when = d.date ? `${formatDateCard(d.date)}${d.time ? `, ${d.time}` : ""}` : "дата уточняется";
    const status = STATUS_LABEL[r.status] ?? r.status;
    return `• ${d.title ?? "Уборка"}\n  ${when} — ${r.total} ₽ · ${status}`;
  });
  return `Ваши последние заказы:\n\n${lines.join("\n\n")}`;
}
