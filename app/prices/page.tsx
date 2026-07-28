import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { CalculatorSection } from "@/components/sections/calculator-section";
import { CtaBand } from "@/components/sections/cta-band";
import { OrderCta } from "@/components/forms/order-cta";
import { buildMetadata } from "@/lib/seo";
import { formatPrice, cn } from "@/lib/utils";
import { priceTiers, addons } from "@/content/prices";

export const metadata: Metadata = buildMetadata({
  title: "Цены на уборку в Ростове-на-Дону — floby",
  description:
    "Прозрачные цены на уборку квартир в Ростове-на-Дону: поддерживающая и генеральная уборка по площади, стоимость дополнительных услуг. Фиксированная цена без доплат.",
  keywords: ["цены на уборку Ростов", "стоимость уборки квартиры", "клининг цены Ростов-на-Дону"],
  path: "/prices",
});

export default function PricesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Цены"
        title="Прозрачные цены на уборку"
        description="Стоимость зависит от площади и типа уборки. Мы называем фиксированную цену заранее — без доплат по факту."
        crumbs={[{ label: "Цены", href: "/prices" }]}
      />

      <Section>
        <SectionHeading
          eyebrow="Прайс-лист"
          title="Стоимость по площади квартиры"
          description="Указаны базовые цены. Точную стоимость с учётом ваших пожеланий рассчитает калькулятор ниже."
        />

        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-0 overflow-hidden rounded-2xl border border-border">
            <thead>
              <tr className="bg-surface-strong text-left text-sm">
                <th className="px-5 py-4 font-semibold">Квартира</th>
                <th className="px-5 py-4 font-semibold">Площадь</th>
                <th className="px-5 py-4 font-semibold">Поддерживающая</th>
                <th className="px-5 py-4 font-semibold">Генеральная</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {priceTiers.map((t) => (
                <tr key={t.id} className={cn("border-t border-border text-sm", t.popular && "bg-brand-50/50")}>
                  <td className="px-5 py-4 font-semibold">
                    {t.title}
                    {t.popular && (
                      <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                        Популярно
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{t.area}</td>
                  <td className="px-5 py-4 font-semibold">{formatPrice(t.regular)}</td>
                  <td className="px-5 py-4 font-semibold">{formatPrice(t.deep)}</td>
                  <td className="px-5 py-4 text-right">
                    <OrderCta size="sm" label="Заказать" source="prices-table" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Минимальный заказ — {formatPrice(1500)}. Цена может корректироваться для сильно загрязнённых помещений
          и уборки после ремонта — мы всегда согласовываем её заранее.
        </p>
      </Section>

      <Section className="pt-0">
        <SectionHeading
          eyebrow="Дополнительные услуги"
          title="Что можно добавить"
          description="Любую из услуг можно добавить к уборке — стоимость фиксированная."
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {addons.map((a) => (
            <div key={a.title} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
              <span className="flex items-center gap-2.5 text-sm font-medium">
                <Check className="size-4 shrink-0 text-brand-600" /> {a.title}
              </span>
              <span className="whitespace-nowrap text-sm font-bold">
                {formatPrice(a.price)}<span className="font-normal text-muted-foreground">/{a.unit}</span>
              </span>
            </div>
          ))}
        </div>
      </Section>

      <CalculatorSection />
      <CtaBand source="prices-cta" />
    </>
  );
}
