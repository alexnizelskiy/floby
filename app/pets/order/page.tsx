import type { Metadata } from "next";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Заказать выгул — floby Питомцы",
  description: "Оформление заказа на выгул собаки.",
  path: "/pets/order",
});

export default function PetsOrderPage() {
  return (
    <Section className="py-16 md:py-24">
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-3xl border border-border bg-card p-8 text-center md:p-10">
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-100 text-brand-700">
          <PawPrint className="size-7" />
        </span>
        <h1 className="text-2xl font-bold">Онлайн-оформление скоро</h1>
        <p className="text-muted-foreground">
          Пошаговый заказ выгула с анкетой о питомце уже готовим. Пока оставьте заявку по телефону —
          подберём выгульщика и подтвердим стоимость.
        </p>
        <a href={siteConfig.contacts.phoneHref} className="text-lg font-bold text-primary">
          {siteConfig.contacts.phone}
        </a>
        <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
          ← Вернуться на главную
        </Link>
      </div>
    </Section>
  );
}
