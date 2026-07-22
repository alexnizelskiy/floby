import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { processSteps } from "@/content/features";

export function HowItWorks() {
  return (
    <Section id="how" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Как проходит уборка"
        title="Пять простых шагов до чистоты"
        description="Прозрачный процесс без сложностей: от заявки до приёмки работы."
      />

      <div className="relative mt-14">
        <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {processSteps.map((step, i) => (
            <Reveal key={step.number} delayIndex={i} className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="relative z-10 grid size-16 place-items-center rounded-2xl border border-border bg-card text-2xl font-bold text-primary shadow-[var(--shadow-sm)]">
                {step.number}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
