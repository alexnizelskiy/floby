"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * OAuth return page. Its main job is the Яндекс ID token flow: Yandex opens this
 * URL in a popup with the token in the hash, and we hand it back to the SDK via
 * YaSendSuggestToken so the YandexIdButton handler resolves. VK ID OneTap
 * resolves inside its own widget, so for anything else we just go to the cabinet.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isYandex =
      new URLSearchParams(window.location.search).get("provider") === "yandex";
    const hasToken = /(?:access_)?token=/.test(window.location.hash);

    if (isYandex && hasToken) {
      const s = document.createElement("script");
      s.src =
        "https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-token-with-polyfills-latest.js";
      s.onload = () => {
        try {
          (
            window as unknown as { YaSendSuggestToken?: (o: string, p?: object) => void }
          ).YaSendSuggestToken?.(window.location.origin, {});
        } catch {
          /* скрипт отправит токен сам */
        }
      };
      document.head.appendChild(s);
      return;
    }

    // Not a Yandex token popup — nothing to exchange here.
    router.replace("/profile");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 size-10 animate-spin text-brand-500" />
        <p className="text-muted-foreground">Выполняем вход…</p>
      </div>
    </div>
  );
}
