import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import type { Service } from "@/types";

export function ServiceSteps({ service }: { service: Service }) {
  return (
    <Section>
      <SectionHeading eyebrow="Этапы работы" title="Как проходит уборка" />
      <div className="mt-12 grid gap-4 md:grid-cols-5">
        {service.steps.map((step, i) => (
          <Reveal key={step.title} delayIndex={i}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-500 text-lg font-bold text-white">
                {i + 1}
              </span>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
