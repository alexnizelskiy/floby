"use client";

import { useEffect, useRef } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    VKIDSDK?: any;
  }
}

interface Props {
  onSuccess: () => void;
  onError?: (msg: string) => void;
}

/**
 * VK ID OneTap button. Exchanges the code client-side (no server secret needed)
 * and posts the profile to /api/auth/oauth to open a floby session.
 * Requires NEXT_PUBLIC_VK_CLIENT_ID (numeric VK app id).
 */
export function VKIdButton({ onSuccess, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    const appId = Number(process.env.NEXT_PUBLIC_VK_CLIENT_ID);
    if (!appId) {
      onError?.("NEXT_PUBLIC_VK_CLIENT_ID не настроен");
      return;
    }

    const initSDK = () => {
      const VKID = window.VKIDSDK;
      if (!VKID || !containerRef.current) return;
      initialized.current = true;

      VKID.Config.init({
        app: appId,
        redirectUrl: `${window.location.origin}/auth/callback`,
        responseMode: VKID.ConfigResponseMode.Callback,
        source: VKID.ConfigSource.LOWCODE,
        scope: "",
      });

      const oneTap = new VKID.OneTap();
      oneTap
        .render({ container: containerRef.current, showAlternativeLogin: true })
        .on(VKID.WidgetEvents.ERROR, (error: any) => {
          onError?.(error?.message || `Ошибка VK ID (код ${error?.code ?? "?"})`);
        })
        .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, async (payload: any) => {
          try {
            const data: any = await VKID.Auth.exchangeCode(payload.code, payload.device_id);
            let user: any = data?.user || null;
            const accessToken = data?.access_token;
            if (!user && accessToken && typeof VKID.Auth.userInfo === "function") {
              try {
                const info = await VKID.Auth.userInfo(accessToken);
                user = info?.user || info || null;
              } catch {
                /* профиль опционален */
              }
            }
            const providerId = String(user?.id || data?.user_id || "");
            if (!providerId) throw new Error("ВК не вернул идентификатор пользователя");

            const res = await fetch("/api/auth/oauth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                provider: "vk",
                providerId,
                email: user?.email || null,
                name: [user?.first_name, user?.last_name].filter(Boolean).join(" ") || null,
                avatarUrl: user?.avatar || null,
              }),
            });
            if (!res.ok) {
              onError?.("Не удалось войти через ВКонтакте");
              return;
            }
            onSuccess();
          } catch (e: any) {
            onError?.(e?.message || "Ошибка входа через ВКонтакте");
          }
        });
    };

    if (window.VKIDSDK) {
      initSDK();
    } else {
      const s = document.createElement("script");
      s.src = "https://unpkg.com/@vkid/sdk@2.6.5/dist-sdk/umd/index.js";
      s.onload = initSDK;
      document.head.appendChild(s);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="w-full" />;
}
