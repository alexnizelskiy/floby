import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createPayment } from "@/lib/yookassa";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { bookingId?: string };
  if (!body.bookingId) {
    return NextResponse.json({ ok: false, error: "no_booking" }, { status: 422 });
  }

  const booking = await queryOne<{ id: string; total: number }>(
    "SELECT id, total FROM bookings WHERE id = $1 AND user_id = $2",
    [body.bookingId, user.id]
  );
  if (!booking) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const origin = new URL(request.url).origin;
  const returnUrl = `${origin}/profile?paid=${booking.id}`;

  try {
    const payment = await createPayment({
      amount: booking.total,
      description: `Уборка floby, заказ ${booking.id.slice(0, 8)}`,
      bookingId: booking.id,
      returnUrl,
    });

    if (payment) {
      // Real ЮKassa: store payment id, redirect user to hosted page
      await query("UPDATE bookings SET payment_id = $1 WHERE id = $2", [payment.id, booking.id]);
      return NextResponse.json({ ok: true, url: payment.confirmationUrl });
    }

    // Test mode (no ЮKassa creds): simulate a successful payment
    await query("UPDATE bookings SET paid = true WHERE id = $1", [booking.id]);
    return NextResponse.json({ ok: true, url: returnUrl, test: true });
  } catch {
    return NextResponse.json({ ok: false, error: "payment_failed" }, { status: 502 });
  }
}
