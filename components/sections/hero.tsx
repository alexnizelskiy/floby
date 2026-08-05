import { PhotoHero } from "@/components/sections/photo-hero";
import { HeroCalcForm } from "@/components/sections/hero-calc-form";

export function Hero() {
  return (
    <PhotoHero
      image="/images/hero-regular.webp"
      imageAlt="Клинеры floby делают поддерживающую уборку в Ростове-на-Дону"
      title="Поддерживающая уборка"
      subtitle="Закажите уборку квартиры от 2050 ₽"
      priority
    >
      <HeroCalcForm variant="row" className="max-w-[1000px]" />
    </PhotoHero>
  );
}
