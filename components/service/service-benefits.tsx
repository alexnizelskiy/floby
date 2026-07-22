import { Check } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import type { Service } from "@/types";

export function ServiceBenefits({ service }: { service: Service }) {
  return (
    <Section className="bg-surface">
      <SectionHeading
        eyebrow="Преимущества"
        title={`Почему заказывают ${service.shortTitle.toLowerCase()} у нас`}
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {service.benefits.map((b, i) => (
          <Reveal key={b.title} delayIndex={i}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-100 text-brand-700">
                <Check className="size-5" />
              </span>
              <h3 className="font-semibold">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
