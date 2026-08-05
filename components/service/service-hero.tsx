import Link from "next/link";
import { Clock, Wallet, ShieldCheck, ArrowRight } from "lucide-react";
import { OrderButton } from "@/components/forms/order-button";
import { HeroCalcForm } from "@/components/sections/hero-calc-form";
import { PhotoHero } from "@/components/sections/photo-hero";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { formatPrice } from "@/lib/utils";
import { SERVICE_CLEANING_TYPE } from "@/lib/calc";
import type { Service } from "@/types";

/** Purpose-made hero photos per service page (1390×641). */
const SERVICE_HERO_IMAGE: Record<string, string> = {
  "regular-cleaning": "/images/hero-regular.webp",
  "deep-cleaning": "/images/hero-general.webp",
  "window-cleaning": "/images/hero-windows.webp",
  "furniture-cleaning": "/images/hero-furniture.webp",
  "post-renovation": "/images/hero-post-renovation.webp",
};

export function ServiceHero({ service }: { service: Service }) {
  const presetType = SERVICE_CLEANING_TYPE[service.slug];
  const heroImage = SERVICE_HERO_IMAGE[service.slug];

  // Pages with a hero photo use the homepage-style photo hero.
  if (heroImage) {
    return (
      <PhotoHero image={heroImage} imageAlt={service.title} title={service.title} subtitle={service.tagline} priority>
        {presetType ? (
          <HeroCalcForm variant="row" presetType={presetType} className="max-w-[1000px]" />
        ) : (
          <OrderButton size="xl" defaultService={service.slug} className="min-w-[240px]" />
        )}
      </PhotoHero>
    );
  }

  // Fallback (services without a photo, e.g. кондиционеры) — classic layout.
  const Icon = getIcon(service.icon);
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      <div className="pointer-events-none absolute -right-32 -top-32 size-[32rem] rounded-full bg-brand-100/60 blur-3xl" />
      <div className="container-page relative grid gap-10 py-14 md:py-20 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-100 px-3.5 py-1.5 text-sm font-semibold text-brand-700">
            <Icon className="size-4" />
            {service.shortTitle}
          </div>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            {service.title}{" "}
            <span className="text-brand-600">в Ростове-на-Дону</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">{service.description}</p>

          <div className="flex flex-wrap gap-3 pt-1">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
              <Wallet className="size-5 text-primary" />
              <span className="text-sm">
                <span className="text-muted-foreground">Цена </span>
                <span className="font-semibold">от {formatPrice(service.priceFrom)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
              <Clock className="size-5 text-primary" />
              <span className="text-sm font-semibold">{service.duration}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
              <ShieldCheck className="size-5 text-primary" />
              <span className="text-sm font-semibold">Гарантия качества</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <OrderButton size="xl" defaultService={service.slug} />
            <Button asChild variant="outline" size="xl">
              <Link href="/prices">
                Все цены <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-border bg-brand-500 p-8 text-white shadow-[var(--shadow-lg)]">
            <p className="text-sm text-white/80">{service.tagline}</p>
            <p className="mt-2 text-3xl font-bold">от {formatPrice(service.priceFrom)}</p>
            <p className="mt-1 text-sm text-white/80">{service.unit} · {service.duration}</p>
            <ul className="mt-6 flex flex-col gap-2.5">
              {service.included.slice(0, 5).map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-white" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
