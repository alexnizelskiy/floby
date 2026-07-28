import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createPayment } from "@/lib/yookassa";
import { createCertificate, activateCertificate, setCertificatePayment, GIFT_MIN, GIFT_MAX } from "@/lib/gift";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { amount?: number; message?: string };
  const amount = Math.round(Number(body.amount ?? 0));
  if (!amount || amount < GIFT_MIN || amount > GIFT_MAX) {
    return NextResponse.json({ ok: false, error: "bad_amount" }, { status: 422 });
  }

  const cert = await createCertificate({
    buyerId: user.id,
    buyerName: user.name ?? undefined,
    amount,
    message: body.message?.slice(0, 300),
  });

  const origin = new URL(request.url).origin;
  const returnUrl = `${origin}/gift?bought=${cert.id}`;

  try {
    const payment = await createPayment({
      amount,
      description: `Подарочный сертификат floby на ${amount} ₽`,
      metadata: { gift_id: cert.id },
      returnUrl,
    });

    if (payment) {
      await setCertificatePayment(cert.id, payment.id);
      return NextResponse.json({ ok: true, url: payment.confirmationUrl, pending: true });
    }

    // Test mode (no ЮKassa creds): activate immediately and reveal the code
    await activateCertificate(cert.id);
    return NextResponse.json({ ok: true, code: cert.code, amount: cert.amount, test: true });
  } catch {
    return NextResponse.json({ ok: false, error: "payment_failed" }, { status: 502 });
  }
}
