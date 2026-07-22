import { Check, X } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import type { Service } from "@/types";

export function ServiceIncludes({ service }: { service: Service }) {
  return (
    <Section>
      <SectionHeading
        eyebrow="Состав услуги"
        title="Что входит и что не входит"
        description="Прозрачно показываем объём работ, чтобы не было сюрпризов."
      />
      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-3xl border border-brand-200 bg-brand-50/50 p-7 md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-brand-500 text-white">
                <Check className="size-5" />
              </span>
              <h3 className="text-xl font-bold">Входит в услугу</h3>
            </div>
            <ul className="flex flex-col gap-3">
              {service.included.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-5 shrink-0 text-brand-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delayIndex={1}>
          <div className="h-full rounded-3xl border border-border bg-card p-7 md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
                <X className="size-5" />
              </span>
              <h3 className="text-xl font-bold">Не входит</h3>
            </div>
            <ul className="flex flex-col gap-3">
              {service.excluded.map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted-foreground">
                  <X className="mt-0.5 size-5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-xl bg-surface p-4 text-sm text-muted-foreground">
              Нужна дополнительная услуга? Мы поможем — просто укажите это при заказе.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
