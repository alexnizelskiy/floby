"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SmsAuthModal } from "@/features/booking/sms-auth-modal";

/** Login gate for the cabinet: phone → SMS code → session. */
export function ProfileLogin() {
  const router = useRouter();
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState(false);
  const [smsOpen, setSmsOpen] = React.useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      setError(true);
      return;
    }
    setSmsOpen(true);
  }

  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-3xl border border-border bg-card p-8 text-center md:p-10">
        <span className="grid size-16 place-items-center rounded-full bg-brand-100 text-brand-700">
          <User className="size-8" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Вход в личный кабинет</h1>
          <p className="mt-2 text-muted-foreground">
            Введите номер телефона — пришлём код для входа. Регистрация произойдёт
            автоматически.
          </p>
        </div>
        <form onSubmit={submit} className="flex w-full flex-col gap-3 text-left">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-phone">Телефон</Label>
            <Input
              id="login-phone"
              type="tel"
              inputMode="tel"
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError(false);
              }}
              aria-invalid={error}
            />
            {error && <p className="text-sm text-destructive">Введите корректный номер</p>}
          </div>
          <Button type="submit" size="lg" className="w-full">
            Получить код
          </Button>
        </form>
      </div>

      <SmsAuthModal
        open={smsOpen}
        phone={phone}
        onClose={() => setSmsOpen(false)}
        onVerified={() => {
          setSmsOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
