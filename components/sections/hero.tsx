import Image from "next/image";
import { HeroCalcForm } from "@/components/sections/hero-calc-form";

export function Hero() {
  return (
    <section className="pt-8 md:pt-16">
      <div className="container-page">
        <div className="relative flex min-h-[560px] items-end justify-center overflow-hidden rounded-[2.25rem] md:h-[641px] md:rounded-[3.75rem]">
          {/* Background photo */}
          <Image
            src="/images/hero-team.png"
            alt="Команда клинеров floby в Ростове-на-Дону"
            fill
            priority
            sizes="(max-width: 1440px) 100vw, 1390px"
            className="object-cover"
            style={{
              objectPosition: "58% 60%",
              transform: "scale(1.5)",
              transformOrigin: "58% 46%",
            }}
          />
          {/* White fade to the bottom (form area) */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_50%,rgba(255,255,255,0.8)_78%,#ffffff_93%)]" />

          {/* Content */}
          <div className="relative flex w-full flex-col items-center gap-4 px-4 pb-8 pt-10 md:px-10 md:pb-12">
            <h1 className="text-center text-3xl font-bold leading-tight text-foreground md:text-5xl">
              Уборка квартир и домов
            </h1>
            <p className="mb-2 text-center text-lg font-medium text-foreground/80 md:text-xl">
              Выберите комнаты и тип уборки — рассчитаем стоимость
            </p>
            <HeroCalcForm className="max-w-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
