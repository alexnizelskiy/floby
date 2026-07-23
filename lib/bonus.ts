import { randomUUID } from "node:crypto";
import { query, queryOne } from "@/lib/db";

export const WELCOME_BONUS = 500; // друг получает на первый заказ
export const REFERRER_BONUS = 500; // приглашающий получает после уборки друга
export const MAX_BONUS_PERCENT = 15; // бонусами можно оплатить до 15% заказа

/** Max bonuses applicable to an order total. */
export function maxBonusForOrder(total: number): number {
  return Math.floor((total * MAX_BONUS_PERCENT) / 100);
}

function randomCode(): string {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let s = "";
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}

/** Ensure a user has a referral code; returns it. */
export async function ensureRefCode(userId: string): Promise<string> {
  const row = await queryOne<{ ref_code: string | null }>(
    "SELECT ref_code FROM users WHERE id = $1",
    [userId]
  );
  if (row?.ref_code) return row.ref_code;
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = randomCode();
    try {
      await query("UPDATE users SET ref_code = $1 WHERE id = $2", [code, userId]);
      return code;
    } catch {
      // unique collision — retry
    }
  }
  // extremely unlikely fallback
  const code = randomCode() + randomCode().slice(0, 2);
  await query("UPDATE users SET ref_code = $1 WHERE id = $2", [code, userId]);
  return code;
}

export async function getBalance(userId: string): Promise<number> {
  const row = await queryOne<{ bonus_balance: number }>(
    "SELECT bonus_balance FROM users WHERE id = $1",
    [userId]
  );
  return row?.bonus_balance ?? 0;
}

/** Credit (or debit, if negative) bonuses and log it. */
export async function creditBonus(
  userId: string,
  amount: number,
  reason: string,
  bookingId?: string
): Promise<void> {
  if (!amount) return;
  await query("UPDATE users SET bonus_balance = bonus_balance + $1 WHERE id = $2", [amount, userId]);
  await query(
    "INSERT INTO bonus_ledger (id, user_id, amount, reason, booking_id) VALUES ($1, $2, $3, $4, $5)",
    [randomUUID(), userId, amount, reason, bookingId ?? null]
  );
}

export interface LedgerEntry {
  amount: number;
  reason: string;
  created_at: string;
}
export async function getLedger(userId: string): Promise<LedgerEntry[]> {
  return query<LedgerEntry>(
    "SELECT amount, reason, created_at FROM bonus_ledger WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
    [userId]
  );
}

/**
 * Apply a referral for a just-registered user: link them to the referrer and
 * grant the welcome bonus. Ignores self-referral / unknown codes.
 */
export async function applyReferral(newUserId: string, refCode: string): Promise<void> {
  const code = refCode.trim().toUpperCase();
  if (!code) return;
  const referrer = await queryOne<{ id: string }>(
    "SELECT id FROM users WHERE ref_code = $1",
    [code]
  );
  if (!referrer || referrer.id === newUserId) return;

  await query("UPDATE users SET referred_by = $1 WHERE id = $2 AND referred_by IS NULL", [
    referrer.id,
    newUserId,
  ]);
  await creditBonus(newUserId, WELCOME_BONUS, "Приветственный бонус за регистрацию по ссылке");
}

/**
 * When a client's order is completed: if it's their first completed order and
 * they were referred, reward the referrer once.
 */
export async function handleOrderCompleted(bookingId: string): Promise<void> {
  const booking = await queryOne<{ user_id: string }>(
    "SELECT user_id FROM bookings WHERE id = $1",
    [bookingId]
  );
  if (!booking) return;

  const user = await queryOne<{ referred_by: string | null; referrer_credited: boolean }>(
    "SELECT referred_by, referrer_credited FROM users WHERE id = $1",
    [booking.user_id]
  );
  if (!user?.referred_by || user.referrer_credited) return;

  const done = await queryOne<{ n: number }>(
    "SELECT count(*)::int AS n FROM bookings WHERE user_id = $1 AND status = 'done'",
    [booking.user_id]
  );
  if ((done?.n ?? 0) < 1) return; // this completion should already be counted

  await query("UPDATE users SET referrer_credited = true WHERE id = $1", [booking.user_id]);
  await creditBonus(
    user.referred_by,
    REFERRER_BONUS,
    "Бонус за приглашённого друга",
    bookingId
  );
}
