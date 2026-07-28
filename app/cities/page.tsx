import type { Metadata } from "next";
import { MapPin, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { CtaBand } from "@/components/sections/cta-band";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { activeCities, comingSoonCities } from "@/content/cities";

export const metadata: Metadata = buildMetadata({
  title: "Города присутствия floby — уборка на юге России",
  description:
    "floby работает в Ростове-на-Дону и готовится к запуску в других городах юга России. Смотрите, где уже доступна уборка и куда мы придём следующими.",
  keywords: ["клининг города", "уборка Ростов-на-Дону", "floby города присутствия"],
  path: "/cities",
});

export default function CitiesPage() {
  return (
    <>
      <PageHeader
        eyebrow="География"
        title="Где работает floby"
        description="Сейчас мы полностью сосредоточены на Ростове-на-Дону и качестве каждой уборки. Дальше — соседние города юга России."
        crumbs={[{ label: "Города", href: "/cities" }]}
      />

      <Section>
        <SectionHeading eyebrow="Уже работаем" title="Города, где доступна уборка" align="left" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeCities.map((c) => (
            <div key={c.slug} className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50/50 p-6">
              <span className="grid size-12 place-items-center rounded-xl bg-brand-100 text-brand-700">
                <MapPin className="size-6" />
              </span>
              <div>
                <p className="text-lg font-bold">{c.name}</p>
                <p className="text-sm text-brand-700">Принимаем заказы</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading eyebrow="Скоро" title="Куда мы придём следующими" align="left" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {comingSoonCities.map((c) => (
            <div
              key={c.slug}
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-border bg-card p-5 text-muted-foreground"
              )}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-strong">
                <Clock className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-foreground">{c.name}</p>
                <p className="text-xs">Скоро</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-muted-foreground">
          Хотите floby в своём городе? Напишите нам — учитываем спрос при планировании запуска.
        </p>
      </Section>

      <CtaBand source="cities-cta" />
    </>
  );
}
