import { Section, SectionHeading } from "@/components/ui/section";
import { Calculator } from "@/features/calculator/calculator";

export function CalculatorSection() {
  return (
    <Section id="calculator" className="scroll-mt-24 bg-surface">
      <SectionHeading
        eyebrow="Калькулятор стоимости"
        title="Рассчитайте цену уборки за минуту"
        description="Выберите параметры — и увидите стоимость сразу, без ожидания и звонков."
      />
      <div className="mt-12">
        <Calculator />
      </div>
    </Section>
  );
}
