import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { Reasons } from "@/components/sections/reasons";
import { ServicesGrid } from "@/components/sections/services-grid";
import { CleaningChecklist } from "@/components/sections/cleaning-checklist";
import { HowItWorks } from "@/components/sections/how-it-works";
import { CalculatorSection } from "@/components/sections/calculator-section";
import { ReviewsSlider } from "@/components/sections/reviews-slider";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd } from "@/components/seo/json-ld";
import { localBusinessJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { homeFaq } from "@/content/faq";

export const metadata: Metadata = buildMetadata({
  title: "floby — клининговая компания в Ростове-на-Дону",
  description:
    "Уборка квартир, домов и офисов в Ростове-на-Дону от floby. Поддерживающая и генеральная уборка, мойка окон, уборка после ремонта. Фиксированная цена, гарантия качества.",
  keywords: [
    "уборка квартир Ростов-на-Дону",
    "клининговая компания Ростов",
    "генеральная уборка Ростов",
    "клининг Ростов",
  ],
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <Hero />
      <Reasons />
      <ServicesGrid />
      <CleaningChecklist />
      <HowItWorks />
      <CalculatorSection />
      <ReviewsSlider />
      <FaqSection items={homeFaq} />
      <CtaBand />
    </>
  );
}
