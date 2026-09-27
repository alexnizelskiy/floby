import { NextResponse } from "next/server";
import { processUpdate } from "@/lib/bot";
import { parseTelegramUpdate, sendTelegram, answerCallback } from "@/lib/bot/telegram";

// Telegram шлёт апдейты сюда. URL регистрируется через setWebhook.
export async function POST(request: Request) {
  // Проверка секрета (Telegram кладёт его в заголовок при setWebhook с secret_token).
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ ok: false, error: "no_token" }, { status: 200 });
  }

  try {
    const body = await request.json();
    const parsed = parseTelegramUpdate(body);
    if (!parsed) return NextResponse.json({ ok: true });

    if (parsed.callbackQueryId) await answerCallback(parsed.callbackQueryId);

    const messages = await processUpdate("telegram", parsed.chatId, parsed.input);
    await sendTelegram(parsed.chatId, messages, parsed.messageId);
  } catch (err) {
    console.error("[bot:tg] webhook error", err);
  }
  // Telegram нужен 200, иначе он будет ретраить.
  return NextResponse.json({ ok: true });
}
