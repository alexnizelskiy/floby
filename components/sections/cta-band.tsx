import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderCta } from "@/components/forms/order-cta";
import { siteConfig } from "@/lib/site";

interface CtaBandProps {
  title?: string;
  description?: string;
  source?: string;
}

export function CtaBand({
  title = "Готовы доверить уборку профессионалам?",
  description = "Оставьте заявку — перезвоним, ответим на вопросы и подберём удобное время. Уборка уже завтра.",
  source = "cta-band",
}: CtaBandProps) {
  return (
    <section className="container-page py-16 md:py-20">
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-14 text-center text-white md:px-12 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
          <h2 className="text-3xl font-bold md:text-4xl lg:text-[2.75rem]">{title}</h2>
          <p className="text-lg text-white/85">{description}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <OrderCta variant="white" size="xl" source={source} />
            <Button asChild variant="outline" size="xl" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/40">
              <a href={siteConfig.contacts.phoneHref}>
                <Phone /> {siteConfig.contacts.phone}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
