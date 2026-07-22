import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd } from "@/lib/jsonld";
import type { FaqItem } from "@/types";

interface FaqSectionProps {
  items: FaqItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
  withSchema?: boolean;
  showHelpLink?: boolean;
}

export function FaqSection({
  items,
  eyebrow = "Вопросы и ответы",
  title = "Частые вопросы",
  description = "Собрали ответы на то, что чаще всего спрашивают клиенты.",
  withSchema = true,
  showHelpLink = true,
}: FaqSectionProps) {
  return (
    <Section id="faq" className="scroll-mt-24">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
            align="left"
          />
          {showHelpLink && (
            <Button asChild variant="outline" className="mt-6">
              <Link href="/help">
                Все вопросы <ArrowRight />
              </Link>
            </Button>
          )}
        </div>

        <Accordion items={items} defaultOpen={0} />
      </div>

      {withSchema && <JsonLd data={faqJsonLd(items)} />}
    </Section>
  );
}
