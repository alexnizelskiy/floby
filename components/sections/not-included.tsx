import { X } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { OrderButton } from "@/components/forms/order-button";

const items = [
  "Выведение глубоких и застарелых пятен",
  "Обеспыливание стен и потолков",
  "Уборка в труднодоступных местах",
  "Мытьё под тяжёлой мебелью и техникой",
  "Уборка в кладовках и на антресолях",
  "Отмывание сильных загрязнений после ремонта",
];

export function NotIncluded() {
  return (
    <Section className="bg-surface">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <SectionHeading
          eyebrow="Что не входит"
          title="Нужно больше, чем поддерживающая уборка?"
          description="Эти работы требуют времени и сил — они входят в генеральную уборку. Если нужен один из пунктов ниже, выбирайте её."
          align="left"
        />

        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((it) => (
              <div key={it} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-surface-strong text-muted-foreground">
                  <X className="size-3.5" />
                </span>
                <span className="text-sm">{it}</span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <OrderButton size="lg" defaultService="deep-cleaning" label="Заказать генеральную уборку" />
          </div>
        </div>
      </div>
    </Section>
  );
}
