import { queryOne } from "@/lib/db";
import { sendSms } from "@/lib/sms";
import { optionMap } from "@/lib/booking";

/** Telegram message to the business owner. Dev/no-config → console. */
async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) {
    console.info("[floby][tg:dev]\n" + text);
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
  } catch (err) {
    console.error("[floby][tg] failed:", err);
  }
}

interface BookingData {
  rooms?: number; baths?: number; city?: string; street?: string; apartment?: string;
  date?: string; time?: string; payment?: string; comment?: string;
  optionIds?: string[]; name?: string;
}

/** Notify the owner about a new order. */
export async function notifyOwnerNewBooking(data: BookingData, phone: string, payable: number): Promise<void> {
  const opts = (data.optionIds ?? []).map((id) => optionMap.get(id)?.title ?? id).join(", ");
  const lines = [
    "🧹 <b>Новая заявка floby</b>",
    `Клиент: ${data.name || "—"} ${phone}`,
    `Когда: ${data.date} ${data.time}`,
    `Адрес: ${[data.city, data.street, data.apartment && "кв. " + data.apartment].filter(Boolean).join(", ")}`,
    `Объём: ${data.rooms}-комн., ${data.baths} санузел`,
    opts && `Опции: ${opts}`,
    `Оплата: ${data.payment === "card" ? "картой" : "наличными"}`,
    `К оплате: ${payable} ₽`,
    data.comment && `Пожелания: ${data.comment}`,
  ].filter(Boolean);
  await sendTelegram(lines.join("\n"));
}

/** SMS the client when their order status changes. */
export async function notifyBookingStatus(bookingId: string, status: string): Promise<void> {
  const row = await queryOne<{ data: unknown; phone: string }>(
    "SELECT b.data, cu.phone FROM bookings b JOIN users cu ON cu.id = b.user_id WHERE b.id = $1",
    [bookingId]
  );
  if (!row) return;
  const data = (typeof row.data === "string" ? JSON.parse(row.data) : row.data) as BookingData;

  let text: string | null = null;
  if (status === "assigned") text = `floby: вам назначен клинер на ${data.date} ${data.time}. Ждём встречи!`;
  else if (status === "in_progress") text = `floby: клинер приступил к уборке. Хорошего дня!`;
  else if (status === "done") text = `floby: уборка выполнена. Спасибо! Будем рады вашей оценке в личном кабинете.`;
  if (text) await sendSms(row.phone, text);
}
