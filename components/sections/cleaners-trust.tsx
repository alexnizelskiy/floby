"use client";

import * as React from "react";
import { Star, GraduationCap, ClipboardCheck, ShieldCheck } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";

const steps = [
  { icon: GraduationCap, title: "Обучение по регламенту", text: "Каждый клинер проходит инструктаж и работает по чёткому чек-листу уборки." },
  { icon: ClipboardCheck, title: "Тестовая уборка", text: "Перед допуском к заказам клинер проходит тестовую уборку с проверкой качества." },
  { icon: ShieldCheck, title: "Контроль и гарантия", text: "Мы контролируем результат и переделаем бесплатно, если что-то не так." },
  { icon: Star, title: "Рейтинг от клиентов", text: "После каждой уборки клиент ставит оценку — так лучшие клинеры получают больше заказов." },
];

interface Cleaner {
  id: string;
  name: string;
  initials: string;
  rating: number;
  done: number;
}

export function CleanersTrust() {
  const [cleaners, setCleaners] = React.useState<Cleaner[]>([]);

  React.useEffect(() => {
    fetch("/api/cleaners/top")
      .then((r) => r.json())
      .then((d) => d.ok && setCleaners(d.cleaners))
      .catch(() => {});
  }, []);

  return (
    <Section>
      <SectionHeading
        eyebrow="Наши клинеры"
        title="Мы тщательно отбираем каждого клинера"
        description="К вам приедет проверенный специалист, а не случайный человек с улицы."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
            <span className="grid size-12 place-items-center rounded-xl bg-brand-100 text-brand-700">
              <s.icon className="size-6" />
            </span>
            <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>

      {cleaners.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cleaners.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
                {c.initials}
              </span>
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  {c.rating > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-4 fill-warning text-warning" /> {c.rating.toFixed(1)}
                    </span>
                  )}
                  <span>{c.done} уборок</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
