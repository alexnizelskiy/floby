import { PhotoHero } from "@/components/sections/photo-hero";
import { HeroCalcForm } from "@/components/sections/hero-calc-form";
import { getPricing } from "@/lib/pricing";
import { priceFromType } from "@/lib/calc";
import { formatPrice } from "@/lib/utils";

export async function Hero() {
  const pricing = await getPricing();
  const from = priceFromType("regular", pricing);
  return (
    <PhotoHero
      image="/images/hero-regular.webp"
      imageAlt="Клинеры floby делают поддерживающую уборку в Ростове-на-Дону"
      title="Поддерживающая уборка"
      subtitle={`Закажите уборку квартиры от ${formatPrice(from)}`}
      priority
    >
      <HeroCalcForm variant="row" className="max-w-[1000px]" />
    </PhotoHero>
  );
}
