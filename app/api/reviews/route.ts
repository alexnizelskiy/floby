import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getCurrentUser, newId } from "@/lib/auth";
import { getPublicReviews, getReviewStats } from "@/lib/reviews";

export async function GET() {
  try {
    const [reviews, stats] = await Promise.all([getPublicReviews(12), getReviewStats()]);
    return NextResponse.json({ ok: true, reviews, stats });
  } catch {
    return NextResponse.json({ ok: true, reviews: [], stats: { avg: 0, count: 0 } });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    bookingId?: string; rating?: number; text?: string;
  };
  const rating = Math.max(1, Math.min(5, Math.round(Number(body.rating ?? 0))));
  if (!body.bookingId || !rating) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });
  }

  const booking = await queryOne<{ id: string; status: string; assignee_id: string | null; data: unknown }>(
    "SELECT id, status, assignee_id, data FROM bookings WHERE id = $1 AND user_id = $2",
    [body.bookingId, user.id]
  );
  if (!booking) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  if (booking.status !== "done") {
    return NextResponse.json({ ok: false, error: "not_completed" }, { status: 409 });
  }

  const data = (typeof booking.data === "string" ? JSON.parse(booking.data) : booking.data) as {
    rooms?: number;
  };
  const service = `Уборка квартиры${data.rooms ? `, ${data.rooms} комн.` : ""}`;

  try {
    await query(
      "INSERT INTO reviews (id, booking_id, user_id, executor_id, rating, text, service) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [newId(), booking.id, user.id, booking.assignee_id, rating, (body.text ?? "").slice(0, 800).trim() || null, service]
    );
  } catch {
    return NextResponse.json({ ok: false, error: "already_reviewed" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
