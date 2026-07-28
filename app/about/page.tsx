import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { CtaBand } from "@/components/sections/cta-band";
import { getIcon } from "@/lib/icons";
import { buildMetadata } from "@/lib/seo";
import { companyStory, companyValues, companyPlans, team } from "@/content/company";

export const metadata: Metadata = buildMetadata({
  title: "О компании floby — клининг в Ростове-на-Дону",
  description:
    "floby — локальная клининговая компания из Ростова-на-Дону. Наша история, ценности и подход к уборке: качество, честность и внимание к деталям.",
  keywords: ["о компании floby", "клининговая компания Ростов", "уборка квартир команда"],
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="О компании"
        title="Локальная команда, которой не всё равно"
        description={companyStory.intro}
        crumbs={[{ label: "О компании", href: "/about" }]}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Как мы начинались</h2>
            <p className="mt-4 text-lg text-muted-foreground">{companyStory.history}</p>
          </div>
          <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-6 md:p-8">
            <h2 className="text-xl font-bold text-brand-800">Наша миссия</h2>
            <p className="mt-3 text-lg text-brand-900/80">{companyStory.mission}</p>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading eyebrow="Ценности" title="Во что мы верим" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {companyValues.map((v) => {
            const Icon = getIcon(v.icon);
            return (
              <div key={v.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="grid size-12 place-items-center rounded-xl bg-brand-100 text-brand-700">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading eyebrow="Команда" title="Кто делает floby" align="left" />
            <div className="mt-8 flex flex-col gap-4">
              {team.map((m) => (
                <div key={m.name} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
                    {m.initials}
                  </span>
                  <div>
                    <p className="font-bold">{m.name}</p>
                    <p className="text-sm text-primary">{m.role}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{m.about}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 lg:mt-16">
            <h2 className="text-xl font-bold">Что дальше</h2>
            <p className="mt-2 text-muted-foreground">Мы аккуратно растём. Вот наши ближайшие планы:</p>
            <ul className="mt-5 flex flex-col gap-3">
              {companyPlans.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-5 shrink-0 text-brand-600" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <CtaBand source="about-cta" />
    </>
  );
}
