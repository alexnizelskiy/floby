import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { whyUs, stats } from "@/content/features";
import { getIcon } from "@/lib/icons";

export function WhyUs() {
  return (
    <Section className="bg-surface">
      <SectionHeading
        eyebrow="Почему выбирают floby"
        title="Надёжная уборка без сюрпризов"
        description="Мы отвечаем за результат репутацией и относимся к каждому дому как к своему."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {whyUs.map((f, i) => {
          const Icon = getIcon(f.icon);
          return (
            <Reveal key={f.title} delayIndex={i}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6">
                <div className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-10 grid gap-4 rounded-3xl border border-border bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center sm:text-left">
            <p className="text-4xl font-bold">{s.value}</p>
            <p className="mt-1 text-sm text-white/80">{s.label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
