"use client";

import { useEffect, useRef } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YaAuthSuggest?: {
      init: (
        params: object,
        origin: string,
        options: object
      ) => Promise<{ handler: () => Promise<unknown> }>;
    };
  }
}

interface Props {
  onSuccess: () => void;
  onError?: (msg: string) => void;
}

/**
 * Яндекс ID button (implicit token flow). Fetches the profile from the Yandex
 * API client-side, then posts it to /api/auth/oauth to open a floby session.
 * Requires NEXT_PUBLIC_YANDEX_CLIENT_ID and the /auth/callback token responder.
 */
export function YandexIdButton({ onSuccess, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    const clientId = process.env.NEXT_PUBLIC_YANDEX_CLIENT_ID;
    if (!clientId) {
      onError?.("NEXT_PUBLIC_YANDEX_CLIENT_ID не настроен");
      return;
    }

    const containerId = "ya-auth-suggest-container";
    if (containerRef.current) containerRef.current.id = containerId;

    const initSDK = () => {
      if (!window.YaAuthSuggest || !containerRef.current) return;
      initialized.current = true;

      window.YaAuthSuggest
        .init(
          {
            client_id: clientId,
            response_type: "token",
            redirect_uri: `${window.location.origin}/auth/callback?provider=yandex`,
          },
          window.location.origin,
          {
            view: "button",
            parentId: containerId,
            buttonView: "main",
            buttonTheme: "light",
            buttonSize: "m",
            buttonBorderRadius: 12,
          }
        )
        .then(({ handler }) => handler())
        .then(async (data: any) => {
          try {
            const accessToken = data?.access_token || data?.token;
            if (!accessToken) throw new Error("Не удалось получить токен Яндекс");

            const infoRes = await fetch("https://login.yandex.ru/info?format=json", {
              headers: { Authorization: `OAuth ${accessToken}` },
            });
            if (!infoRes.ok) throw new Error("Ошибка получения профиля Яндекс");
            const info = await infoRes.json();

            const authRes = await fetch("/api/auth/oauth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                provider: "yandex",
                providerId: String(info.id || ""),
                email: info.default_email || info.emails?.[0] || null,
                name:
                  `${info.first_name || ""} ${info.last_name || ""}`.trim() ||
                  info.display_name ||
                  null,
                avatarUrl: info.default_avatar_id
                  ? `https://avatars.yandex.net/get-yapic/${info.default_avatar_id}/islands-200`
                  : null,
              }),
            });
            if (!authRes.ok) throw new Error("Не удалось войти через Яндекс");
            onSuccess();
          } catch (e: any) {
            onError?.(e?.message || "Ошибка входа через Яндекс");
          }
        })
        .catch((err: Error) => onError?.(err?.message || "Ошибка Яндекс ID"));
    };

    if (window.YaAuthSuggest) {
      initSDK();
    } else {
      const s = document.createElement("script");
      s.src =
        "https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-polyfills-latest.js";
      s.onload = initSDK;
      document.head.appendChild(s);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="w-full" />;
}
