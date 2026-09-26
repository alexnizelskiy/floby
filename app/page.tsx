import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { Reasons } from "@/components/sections/reasons";
import { ServicesGrid } from "@/components/sections/services-grid";
import { CleaningChecklist } from "@/components/sections/cleaning-checklist";
import { NotIncluded } from "@/components/sections/not-included";
import { HowItWorks } from "@/components/sections/how-it-works";
import { CleanersTrust } from "@/components/sections/cleaners-trust";
import { BeforeAfter } from "@/components/sections/before-after";
import { CalculatorSection } from "@/components/sections/calculator-section";
import { ReviewsSlider } from "@/components/sections/reviews-slider";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaBand } from "@/components/sections/cta-band";
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

// Страховка: раз в час; правки цен из админки инвалидируют главную мгновенно.
export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <Hero />
      <Reasons />
      <ServicesGrid />
      <CleaningChecklist />
      <NotIncluded />
      <HowItWorks />
      <CleanersTrust />
      <BeforeAfter />
      <CalculatorSection />
      <ReviewsSlider />
      <FaqSection items={homeFaq} />
      <CtaBand />
    </>
  );
}
