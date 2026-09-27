/** Оркестратор: загрузка сессии → сценарий → сохранение сессии. */
import { getBotState, saveBotState } from "./session";
import { handleFlow } from "./flow";
import type { BotPlatform, NormalizedInput, OutMessage } from "./types";

export async function processUpdate(
  platform: BotPlatform,
  chatId: string,
  input: NormalizedInput
): Promise<OutMessage[]> {
  const state = await getBotState(platform, chatId);
  const { state: next, messages } = await handleFlow(platform, state, input);
  await saveBotState(platform, chatId, next);
  return messages;
}

export type { BotPlatform, NormalizedInput, OutMessage } from "./types";
