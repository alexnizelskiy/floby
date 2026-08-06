"use client";

import { Section, SectionHeading } from "@/components/ui/section";
import { HomeCalculator } from "@/features/calculator/home-calculator";
import { useRoleFlags } from "@/components/auth/auth-provider";

export function CalculatorSection() {
  const { canOrder } = useRoleFlags();
  // Staff / executors don't order cleanings — hide the ordering calculator.
  if (!canOrder) return null;

  return (
    <Section id="calculator" className="scroll-mt-24 bg-background">
      <SectionHeading
        eyebrow="Калькулятор стоимости"
        title="Рассчитайте цену уборки за минуту"
        description="Выберите параметры — сумма считается сразу. Добавляйте услуги и оформляйте заказ онлайн."
      />
      <div className="mt-12">
        <HomeCalculator />
      </div>
    </Section>
  );
}
