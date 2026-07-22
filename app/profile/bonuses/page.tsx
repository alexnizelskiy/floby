import { Gift } from "lucide-react";
import { ReferralShare } from "@/components/profile/referral-share";
import { referralSteps, demoUser } from "@/content/profile";
import { getIcon } from "@/lib/icons";

export default function BonusesPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero referral card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-7 text-white md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
              <Gift className="size-4" /> Бонусная программа
            </span>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">
              По 500 рублей — на уборку тебе и другу
            </h2>
            <p className="mt-4 max-w-lg text-white/85">
              Поделитесь ссылкой с друзьями. Они получат по 500 ₽ на первый заказ
              поддерживающей уборки, а вы — по 500 ₽ за каждого сразу после их уборки.
            </p>
            <div className="mt-6">
              <ReferralShare link={demoUser.referralLink} />
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-white/20">
              <Gift className="size-8" />
            </div>
            <p className="mt-4 text-2xl font-bold">Дарю друзьям 500 ₽</p>
            <p className="mt-1 text-sm text-white/80">на первую уборку по этой ссылке</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="rounded-2xl border border-border bg-card p-7 md:p-8">
        <h3 className="text-xl font-bold">Как это работает</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {referralSteps.map((step, i) => {
            const Icon = getIcon(step.icon);
            return (
              <div key={step.title} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-100 text-brand-700">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-3xl font-extrabold text-brand-200">{i + 1}</span>
                </div>
                <h4 className="font-semibold">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
