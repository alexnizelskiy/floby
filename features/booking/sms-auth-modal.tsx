"use client";

import * as React from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SmsAuthModalProps {
  open: boolean;
  phone: string;
  onClose: () => void;
  onVerified: () => void;
}

const ERROR_TEXT: Record<string, string> = {
  wrong_code: "Неверный код. Попробуйте ещё раз.",
  code_expired: "Код истёк. Запросите новый.",
  too_many_attempts: "Слишком много попыток. Запросите новый код.",
  no_code: "Сначала запросите код.",
  invalid_input: "Введите 4 цифры кода.",
};

/** Real SMS auth: requests a code (SMSC.ru in prod / dev-code otherwise), verifies via API. */
export function SmsAuthModal({ open, phone, onClose, onVerified }: SmsAuthModalProps) {
  const [code, setCode] = React.useState("");
  const [checking, setChecking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [devCode, setDevCode] = React.useState<string | null>(null);
  const [seconds, setSeconds] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const requestCode = React.useCallback(async () => {
    setError(null);
    setDevCode(null);
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        if (data.devCode) setDevCode(String(data.devCode));
        setSeconds(30);
      } else if (res.status === 429) {
        setSeconds(30); // code already sent recently — still valid
      } else {
        setError("Не удалось отправить код. Попробуйте позже.");
      }
    } catch {
      setError("Нет связи с сервером. Попробуйте позже.");
    }
  }, [phone]);

  React.useEffect(() => {
    if (!open) return;
    setCode("");
    setError(null);
    requestCode();
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, [open, requestCode]);

  React.useEffect(() => {
    if (!open || seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [open, seconds]);

  async function verify() {
    if (code.length < 4) {
      setError("Введите 4 цифры кода");
      return;
    }
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        onVerified();
      } else {
        setError(ERROR_TEXT[data.error] ?? "Не удалось подтвердить код.");
      }
    } catch {
      setError("Нет связи с сервером.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Подтвердите номер"
      description={
        <>
          Мы отправили код в СМС на номер{" "}
          <span className="font-semibold text-foreground">{phone}</span>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {devCode && (
          <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm text-brand-800">
            <ShieldCheck className="size-4 shrink-0" />
            Демо-режим (SMS не подключён): ваш код — <b>{devCode}</b>
          </div>
        )}

        <input
          ref={inputRef}
          inputMode="numeric"
          maxLength={4}
          placeholder="• • • •"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, "").slice(0, 4));
            setError(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && verify()}
          aria-invalid={!!error}
          className={cn(
            "h-14 w-full rounded-xl border bg-background text-center text-2xl font-semibold tracking-[0.5em] text-foreground focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
            error ? "border-destructive" : "border-input"
          )}
        />
        {error && <p className="-mt-2 text-sm text-destructive">{error}</p>}

        <Button size="lg" onClick={verify} disabled={checking} className="w-full">
          {checking ? (
            <>
              <Loader2 className="animate-spin" /> Проверяем…
            </>
          ) : (
            "Подтвердить"
          )}
        </Button>

        <button
          type="button"
          disabled={seconds > 0}
          onClick={requestCode}
          className="text-center text-sm text-muted-foreground transition-colors enabled:hover:text-primary disabled:opacity-70"
        >
          {seconds > 0 ? `Отправить код повторно через ${seconds} сек` : "Отправить код повторно"}
        </button>
      </div>
    </Modal>
  );
}
