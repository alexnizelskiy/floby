import type { Metadata } from "next";
import Link from "next/link";
import {
  PawPrint,
  Cat,
  HeartHandshake,
  Clock,
  Camera,
  ShieldCheck,
  Star,
  BadgeCheck,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { FaqSection } from "@/components/sections/faq-section";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "floby Питомцы — выгул, няня и передержка собак в Ростове-на-Дону",
  description:
    "Выгул собак, няня и передержка в Ростове-на-Дону от floby: проверенные выгульщики, фотоотчёт с каждой прогулки, страховка. Выгул от 299 ₽.",
  keywords: [
    "выгул собак Ростов-на-Дону",
    "передержка собак Ростов",
    "няня для собаки Ростов",
    "выгульщик собак Ростов",
  ],
  path: "/pets",
});

const tariffs = [
  { icon: PawPrint, badge: "От 20 мин", title: "Выгулы", price: "от 299 ₽", desc: "Надёжный выгульщик погуляет и пришлёт фотоотчёт." },
  { icon: HeartHandshake, badge: "От 1 часа", title: "Няня", price: "от 990 ₽", desc: "Присмотрим за питомцем, пока вас нет дома." },
  { icon: Clock, badge: "От 1 суток", title: "Передержка", price: "от 1 899 ₽", desc: "Посидим с питомцем у вас или у ситтера." },
  { icon: Cat, badge: "от 15 мин", title: "У меня котик!", price: "от 649 ₽", desc: "Визиты от 15 минут, кото-няни и ситтеры." },
];

const steps = [
  { n: "01", title: "Заявка", desc: "Заполняете анкету о питомце и заказе — это быстро." },
  { n: "02", title: "Подбор выгульщика", desc: "Подбираем проверенного специалиста рядом с вами." },
  { n: "03", title: "Знакомство", desc: "Знакомим выгульщика с питомцем заранее." },
  { n: "04", title: "Прогулка с фотоотчётом", desc: "Гуляем и присылаем фото и маршрут." },
  { n: "05", title: "Оплата и поддержка", desc: "Оплата картой, мы всегда на связи." },
];

const benefits = [
  { icon: BadgeCheck, title: "Проверенные выгульщики", desc: "Строгий отбор, интервью и тестовые прогулки." },
  { icon: Camera, title: "Фотоотчёт с прогулки", desc: "Фото и маршрут после каждой прогулки." },
  { icon: ShieldCheck, title: "Страховка", desc: "Ветпомощь при травме по вине выгульщика — за наш счёт." },
  { icon: Star, title: "Рейтинг 4,9", desc: "Оценки клиентов после каждой услуги." },
  { icon: MapPin, title: "Удобные маршруты", desc: "Гуляем в знакомых питомцу местах." },
  { icon: Clock, title: "Гибкий график", desc: "Разово или по расписанию, в удобное время." },
];

const petFaq = [
  { question: "Как проходит первая прогулка?", answer: "Выгульщик знакомится с питомцем в вашем присутствии, уточняет привычки и команды. Дальше можно передавать питомца на прогулки без вашего участия." },
  { question: "Вы присылаете отчёт?", answer: "Да, после каждой прогулки — фотографии и маршрут, а также как прошла прогулка." },
  { question: "Чем няня отличается от передержки?", answer: "Няня приходит к вам и присматривает несколько часов. Передержка — когда питомец гостит у ситтера сутки и дольше." },
  { question: "А если у меня кот?", answer: "Есть отдельный формат «У меня котик!» — визиты от 15 минут, кото-няни и ситтеры." },
];

export default function PetsHome() {
  return (
    <>
      {/* Hero */}
      <Section className="pt-10 md:pt-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3.5 py-1.5 text-sm font-semibold text-brand-700">
          <PawPrint className="size-4" /> Забота о питомцах в Ростове-на-Дону
        </span>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
          Погуляем и присмотрим за вашим питомцем
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Проверенные выгульщики и ситтеры, фотоотчёт с каждой прогулки и забота о питомце как о своём.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/order" className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-600">
            Заказать <ArrowRight className="size-4" />
          </Link>
          {[
            { icon: Star, label: "4,9 — оценка клиентов" },
            { icon: BadgeCheck, label: "Проверенные выгульщики" },
            { icon: Camera, label: "Фотоотчёт" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
              <s.icon className="size-5 text-primary" />
              <span className="text-sm font-semibold">{s.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Тарифы */}
      <Section id="tariffs" className="scroll-mt-24">
        <SectionHeading eyebrow="Услуги и цены" title="Какая услуга требуется?" description="Выберите формат — оформим заказ за пару минут." />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tariffs.map((t) => (
            <Link key={t.title} href="/order" className="flex flex-col rounded-3xl border border-border bg-card p-6 transition-colors hover:border-brand-300">
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700">
                  <t.icon className="size-6" />
                </span>
                <span className="rounded-full bg-surface-strong px-3 py-1 text-xs font-semibold text-muted-foreground">{t.badge}</span>
              </div>
              <h3 className="mt-5 text-xl font-bold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              <p className="mt-5 text-2xl font-bold">{t.price}</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* Как это работает */}
      <Section id="how" className="scroll-mt-24">
        <SectionHeading eyebrow="Как это работает" title="Пять шагов до спокойной прогулки" />
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
        <SectionHeading eyebrow="Почему floby" title="Питомец в надёжных руках" />
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

      <FaqSection items={petFaq} eyebrow="Вопросы и ответы" title="Частые вопросы о питомцах" />

      {/* CTA */}
      <Section>
        <div className="rounded-[2rem] bg-brand-500 px-6 py-14 text-center text-white md:px-12 md:py-20">
          <h2 className="text-3xl font-bold md:text-4xl">Готовы доверить питомца профессионалам?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">
            Оформите заказ — подберём проверенного выгульщика. Первая прогулка уже завтра.
          </p>
          <Link href="/order" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-brand-700 transition-colors hover:bg-white/90">
            Заказать выгул <ArrowRight className="size-4" />
          </Link>
        </div>
      </Section>
    </>
  );
}
