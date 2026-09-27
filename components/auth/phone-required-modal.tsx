"use client";

import * as React from "react";
import { Loader2, ShieldCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";

const fieldCls =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

const ERROR_TEXT: Record<string, string> = {
  wrong_code: "Неверный код. Попробуйте ещё раз.",
  code_expired: "Код истёк. Запросите новый.",
  too_many_attempts: "Слишком много попыток. Запросите новый код.",
  no_code: "Сначала запросите код.",
  invalid_input: "Введите номер и 4 цифры кода.",
  invalid_phone: "Проверьте номер телефона.",
};

/**
 * Обязательный экран привязки телефона для аккаунтов без номера (вход через
 * VK/Яндекс). Телефон подтверждается кодом из SMS и становится единым ключом
 * аккаунта — чтобы заказы из бота (по номеру) и с сайта были в одном кабинете.
 * Закрыть нельзя; можно только подтвердить номер или выйти.
 */
export function PhoneRequiredModal() {
  const { user, loading, refresh, logout } = useAuth();
  const [step, setStep] = React.useState<"phone" | "code">("phone");
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [devCode, setDevCode] = React.useState<string | null>(null);
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  // Показываем только вошедшим без телефона.
  if (loading || !user || user.phone) return null;

  async function requestCode() {
    setError(null);
    setDevCode(null);
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Введите корректный номер");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        if (data.devCode) setDevCode(String(data.devCode));
        setStep("code");
        setSeconds(30);
      } else if (res.status === 429) {
        setStep("code");
        setSeconds(30);
      } else {
        setError(ERROR_TEXT[data.error] ?? "Не удалось отправить код. Попробуйте позже.");
      }
    } catch {
      setError("Нет связи с сервером.");
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (code.length < 4) {
      setError("Введите 4 цифры кода");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/link-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        await refresh(); // подтянет аккаунт с телефоном — экран исчезнет
      } else {
        setError(ERROR_TEXT[data.error] ?? "Не удалось подтвердить код.");
      }
    } catch {
      setError("Нет связи с сервером.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 md:p-8">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700">
          <Phone className="size-6" />
        </span>
        <h2 className="mt-4 text-2xl font-bold">Подтвердите номер телефона</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Это нужно, чтобы связать ваш аккаунт с заказами (в том числе из чат-бота) и чтобы клинер мог с вами
          связаться. Номер подтверждается кодом из SMS.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {step === "phone" && (
            <>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError(null);
                }}
                placeholder="+7 (___) ___-__-__"
                className={fieldCls}
                autoFocus
              />
              <Button size="lg" onClick={requestCode} disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                Получить код
              </Button>
            </>
          )}

          {step === "code" && (
            <>
              {devCode && (
                <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm text-brand-800">
                  <ShieldCheck className="size-4 shrink-0" />
                  Демо-режим (SMS не подключён): ваш код — <b>{devCode}</b>
                </div>
              )}
              <input
                inputMode="numeric"
                maxLength={4}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ""));
                  setError(null);
                }}
                placeholder="Код из SMS"
                className={cn(fieldCls, "text-center text-lg tracking-[0.4em]")}
                autoFocus
              />
              <Button size="lg" onClick={confirm} disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                Подтвердить
              </Button>
              <button
                type="button"
                disabled={seconds > 0}
                onClick={requestCode}
                className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {seconds > 0 ? `Отправить код повторно через ${seconds} c` : "Отправить код повторно"}
              </button>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
