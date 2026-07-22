import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Logo } from "@/components/brand/logo";
import { reasons } from "@/content/features";
import { getIcon } from "@/lib/icons";

export function Reasons() {
  return (
    <Section id="reasons">
      <h2 className="mx-auto max-w-3xl text-center text-3xl font-medium leading-tight md:text-[2.375rem]">
        6 веских причин заказать уборку у нас
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        {/* Brand card — spans both rows on desktop */}
        <div className="grid place-items-center rounded-3xl border border-border bg-card p-8 sm:col-span-2 lg:col-span-1 lg:row-span-2">
          <Logo className="text-[2.75rem] md:text-[3.25rem]" />
        </div>

        {reasons.map((r, i) => {
          const Icon = getIcon(r.icon);
          return (
            <Reveal key={r.title} delayIndex={i}>
              <div className="flex h-full flex-col gap-3 rounded-3xl border border-border bg-card p-8">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon className="size-6" />
                </span>
                <h3 className="text-base font-semibold text-foreground">{r.title}</h3>
                <p className="text-base leading-6 text-muted-foreground">{r.description}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
