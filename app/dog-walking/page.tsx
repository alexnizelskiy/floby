import type { Metadata } from "next";
import {
  PawPrint,
  Camera,
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  BadgeCheck,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaBand } from "@/components/sections/cta-band";
import { LeadForm } from "@/components/forms/lead-form";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Выгул собак в Ростове-на-Дону — floby",
  description:
    "Профессиональный выгул собак в Ростове-на-Дону от floby: проверенные выгульщики, фотоотчёт с каждой прогулки, страховка и забота о питомце. Выгул от 299 ₽.",
  keywords: [
    "выгул собак Ростов-на-Дону",
    "выгульщик собак Ростов",
    "погулять с собакой Ростов",
    "передержка собак Ростов",
  ],
  path: "/dog-walking",
});

const tariffs = [
  {
    icon: PawPrint,
    title: "Выгул",
    price: "от 299 ₽",
    unit: "прогулка 30–60 мин",
    desc: "Активная прогулка, вода, уборка за питомцем и фотоотчёт. Разовый или по расписанию.",
    badge: "Популярное",
  },
  {
    icon: HeartHandshake,
    title: "Няня на день",
    price: "от 799 ₽",
    unit: "от 1 часа",
    desc: "Присмотр, игры и прогулки, пока вас нет дома. Кормление по вашему графику.",
  },
  {
    icon: Clock,
    title: "Передержка",
    price: "от 1 899 ₽",
    unit: "сутки",
    desc: "Питомец гостит у проверенного ситтера: дом, режим и внимание как у вас.",
  },
];

const steps = [
  { n: "01", title: "Заявка", desc: "Оставляете заявку — рассказываете о питомце, времени и месте." },
  { n: "02", title: "Подбор выгульщика", desc: "Подбираем проверенного специалиста рядом с вами." },
  { n: "03", title: "Знакомство", desc: "Знакомим выгульщика с собакой заранее, чтобы всё прошло спокойно." },
  { n: "04", title: "Прогулка с фотоотчётом", desc: "Гуляем, играем и присылаем фото и маршрут прогулки." },
  { n: "05", title: "Оплата и поддержка", desc: "Оплата после услуги. Мы всегда на связи." },
];

const benefits = [
  { icon: BadgeCheck, title: "Проверенные выгульщики", desc: "Отбор, интервью и тестовые прогулки — в команду попадают не все." },
  { icon: Camera, title: "Фотоотчёт с прогулки", desc: "Видите, где и как гуляла собака — фото и маршрут после каждой прогулки." },
  { icon: ShieldCheck, title: "Страховка и ответственность", desc: "Ветпомощь при травме по вине выгульщика — за наш счёт." },
  { icon: Star, title: "Рейтинг и отзывы", desc: "После каждой прогулки — оценка. Лучшие выгульщики получают больше заказов." },
  { icon: MapPin, title: "Удобные маршруты", desc: "Гуляем в знакомых собаке местах, учитываем её характер и привычки." },
  { icon: Clock, title: "Гибкий график", desc: "Разово или по расписанию — хоть каждый день в удобное время." },
];

const dogFaq = [
  {
    question: "Как проходит первая прогулка?",
    answer:
      "Сначала выгульщик знакомится с собакой в вашем присутствии, уточняет привычки и команды. Дальше можно передавать питомца на прогулки без вашего участия — по договорённости о ключах или встрече.",
  },
  {
    question: "Вы присылаете отчёт о прогулке?",
    answer:
      "Да. После каждой прогулки выгульщик присылает фотографии и маршрут, а также сообщает, как прошла прогулка, поел ли питомец воды и всё ли в порядке.",
  },
  {
    question: "Чем няня отличается от передержки?",
    answer:
      "Няня приходит к вам домой и присматривает за питомцем несколько часов. Передержка — когда собака гостит у проверенного ситтера сутки и дольше, пока вы в отъезде.",
  },
  {
    question: "Что если собака крупная или тревожная?",
    answer:
      "Подбираем выгульщика с опытом под темперамент и размер собаки. На знакомстве проверяем, что питомцу комфортно, и обсуждаем все нюансы: амуницию, поведение, реакции.",
  },
  {
    question: "Как оплатить услугу?",
    answer:
      "Оплата после оказанной услуги — картой онлайн или наличными. Стоимость известна заранее, без скрытых доплат.",
  },
];

export default function DogWalkingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Выгул собак в Ростове-на-Дону"
        title="Погуляем с вашей собакой, пока вы заняты"
        description="Проверенные выгульщики, фотоотчёт с каждой прогулки и забота о питомце как о своём."
        crumbs={[{ label: "Выгул собак", href: "/dog-walking" }]}
      >
        <div className="flex flex-col gap-5">
          <a
            href="#order"
            className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-600"
          >
            Заказать выгул <ArrowRight className="size-4" />
          </a>
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Star, label: "4,9 — оценка клиентов" },
              { icon: BadgeCheck, label: "Проверенные выгульщики" },
              { icon: Camera, label: "Фотоотчёт с прогулки" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
                <s.icon className="size-5 text-primary" />
                <span className="text-sm font-semibold">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </PageHeader>

      {/* Тарифы */}
      <Section>
        <SectionHeading
          eyebrow="Услуги и цены"
          title="Выберите формат заботы о питомце"
          description="Разовый выгул, няня на день или передержка на время отъезда — с фиксированной ценой."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tariffs.map((t) => (
            <div key={t.title} className="flex flex-col rounded-3xl border border-border bg-card p-7">
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700">
                  <t.icon className="size-6" />
                </span>
                {t.badge && (
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                    {t.badge}
                  </span>
                )}
              </div>
              <h3 className="mt-5 text-xl font-bold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{t.price}</span>
                <span className="text-sm text-muted-foreground">· {t.unit}</span>
              </div>
              <a
                href="#order"
                className="mt-6 inline-flex items-center justify-center rounded-full border border-ink-950 px-6 py-3 text-sm font-semibold text-ink-950 transition-colors hover:bg-ink-950 hover:text-white"
              >
                Оставить заявку
              </a>
            </div>
          ))}
        </div>
      </Section>

      {/* Как это работает */}
      <Section>
        <SectionHeading
          eyebrow="Как это работает"
          title="Пять шагов до спокойной прогулки"
          description="Прозрачный процесс: от заявки до фотоотчёта и поддержки."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
              <span className="text-sm font-bold text-brand-600">{s.n}</span>
              <h3 className="mt-2 font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Преимущества */}
      <Section>
        <SectionHeading
          eyebrow="Почему floby"
          title="Питомец в надёжных руках"
          description="Мы тщательно отбираем выгульщиков и следим за качеством каждой прогулки."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid size-11 place-items-center rounded-full bg-brand-100 text-brand-700">
                <b.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-bold">{b.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <FaqSection items={dogFaq} eyebrow="Вопросы и ответы" title="Частые вопросы о выгуле" />

      {/* Заявка */}
      <Section id="order" className="scroll-mt-24">
        <div className="mx-auto max-w-xl">
          <SectionHeading
            eyebrow="Оставьте заявку"
            title="Закажите выгул собаки"
            description="Оставьте имя и телефон — перезвоним, уточним детали и подберём выгульщика."
          />
          <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-8">
            <LeadForm source="dog-walking" />
          </div>
        </div>
      </Section>

      <CtaBand
        title="Готовы доверить питомца профессионалам?"
        description="Оставьте заявку — перезвоним, ответим на вопросы и подберём выгульщика. Первая прогулка уже завтра."
        source="dog-walking-cta"
      />
    </>
  );
}
