import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { services } from "@/content/services";
import { getIcon } from "@/lib/icons";
import { formatPrice } from "@/lib/utils";
import { getPricing } from "@/lib/pricing";
import { SERVICE_CLEANING_TYPE, priceFromType, addonPrice } from "@/lib/calc";
import type { Service } from "@/types";

export async function ServicesGrid() {
  const pricing = await getPricing();
  const priceFrom = (service: Service) => {
    const type = SERVICE_CLEANING_TYPE[service.slug];
    if (type) return priceFromType(type, pricing);
    if (service.slug === "window-cleaning") return addonPrice("windows", pricing);
    return service.priceFrom;
  };
  return (
    <Section id="services" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Популярные услуги"
        title="Выберите услугу — остальное сделаем мы"
        description="От регулярной поддерживающей уборки до генеральной и уборки после ремонта. Все работы — с фиксированной ценой и гарантией."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => {
          const Icon = getIcon(service.icon);
          return (
            <Reveal key={service.slug} delayIndex={i}>
              <Link
                href={`/services/${service.slug}`}
                className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex items-start justify-between">
                  <div className="grid size-13 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" />
                  </div>
                  {service.popular && <Badge variant="brand">Хит</Badge>}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.excerpt}</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      {service.unit}
                    </span>
                    <p className="text-lg font-bold text-foreground">
                      от {formatPrice(priceFrom(service))}
                    </p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-brand-300 group-hover:bg-brand-50 group-hover:text-primary">
                    <ArrowUpRight className="size-5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
