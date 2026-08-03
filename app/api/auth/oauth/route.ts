import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSession, upsertUserByOAuth, type OAuthProvider } from "@/lib/auth";
import { ensureRefCode, applyReferral } from "@/lib/bonus";

const PROVIDERS = new Set<OAuthProvider>(["vk", "yandex"]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    provider?: string;
    providerId?: string | number;
    email?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
  };

  const provider = body.provider as OAuthProvider;
  const providerId = String(body.providerId ?? "").trim();
  if (!provider || !PROVIDERS.has(provider) || !providerId) {
    return NextResponse.json({ ok: false, error: "invalid_provider" }, { status: 422 });
  }

  try {
    const { user, isNew } = await upsertUserByOAuth({
      provider,
      providerId,
      email: body.email ?? null,
      name: body.name ?? null,
      avatarUrl: body.avatarUrl ?? null,
    });

    await ensureRefCode(user.id);

    if (isNew) {
      // brand-new account — apply referral captured on landing (?ref=CODE)
      const store = await cookies();
      const ref = store.get("floby_ref")?.value;
      if (ref) {
        await applyReferral(user.id, ref);
        store.delete("floby_ref");
      }
    }

    await createSession(user.id);
    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, phone: user.phone },
    });
  } catch (e) {
    console.error("OAuth login error:", e);
    return NextResponse.json(
      { ok: false, error: "server_error", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
