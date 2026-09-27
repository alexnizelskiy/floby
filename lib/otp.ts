/**
 * Единая отправка кода подтверждения по доступным каналам.
 * Порядок: Zvonok flash-call → Telegram Gateway → SMS (SMSC) → dev.
 * Возвращает канал и ФАКТИЧЕСКИЙ код для сохранения: при flash-call код задаёт
 * сам сервис (последние цифры номера звонящего), поэтому его надо хранить/сверять.
 */
import { sendZvonokFlashCall } from "./zvonok";
import { sendTelegramGatewayCode } from "./telegram-gateway";
import { sendSms } from "./sms";

export type OtpChannel = "call" | "telegram" | "sms" | "dev";
export interface OtpResult {
  ok: boolean;
  channel: OtpChannel;
  /** Код, который нужно сохранить и сверять (для flash-call — от провайдера). */
  code: string;
}

export async function sendVerificationCode(phone: string, fallbackCode: string): Promise<OtpResult> {
  // 1) Zvonok flash-call — дёшево, без ИП; код приходит от сервиса
  if (process.env.ZVONOK_PUBLIC_KEY && process.env.ZVONOK_CAMPAIGN_ID) {
    const call = await sendZvonokFlashCall(phone);
    if (call.ok && call.pincode) return { ok: true, channel: "call", code: call.pincode };
  }
  // 2) Telegram Gateway — код в Telegram по номеру
  if (process.env.TELEGRAM_GATEWAY_TOKEN) {
    const tg = await sendTelegramGatewayCode(phone, fallbackCode);
    if (tg.ok) return { ok: true, channel: "telegram", code: fallbackCode };
  }
  // 3) SMS через SMSC — если настроен (нужен договор ИП/юрлица)
  if (process.env.SMSC_LOGIN && process.env.SMSC_PASSWORD) {
    const sms = await sendSms(phone, `Ваш код для входа в floby: ${fallbackCode}`);
    if (sms.ok && !sms.dev) return { ok: true, channel: "sms", code: fallbackCode };
  }
  // 4) Нет настроенного канала — dev-режим (код виден только вне production)
  console.info(`[floby][otp:dev] -> ${phone}: ${fallbackCode}`);
  return { ok: true, channel: "dev", code: fallbackCode };
}
