import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { services, getService } from "@/content/services";
import { buildMetadata } from "@/lib/seo";
import { serviceJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ServiceHero } from "@/components/service/service-hero";
import { ServiceBenefits } from "@/components/service/service-benefits";
import { ServiceIncludes } from "@/components/service/service-includes";
import { ServiceSteps } from "@/components/service/service-steps";
import { CleaningChecklist } from "@/components/sections/cleaning-checklist";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaBand } from "@/components/sections/cta-band";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return buildMetadata({
    title: service.seo.title,
    description: service.seo.description,
    keywords: service.seo.keywords,
    path: `/services/${service.slug}`,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const crumbs = [
    { label: "Услуги", href: "/#services" },
    { label: service.shortTitle, href: `/services/${service.slug}` },
  ];

  const showChecklist = ["regular-cleaning", "deep-cleaning"].includes(service.slug);

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd(service),
          faqJsonLd(service.faq),
          breadcrumbJsonLd([{ label: "Главная", href: "/" }, ...crumbs]),
        ]}
      />
      <Breadcrumbs items={crumbs} />
      <ServiceHero service={service} />
      <ServiceBenefits service={service} />
      <ServiceIncludes service={service} />
      {showChecklist && <CleaningChecklist />}
      <ServiceSteps service={service} />
      <FaqSection
        items={service.faq}
        title={`Вопросы про услугу «${service.shortTitle}»`}
        description="Не нашли ответ? Напишите нам — подскажем."
        showHelpLink={false}
      />
      <CtaBand
        title={`Закажите ${service.shortTitle.toLowerCase()} в floby`}
        source={`service-cta-${service.slug}`}
      />
    </>
  );
}
