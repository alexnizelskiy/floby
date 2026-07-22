"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { plural, cn } from "@/lib/utils";
import { SmsAuthModal } from "@/features/booking/sms-auth-modal";
import { saveDraft, setAuthPhone } from "@/lib/booking";

/** Rounded stepper pill: − [label] + */
function Stepper({
  label,
  value,
  onChange,
  min = 1,
  max = 6,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex h-[52px] items-center justify-between rounded-full border border-border bg-white">
      <button
        type="button"
        aria-label="Уменьшить"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="grid h-full w-[52px] place-items-center rounded-full text-foreground transition-colors hover:bg-surface disabled:opacity-30"
      >
        <Minus className="size-4" />
      </button>
      <span className="whitespace-nowrap text-base font-medium text-foreground">{label}</span>
      <button
        type="button"
        aria-label="Увеличить"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="grid h-full w-[52px] place-items-center rounded-full text-foreground transition-colors hover:bg-surface disabled:opacity-30"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function HeroForm() {
  const router = useRouter();
  const [rooms, setRooms] = React.useState(1);
  const [baths, setBaths] = React.useState(1);
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState(false);
  const [smsOpen, setSmsOpen] = React.useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      setError(true);
      return;
    }
    setSmsOpen(true);
  }

  function onVerified() {
    saveDraft({ rooms, baths, phone });
    setAuthPhone(phone);
    setSmsOpen(false);
    router.push("/booking");
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[1120px]">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <Stepper label={`${rooms}-комнатная`} value={rooms} onChange={setRooms} max={6} />
        <Stepper
          label={`${baths} ${plural(baths, ["санузел", "санузла", "санузлов"])}`}
          value={baths}
          onChange={setBaths}
          max={4}
        />
        <input
          type="tel"
          inputMode="tel"
          placeholder="+7 (___) ___-__-__"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (error) setError(false);
          }}
          aria-invalid={error}
          className={cn(
            "h-[52px] rounded-full border bg-white px-5 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
            error ? "border-destructive" : "border-border"
          )}
        />
        <button
          type="submit"
          className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-brand-500 px-6 text-base font-medium text-white transition-colors hover:bg-brand-600"
        >
          Рассчитать стоимость
        </button>
      </div>

      <SmsAuthModal
        open={smsOpen}
        phone={phone}
        onClose={() => setSmsOpen(false)}
        onVerified={onVerified}
      />

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Нажимая «Рассчитать стоимость», я даю согласие на{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          обработку персональных данных
        </Link>{" "}
        и соглашаюсь с{" "}
        <Link href="/help" className="underline underline-offset-2 hover:text-foreground">
          условиями Сервиса
        </Link>
        .
      </p>
    </form>
  );
}

export function Hero() {
  return (
    <section className="pt-8 md:pt-16">
      <div className="container-page">
        <div className="relative flex min-h-[560px] items-end justify-center overflow-hidden rounded-[2.25rem] md:h-[641px] md:rounded-[3.75rem]">
          {/* Background photo */}
          <Image
            src="/images/hero-team.png"
            alt="Команда клинеров floby в Ростове-на-Дону"
            fill
            priority
            sizes="(max-width: 1440px) 100vw, 1390px"
            className="object-cover"
            style={{
              objectPosition: "58% 60%",
              transform: "scale(1.5)",
              transformOrigin: "58% 46%",
            }}
          />
          {/* White fade to the bottom (form area) */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_50%,rgba(255,255,255,0.8)_78%,#ffffff_93%)]" />

          {/* Content */}
          <div className="relative flex w-full flex-col items-center gap-4 px-4 pb-8 pt-10 md:px-10 md:pb-12">
            <h1 className="text-center text-3xl font-bold leading-tight text-foreground md:text-5xl">
              Поддерживающая уборка
            </h1>
            <p className="mb-2 text-center text-lg font-medium text-foreground/80 md:text-xl">
              Закажите уборку квартиры от 2050&nbsp;₽
            </p>
            <HeroForm />
          </div>
        </div>
      </div>
    </section>
  );
}
