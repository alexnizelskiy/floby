import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Реквизиты — floby",
  description:
    "Реквизиты продавца услуг floby: самозанятый (плательщик НПД), ИНН, контакты и порядок оплаты.",
  path: "/requisites",
});

export default function RequisitesPage() {
  const { legal, contacts, geo } = siteConfig;

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Продавец", value: legal.sellerName },
    { label: "Статус", value: legal.taxRegime },
    { label: "ИНН", value: legal.inn },
    { label: "Бренд", value: `floby — ${siteConfig.tagline.toLowerCase()}` },
    {
      label: "Телефон",
      value: (
        <a href={contacts.phoneHref} className="text-primary hover:underline">
          {contacts.phone}
        </a>
      ),
    },
    {
      label: "E-mail",
      value: (
        <a href={contacts.emailHref} className="text-primary hover:underline">
          {contacts.email}
        </a>
      ),
    },
    { label: "Регион работы", value: `${geo.city}, ${geo.region}` },
    { label: "Режим работы", value: contacts.workingHours },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Информация о продавце"
        title="Реквизиты"
        description="Данные исполнителя услуг и порядок оплаты на сайте floby."
        crumbs={[{ label: "Реквизиты", href: "/requisites" }]}
      />

      <Section>
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <dl className="divide-y divide-border">
              {rows.map((r) => (
                <div key={r.label} className="grid grid-cols-1 gap-1 p-4 sm:grid-cols-[200px_1fr] sm:gap-4 sm:p-5">
                  <dt className="text-sm text-muted-foreground">{r.label}</dt>
                  <dd className="font-medium text-foreground">{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h2 className="text-base font-semibold text-foreground">Оплата</h2>
              <p className="mt-1.5">
                Оплата услуг производится онлайн банковской картой через платёжный сервис ЮKassa
                (АО «ЮMoney»). Данные карты вводятся на защищённой странице ЮKassa и не передаются
                и не хранятся на стороне floby. Стоимость услуг рассчитывается в калькуляторе на
                сайте и фиксируется при оформлении заказа.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Возврат</h2>
              <p className="mt-1.5">
                Если уборка не состоялась или выполнена ненадлежащим образом, средства возвращаются
                на карту, с которой производилась оплата. По вопросам возврата свяжитесь с нами по
                телефону или e-mail, указанным выше.
              </p>
            </div>
            <p>
              Обработка персональных данных — согласно{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Политике конфиденциальности
              </Link>
              . Условия оказания услуг — в разделе{" "}
              <Link href="/help" className="text-primary hover:underline">
                «Помощь»
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
