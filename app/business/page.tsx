import type { Metadata } from "next";
import { Building2, FileText, CreditCard, CalendarClock, ShieldCheck, Users, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { LeadForm } from "@/components/forms/lead-form";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Уборка офисов и помещений для бизнеса в Ростове-на-Дону — floby",
  description:
    "Клининг для бизнеса в Ростове-на-Дону: офисы, коворкинги, магазины, кафе. Регулярный график, договор, безналичный расчёт и закрывающие документы. Оставьте заявку — рассчитаем стоимость.",
  keywords: ["уборка офисов Ростов", "клининг для бизнеса", "уборка помещений юрлицам", "клининг офиса Ростов-на-Дону"],
  path: "/business",
});

const benefits = [
  { icon: FileText, title: "Договор и документы", text: "Работаем по договору, предоставляем акты и закрывающие документы для бухгалтерии." },
  { icon: CreditCard, title: "Безналичный расчёт", text: "Оплата по счёту, работа с НДС и без — как удобно вашей компании." },
  { icon: CalendarClock, title: "Удобный график", text: "Уборка утром до открытия, вечером после закрытия или ночью — не мешая работе." },
  { icon: ShieldCheck, title: "Ответственность", text: "Материальная ответственность за имущество и стабильное качество по регламенту." },
  { icon: Users, title: "Обученный персонал", text: "Проверенные клинеры с инструктажем. При необходимости — закреплённая бригада." },
  { icon: Building2, title: "Любые помещения", text: "Офисы, коворкинги, магазины, шоурумы, кафе, салоны, бизнес-центры." },
];

const objects = ["Офисы и бизнес-центры", "Коворкинги", "Магазины и шоурумы", "Кафе и рестораны", "Салоны красоты", "Медицинские центры", "Фитнес-клубы", "Складские помещения"];

export default function BusinessPage() {
  return (
    <>
      <PageHeader
        eyebrow="Бизнесу"
        title="Клининг для бизнеса в Ростове-на-Дону"
        description="Регулярная и разовая уборка офисов и коммерческих помещений. Договор, безналичный расчёт, закрывающие документы и стабильное качество."
        crumbs={[{ label: "Бизнесу", href: "/business" }]}
      />

      <Section>
        <SectionHeading eyebrow="Почему floby" title="Что получает ваш бизнес" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid size-12 place-items-center rounded-xl bg-brand-100 text-brand-700">
                <b.icon className="size-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading eyebrow="Что убираем" title="Помещения, с которыми работаем" align="left" />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {objects.map((o) => (
                <li key={o} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-5 shrink-0 text-brand-600" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-muted-foreground">
              Стоимость для бизнеса рассчитывается индивидуально — зависит от площади, графика и состава работ.
              Оставьте заявку, и мы подготовим коммерческое предложение.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-xl font-bold">Заявка на расчёт</h2>
            <p className="mt-1 text-muted-foreground">Перезвоним, уточним детали и пришлём предложение.</p>
            <div className="mt-6">
              <LeadForm source="b2b-business" withService={false} />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
