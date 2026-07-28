import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { Accordion } from "@/components/ui/accordion";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { faq, faqCategories } from "@/content/faq";

export const metadata: Metadata = buildMetadata({
  title: "Помощь и частые вопросы — floby",
  description:
    "Ответы на частые вопросы об уборке floby в Ростове-на-Дону: как заказать, оплата, гарантии, сотрудники и сам процесс уборки.",
  keywords: ["помощь клининг", "частые вопросы уборка", "floby faq"],
  path: "/help",
});

export default function HelpPage() {
  return (
    <>
      <PageHeader
        eyebrow="Помощь"
        title="Частые вопросы"
        description="Собрали всё, что чаще всего спрашивают клиенты. Не нашли ответ — напишите нам, поможем."
        crumbs={[{ label: "Помощь", href: "/help" }]}
      />

      <Section>
        <div className="flex flex-col gap-12">
          {faqCategories.map((cat) => {
            const items = faq.filter((f) => f.category === cat.id);
            if (items.length === 0) return null;
            return (
              <div key={cat.id} className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
                <h2 className="text-2xl font-bold lg:sticky lg:top-24">{cat.label}</h2>
                <Accordion items={items} />
              </div>
            );
          })}
        </div>
      </Section>

      <CtaBand
        source="help-cta"
        title="Не нашли ответ?"
        description="Напишите или позвоните нам — подскажем и подберём удобное время для уборки."
      />

      <JsonLd data={faqJsonLd(faq)} />
    </>
  );
}
