import type { Metadata } from "next";
import { Wallet, CalendarClock, Star, GraduationCap, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { LeadForm } from "@/components/forms/lead-form";
import { buildMetadata } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Вакансии клинера в Ростове-на-Дону — работа в floby",
  description:
    "floby ищет ответственных клинеров в Ростове-на-Дону. Гибкий график, стабильный доход, заказы рядом с домом и удобное приложение. Оставьте заявку.",
  keywords: ["работа клинером Ростов", "вакансия уборщица", "работа уборка Ростов-на-Дону"],
  path: "/vacancies",
});

const perks = [
  { icon: Wallet, title: "Стабильный доход", text: `Вы получаете большую часть чека — до 70%. Средний заказ — ${formatPrice(3000)}–${formatPrice(6000)}.` },
  { icon: CalendarClock, title: "Гибкий график", text: "Сами выбираете, когда и сколько работать. Заказы подбираем рядом с вами." },
  { icon: Star, title: "Прозрачный рейтинг", text: "Хорошие отзывы поднимают ваш рейтинг — и дают больше заказов." },
  { icon: GraduationCap, title: "Поддержка и обучение", text: "Подскажем стандарты уборки и поможем на старте. Вы не остаётесь одни." },
];

const requirements = [
  "Ответственность и аккуратность",
  "Опыт уборки приветствуется (но не обязателен — обучим)",
  "Российский паспорт и возможность подтвердить самозанятость",
  "Смартфон для работы в приложении floby",
];

export default function VacanciesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Вакансии"
        title="Станьте клинером floby"
        description="Мы растём и ищем ответственных людей, которым важно качество. Работайте на себя с потоком заказов от floby."
        crumbs={[{ label: "Вакансии", href: "/vacancies" }]}
      />

      <Section>
        <SectionHeading eyebrow="Почему floby" title="Что вы получаете" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid size-12 place-items-center rounded-xl bg-brand-100 text-brand-700">
                <p.icon className="size-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading eyebrow="Требования" title="Кого мы ищем" align="left" />
            <ul className="mt-8 flex flex-col gap-3">
              {requirements.map((r) => (
                <li key={r} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-5 shrink-0 text-brand-600" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-xl font-bold">Оставьте заявку</h2>
            <p className="mt-1 text-muted-foreground">
              Оставьте имя и телефон — расскажем об условиях и ближайших заказах.
            </p>
            <div className="mt-6">
              <LeadForm source="vacancy-application" withService={false} />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
