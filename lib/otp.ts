/**
 * Единая отправка кода подтверждения по доступным каналам.
 * Порядок: Telegram Gateway (если у номера есть Telegram) → звонок (Zvonok) →
 * SMS (SMS Aero → SMSC) → dev.
 * Возвращает канал и ФАКТИЧЕСКИЙ код для сохранения: при звонке код задаёт сам
 * сервис (последние цифры номера звонящего), поэтому его надо хранить/сверять.
 */
import { sendZvonokFlashCall } from "./zvonok";
import { sendTelegramGatewayCode } from "./telegram-gateway";
import { sendSmsAero } from "./smsaero";
import { sendSms } from "./sms";

export type OtpChannel = "call" | "telegram" | "sms" | "dev";
export interface OtpResult {
  ok: boolean;
  channel: OtpChannel;
  /** Код, который нужно сохранить и сверять (для flash-call — от провайдера). */
  code: string;
}

export async function sendVerificationCode(phone: string, fallbackCode: string): Promise<OtpResult> {
  const smsText = `Ваш код для входа в floby: ${fallbackCode}`;

  // 1) Telegram Gateway — если у номера есть Telegram (checkSendAbility внутри)
  if (process.env.TELEGRAM_GATEWAY_TOKEN) {
    const tg = await sendTelegramGatewayCode(phone, fallbackCode);
    if (tg.ok) return { ok: true, channel: "telegram", code: fallbackCode };
  }
  // 2) Звонок Zvonok — код задаёт сервис (последние цифры номера)
  if (process.env.ZVONOK_PUBLIC_KEY && process.env.ZVONOK_CAMPAIGN_ID) {
    const call = await sendZvonokFlashCall(phone);
    if (call.ok && call.pincode) return { ok: true, channel: "call", code: call.pincode };
  }
  // 3) SMS Aero — знак «SMS Aero» без подтверждения компании
  if (process.env.SMSAERO_EMAIL && process.env.SMSAERO_API_KEY) {
    const aero = await sendSmsAero(phone, smsText);
    if (aero.ok) return { ok: true, channel: "sms", code: fallbackCode };
  }
  // 4) SMS через SMSC — если настроен (нужен договор ИП/юрлица)
  if (process.env.SMSC_LOGIN && process.env.SMSC_PASSWORD) {
    const sms = await sendSms(phone, smsText);
    if (sms.ok && !sms.dev) return { ok: true, channel: "sms", code: fallbackCode };
  }
  // 5) Нет настроенного канала — dev-режим (код виден только вне production)
  console.info(`[floby][otp:dev] -> ${phone}: ${fallbackCode}`);
  return { ok: true, channel: "dev", code: fallbackCode };
}
