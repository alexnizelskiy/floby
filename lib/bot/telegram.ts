/** Транспорт Telegram: разбор апдейтов и отправка сообщений. */
import type { NormalizedInput, OutMessage } from "./types";

const API = (method: string) => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;

interface TgUpdate {
  message?: {
    chat: { id: number };
    text?: string;
    contact?: { phone_number: string; first_name?: string; last_name?: string };
    from?: { first_name?: string; last_name?: string };
  };
  callback_query?: {
    id: string;
    data?: string;
    message?: { chat: { id: number }; message_id?: number };
    from?: { first_name?: string; last_name?: string };
  };
}

export interface TgParsed {
  chatId: string;
  input: NormalizedInput;
  callbackQueryId?: string;
  messageId?: number;
}

export function parseTelegramUpdate(body: TgUpdate): TgParsed | null {
  if (body.callback_query) {
    const cq = body.callback_query;
    const chatId = cq.message?.chat.id;
    if (chatId == null || !cq.data) return null;
    return {
      chatId: String(chatId),
      input: { kind: "callback", data: cq.data },
      callbackQueryId: cq.id,
      messageId: cq.message?.message_id,
    };
  }
  const m = body.message;
  if (!m) return null;
  const chatId = String(m.chat.id);

  if (m.contact) {
    const name = [m.contact.first_name, m.contact.last_name].filter(Boolean).join(" ") || undefined;
    return { chatId, input: { kind: "contact", phone: m.contact.phone_number, name } };
  }
  if (typeof m.text === "string") {
    if (m.text.startsWith("/")) return { chatId, input: { kind: "command", value: m.text } };
    return { chatId, input: { kind: "text", value: m.text } };
  }
  return null;
}

function replyMarkup(msg: OutMessage): unknown {
  if (msg.keyboard && msg.keyboard.length) {
    const hasContact = msg.keyboard.some((row) => row.some((b) => b.contact));
    if (hasContact) {
      return {
        keyboard: msg.keyboard.map((row) =>
          row.map((b) => (b.contact ? { text: b.text, request_contact: true } : { text: b.text }))
        ),
        resize_keyboard: true,
        one_time_keyboard: true,
      };
    }
    return {
      inline_keyboard: msg.keyboard.map((row) =>
        row.map((b) => (b.url ? { text: b.text, url: b.url } : { text: b.text, callback_data: b.data ?? b.text }))
      ),
    };
  }
  if (msg.removeKeyboard) return { remove_keyboard: true };
  return undefined;
}

export async function sendTelegram(chatId: string, messages: OutMessage[], sourceMessageId?: number): Promise<void> {
  for (const msg of messages) {
    // Тоггл допуслуг — редактируем то же сообщение, а не плодим новые.
    if (msg.edit && sourceMessageId != null) {
      await fetch(API("editMessageText"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: sourceMessageId,
          text: msg.text,
          disable_web_page_preview: true,
          reply_markup: replyMarkup(msg),
        }),
      }).catch((e) => console.error("[bot:tg] edit failed", e));
      continue;
    }
    await fetch(API("sendMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg.text,
        disable_web_page_preview: true,
        reply_markup: replyMarkup(msg),
      }),
    }).catch((e) => console.error("[bot:tg] send failed", e));
  }
}

export async function answerCallback(callbackQueryId: string): Promise<void> {
  await fetch(API("answerCallbackQuery"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  }).catch(() => {});
}
