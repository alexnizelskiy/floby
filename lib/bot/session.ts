/** Хранилище диалоговых сессий бота (таблица bot_sessions). Serverless-safe. */
import { query, queryOne } from "@/lib/db";
import { type BotPlatform, type BotState, initialState } from "./types";

export async function getBotState(platform: BotPlatform, chatId: string): Promise<BotState> {
  try {
    const row = await queryOne<{ state: unknown }>(
      "SELECT state FROM bot_sessions WHERE platform = $1 AND chat_id = $2",
      [platform, chatId]
    );
    if (!row?.state) return { ...initialState };
    return (typeof row.state === "string" ? JSON.parse(row.state) : row.state) as BotState;
  } catch {
    return { ...initialState };
  }
}

export async function saveBotState(platform: BotPlatform, chatId: string, state: BotState): Promise<void> {
  await query(
    `INSERT INTO bot_sessions (platform, chat_id, state) VALUES ($1, $2, $3)
     ON CONFLICT (platform, chat_id) DO UPDATE SET state = $3, updated_at = now()`,
    [platform, chatId, JSON.stringify(state)]
  );
}

export async function clearBotState(platform: BotPlatform, chatId: string): Promise<void> {
  await query("DELETE FROM bot_sessions WHERE platform = $1 AND chat_id = $2", [platform, chatId]).catch(() => {});
}
