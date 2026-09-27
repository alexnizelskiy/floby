/**
 * Транспорт MAX (botapi.max.ru). Форматы по официальному SDK max-botapi-python:
 * - токен как query ?access_token=<token>
 * - отправка: POST /messages?chat_id=<id> { text, attachments:[{type:"inline_keyboard",payload:{buttons}}] }
 * - кнопки: {type:"callback",text,payload} и {type:"request_contact",text}
 * - апдейты: message_created / message_callback; контакт — вложение type:"contact"
 */
import type { BotButton, NormalizedInput, OutMessage } from "./types";

const BASE = process.env.MAX_API_BASE || "https://botapi.max.ru";
const token = () => process.env.MAX_BOT_TOKEN ?? "";

function url(path: string, params: Record<string, string> = {}): string {
  const q = new URLSearchParams({ access_token: token(), ...params });
  return `${BASE}${path}?${q.toString()}`;
}

/* ─── Входящие апдейты ────────────────────────────────────── */

interface MaxAttachment {
  type: string;
  payload?: { vcfInfo?: string; vcf_info?: string; max_info?: { phone?: string }; phone?: string };
}
interface MaxMessage {
  sender?: { user_id?: number; name?: string };
  recipient?: { chat_id?: number; user_id?: number };
  body?: { text?: string; attachments?: MaxAttachment[] };
}
interface MaxUpdate {
  update_type?: string;
  message?: MaxMessage;
  callback?: { callback_id?: string; payload?: string; user?: { name?: string } };
  user?: { user_id?: number; name?: string };
  chat_id?: number;
}

export interface MaxParsed {
  chatId: string;
  input: NormalizedInput;
  callbackId?: string;
}

/** Достаём телефон из вложения-контакта (vCard или max_info). */
function extractPhone(att?: MaxAttachment): string | null {
  const p = att?.payload;
  if (!p) return null;
  if (p.phone) return p.phone;
  if (p.max_info?.phone) return p.max_info.phone;
  const vcf = p.vcfInfo || p.vcf_info;
  if (vcf) {
    const m = vcf.match(/TEL[^:]*:([+\d][\d\s()-]{6,})/i);
    if (m) return m[1].replace(/[\s()-]/g, "");
  }
  return null;
}

export function parseMaxUpdate(body: MaxUpdate): MaxParsed | null {
  const t = body.update_type;

  if (t === "message_callback" && body.callback) {
    const chatId = body.message?.recipient?.chat_id;
    if (chatId == null || body.callback.payload == null) return null;
    return {
      chatId: String(chatId),
      input: { kind: "callback", data: body.callback.payload },
      callbackId: body.callback.callback_id,
    };
  }

  if (t === "bot_started") {
    const chatId = body.chat_id ?? body.user?.user_id;
    if (chatId == null) return null;
    return { chatId: String(chatId), input: { kind: "command", value: "/start" } };
  }

  if (t === "message_created" && body.message) {
    const m = body.message;
    const chatId = m.recipient?.chat_id ?? m.recipient?.user_id;
    if (chatId == null) return null;
    const chat = String(chatId);
    const name = m.sender?.name;

    const contactAtt = m.body?.attachments?.find((a) => a.type === "contact");
    if (contactAtt) {
      const phone = extractPhone(contactAtt);
      if (phone) return { chatId: chat, input: { kind: "contact", phone, name } };
    }

    const text = m.body?.text;
    if (typeof text === "string" && text.length) {
      if (text.startsWith("/")) return { chatId: chat, input: { kind: "command", value: text } };
      return { chatId: chat, input: { kind: "text", value: text } };
    }
  }

  return null;
}

/* ─── Исходящие сообщения ─────────────────────────────────── */

function keyboardAttachment(keyboard: BotButton[][]) {
  const buttons = keyboard.map((row) =>
    row.map((b) =>
      b.contact
        ? { type: "request_contact", text: b.text }
        : { type: "callback", text: b.text, payload: b.data ?? b.text }
    )
  );
  return { type: "inline_keyboard", payload: { buttons } };
}

export async function sendMax(chatId: string, messages: OutMessage[]): Promise<void> {
  for (const msg of messages) {
    const attachments = msg.keyboard && msg.keyboard.length ? [keyboardAttachment(msg.keyboard)] : [];
    await fetch(url("/messages", { chat_id: chatId }), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: msg.text, attachments, notify: true }),
    }).catch((e) => console.error("[bot:max] send failed", e));
  }
}

export async function answerMaxCallback(callbackId: string): Promise<void> {
  await fetch(url("/answers", { callback_id: callbackId }), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  }).catch(() => {});
}
