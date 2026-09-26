import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, Send, Clock, MapPin, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { LeadForm } from "@/components/forms/lead-form";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Контакты floby — уборка в Ростове-на-Дону",
  description:
    "Свяжитесь с floby: телефон, почта, мессенджеры. Уборка квартир, домов и офисов в Ростове-на-Дону. Работаем ежедневно.",
  keywords: ["контакты клининг Ростов", "заказать уборку телефон", "floby контакты"],
  path: "/contacts",
});

export default function ContactsPage() {
  const c = siteConfig.contacts;
  const items = [
    { icon: Phone, label: "Телефон", value: c.phone, href: c.phoneHref },
    { icon: Mail, label: "Почта", value: c.email, href: c.emailHref },
    { icon: Send, label: "Telegram", value: c.telegramLabel, href: c.telegram },
    { icon: MessageCircle, label: "WhatsApp", value: c.whatsappLabel, href: c.whatsapp },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Контакты"
        title="Свяжитесь с нами"
        description="Позвоните, напишите в мессенджер или оставьте заявку — ответим и подберём удобное время."
        crumbs={[{ label: "Контакты", href: "/contacts" }]}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((it) => (
                <a
                  key={it.label}
                  href={it.href}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand-300"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700">
                    <it.icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground">{it.label}</span>
                    <span className="block truncate font-semibold">{it.value}</span>
                  </span>
                </a>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="flex items-center gap-2 font-semibold">
                <Clock className="size-5 text-brand-600" /> Режим работы
              </p>
              <p className="mt-1 text-muted-foreground">{c.workingHours}</p>
              <p className="mt-4 flex items-center gap-2 font-semibold">
                <MapPin className="size-5 text-brand-600" /> География
              </p>
              <p className="mt-1 text-muted-foreground">
                {siteConfig.geo.city} и ближайшие пригороды. {siteConfig.geo.region}.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Реквизиты</p>
              <p className="mt-2">
                {siteConfig.legal.sellerName}
                {siteConfig.legal.selfEmployed && " · Плательщик НПД (самозанятый)"}
              </p>
              <p>ИНН {siteConfig.legal.inn}</p>
              <Link href="/requisites" className="mt-2 inline-block text-primary hover:underline">
                Все реквизиты →
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-xl font-bold">Оставьте заявку</h2>
            <p className="mt-1 text-muted-foreground">Перезвоним, ответим на вопросы и назовём стоимость.</p>
            <div className="mt-6">
              <LeadForm source="contacts-page" />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
