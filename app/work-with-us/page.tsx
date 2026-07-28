import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Smartphone, Wallet, ShieldCheck, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Работа в floby — партнёрам и клинерам",
  description:
    "Работайте с floby: поток заказов, удобное приложение с заработком и рейтингом, честные условия. Присоединяйтесь к команде клинеров в Ростове-на-Дону.",
  keywords: ["работа в floby", "партнёрам клининг", "стать клинером"],
  path: "/work-with-us",
});

const steps = [
  { n: 1, title: "Оставляете заявку", text: "Заполняете короткую форму на странице вакансий — имя и телефон." },
  { n: 2, title: "Знакомимся и обучаем", text: "Рассказываем про стандарты, оформление самозанятости и работу в приложении." },
  { n: 3, title: "Берёте заказы", text: "Видите заказы рядом с домом, выбираете удобные и выходите на уборку." },
  { n: 4, title: "Получаете доход и рейтинг", text: "Заработок и оценки — в личном кабинете. Хорошие отзывы = больше заказов." },
];

const benefits = [
  { icon: Wallet, title: "Честный доход", text: "Прозрачная доля от каждого заказа, выплаты без задержек." },
  { icon: Smartphone, title: "Удобное приложение", text: "Заказы, маршрут, пожелания клиента, заработок и рейтинг — в одном кабинете." },
  { icon: ShieldCheck, title: "Поддержка", text: "Помогаем с оформлением, спорными ситуациями и сложными заказами." },
  { icon: TrendingUp, title: "Рост", text: "Чем выше рейтинг, тем больше заказов и выше ставка. Всё зависит от вас." },
];

export default function WorkWithUsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Работа в floby"
        title="Работайте на себя — заказы приносим мы"
        description="floby берёт на себя клиентов, заявки и сервис. Вы — качественную уборку. Честные условия и удобные инструменты."
        crumbs={[{ label: "Работа в floby", href: "/work-with-us" }]}
      >
        <Button asChild size="lg">
          <Link href="/vacancies">
            Смотреть вакансии <ArrowRight />
          </Link>
        </Button>
      </PageHeader>

      <Section>
        <SectionHeading eyebrow="Преимущества" title="Почему клинеры выбирают floby" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
        <SectionHeading eyebrow="Как начать" title="Четыре шага до первого заказа" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid size-10 place-items-center rounded-full bg-brand-600 text-lg font-bold text-white">
                {s.n}
              </span>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 rounded-[2rem] border border-brand-200 bg-brand-50/50 p-10 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Готовы начать зарабатывать с floby?</h2>
          <p className="max-w-xl text-muted-foreground">
            Оставьте заявку — расскажем об условиях и подберём первые заказы рядом с вами.
          </p>
          <Button asChild size="xl">
            <Link href="/vacancies">
              Откликнуться на вакансию <ArrowRight />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
