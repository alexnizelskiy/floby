"use client";

import * as React from "react";
import { VKIdButton } from "./vk-id-button";
import { YandexIdButton } from "./yandex-id-button";

/**
 * Social login block. Renders only the providers configured via
 * NEXT_PUBLIC_VK_CLIENT_ID / NEXT_PUBLIC_YANDEX_CLIENT_ID — nothing otherwise,
 * so the phone-OTP flow stays the only option until keys are set.
 */
export function OAuthButtons({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = React.useState<string | null>(null);
  const hasVk = !!process.env.NEXT_PUBLIC_VK_CLIENT_ID;
  const hasYandex = !!process.env.NEXT_PUBLIC_YANDEX_CLIENT_ID;
  if (!hasVk && !hasYandex) return null;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        или войдите через
        <span className="h-px flex-1 bg-border" />
      </div>
      {hasYandex && <YandexIdButton onSuccess={onSuccess} onError={setError} />}
      {hasVk && <VKIdButton onSuccess={onSuccess} onError={setError} />}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
