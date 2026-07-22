"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { leadFormSchema, type LeadFormValues } from "@/features/lead-form/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { services } from "@/content/services";
import { cn } from "@/lib/utils";

interface LeadFormProps {
  source?: string;
  defaultService?: string;
  total?: number;
  withMessage?: boolean;
  withService?: boolean;
  className?: string;
  onSuccess?: () => void;
}

export function LeadForm({
  source = "site",
  defaultService,
  total,
  withMessage = true,
  withService = true,
  className,
  onSuccess,
}: LeadFormProps) {
  const [submitted, setSubmitted] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { service: defaultService, consent: true as unknown as true },
  });

  async function onSubmit(values: LeadFormValues) {
    setServerError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          service: values.service,
          message: values.message,
          source,
          total,
        }),
      });
      if (!res.ok) throw new Error("request_failed");
      setSubmitted(true);
      reset();
      onSuccess?.();
    } catch {
      setServerError("Не удалось отправить заявку. Позвоните нам или попробуйте позже.");
    }
  }

  if (submitted) {
    return (
      <div className={cn("flex flex-col items-center gap-4 py-8 text-center", className)}>
        <div className="grid size-14 place-items-center rounded-full bg-brand-100 text-brand-700">
          <Check className="size-7" />
        </div>
        <div>
          <p className="text-lg font-semibold">Заявка отправлена!</p>
          <p className="text-muted-foreground">
            Мы свяжемся с вами в ближайшее время, чтобы подтвердить детали.
          </p>
        </div>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Отправить ещё одну
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-4", className)} noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lf-name">Ваше имя</Label>
        <Input
          id="lf-name"
          placeholder="Как к вам обращаться"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lf-phone">Телефон</Label>
        <Input
          id="lf-phone"
          type="tel"
          inputMode="tel"
          placeholder="+7 (___) ___-__-__"
          aria-invalid={!!errors.phone}
          {...register("phone")}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>

      {withService && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lf-service">Услуга</Label>
          <select
            id="lf-service"
            className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground shadow-[var(--shadow-sm)] focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            {...register("service")}
          >
            <option value="">Выберите услугу</option>
            {services.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {withMessage && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lf-message">Комментарий</Label>
          <Textarea
            id="lf-message"
            placeholder="Площадь, пожелания, удобное время…"
            {...register("message")}
          />
        </div>
      )}

      {/* honeypot */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden
        {...register("company")}
      />

      <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
        <input
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 rounded border-input accent-[var(--primary)]"
          {...register("consent")}
        />
        <span>
          Согласен с обработкой персональных данных и{" "}
          <a href="/privacy" className="text-primary underline-offset-2 hover:underline">
            политикой конфиденциальности
          </a>
        </span>
      </label>
      {errors.consent && <p className="text-sm text-destructive">{errors.consent.message}</p>}

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" /> Отправляем…
          </>
        ) : (
          "Отправить заявку"
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Перезвоним в течение 15 минут в рабочее время
      </p>
    </form>
  );
}
