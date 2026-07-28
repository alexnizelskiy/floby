import { Section, SectionHeading } from "@/components/ui/section";
import { HomeCalculator } from "@/features/calculator/home-calculator";

export function CalculatorSection() {
  return (
    <Section id="calculator" className="scroll-mt-24 bg-surface">
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
