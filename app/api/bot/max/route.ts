import { NextResponse } from "next/server";
import { processUpdate } from "@/lib/bot";
import { parseMaxUpdate, sendMax, answerMaxCallback } from "@/lib/bot/max";

// MAX шлёт апдейты сюда. Вебхук регистрируется через POST /subscriptions,
// URL при регистрации указываем с ?secret=<MAX_WEBHOOK_SECRET> для проверки.
export async function POST(request: Request) {
  const secret = process.env.MAX_WEBHOOK_SECRET;
  if (secret) {
    const got = new URL(request.url).searchParams.get("secret");
    if (got !== secret) return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!process.env.MAX_BOT_TOKEN) {
    return NextResponse.json({ ok: false, error: "no_token" }, { status: 200 });
  }

  try {
    const body = await request.json();
    const parsed = parseMaxUpdate(body);
    if (!parsed) return NextResponse.json({ ok: true });

    if (parsed.callbackId) await answerMaxCallback(parsed.callbackId);

    const messages = await processUpdate("max", parsed.chatId, parsed.input);
    await sendMax(parsed.chatId, messages);
  } catch (err) {
    console.error("[bot:max] webhook error", err);
  }
  return NextResponse.json({ ok: true });
}
