import { query, queryOne } from "@/lib/db";
import { newId } from "@/lib/auth";

const INTERVAL_DAYS: Record<string, number> = { weekly: 7, biweekly: 14 };

/** After an order with a recurring plan is completed, schedule the next one. */
export async function createNextIfRecurring(bookingId: string): Promise<void> {
  const b = await queryOne<{
    user_id: string;
    data: unknown;
    total: number;
    assignee_id: string | null;
    recurring_spawned: boolean;
  }>(
    "SELECT user_id, data, total, assignee_id, recurring_spawned FROM bookings WHERE id = $1",
    [bookingId]
  );
  if (!b || b.recurring_spawned) return;

  const data = (typeof b.data === "string" ? JSON.parse(b.data) : b.data) as Record<string, unknown>;
  const plan = String(data.subscription ?? "none");
  if (plan === "none" || (!(plan in INTERVAL_DAYS) && plan !== "monthly")) return;

  const baseDate = new Date(`${data.date}T00:00:00`);
  if (Number.isNaN(baseDate.getTime())) return;
  if (plan === "monthly") baseDate.setMonth(baseDate.getMonth() + 1);
  else baseDate.setDate(baseDate.getDate() + INTERVAL_DAYS[plan]);
  // format from local components (avoid UTC shift from toISOString)
  const nextDate = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, "0")}-${String(baseDate.getDate()).padStart(2, "0")}`;

  const price = (data.price as { total?: number } | undefined) ?? {};
  const gross = Number(price.total ?? b.total ?? 0);
  const nextData = { ...data, date: nextDate, bonusUsed: 0 };

  const id = newId();
  const status = b.assignee_id ? "assigned" : "searching";
  await query(
    "INSERT INTO bookings (id, user_id, data, status, total, assignee_id) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, b.user_id, JSON.stringify(nextData), status, gross, b.assignee_id]
  );
  await query("UPDATE bookings SET recurring_spawned = true WHERE id = $1", [bookingId]);
}
