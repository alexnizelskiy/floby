import Link from "next/link";
import { Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderButton } from "@/components/forms/order-button";

const popular = [
  { label: "Услуги", href: "/#services" },
  { label: "Цены", href: "/prices" },
  { label: "Отзывы", href: "/reviews" },
  { label: "Помощь", href: "/help" },
  { label: "Контакты", href: "/contacts" },
];

export default function NotFound() {
  return (
    <section className="bg-surface">
      <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center md:py-24">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
          Ошибка 404
        </span>

        <p
          aria-hidden
          className="mt-6 select-none text-[6rem] font-bold leading-none text-brand-500 md:text-[10rem]"
        >
          404
        </p>

        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Страница не найдена</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Проверьте, правильно ли введён адрес. Если всё верно — возможно, страница переехала.
          А можно не тратить время на поиски и просто заказать уборку прямо сейчас.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <OrderButton size="xl">
            Заказать уборку <ArrowRight />
          </OrderButton>
          <Button asChild variant="outline" size="xl">
            <Link href="/">
              <Home /> На главную
            </Link>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <span className="text-muted-foreground">Популярное:</span>
          {popular.map((p) => (
            <Link key={p.href} href={p.href} className="font-medium text-primary hover:underline">
              {p.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
