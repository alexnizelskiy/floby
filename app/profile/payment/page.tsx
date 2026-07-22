import { CreditCard, Plus, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReferralShare } from "@/components/profile/referral-share";
import { savedCards, demoUser } from "@/content/profile";

export default function PaymentPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-2xl border border-border bg-card p-7 md:p-8">
        <h2 className="text-2xl font-bold">Способы оплаты</h2>
        <p className="mt-2 text-sm text-muted-foreground">Уборка</p>

        <div className="mt-6 flex flex-col gap-3">
          {savedCards.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-brand-100 text-brand-700">
                <CreditCard className="size-6" />
              </span>
              <p className="text-sm text-muted-foreground">
                У вас пока нет сохранённых карт. Добавьте карту, чтобы оплачивать
                уборку в один клик.
              </p>
            </div>
          ) : (
            savedCards.map((card) => (
              <div
                key={card.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
              >
                <CreditCard className="size-5 text-primary" />
                <span className="text-sm font-medium">
                  {card.brand} •••• {card.last4}
                </span>
              </div>
            ))
          )}

          <Button size="lg" className="w-full">
            <Plus /> Добавить новую карту
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Данные карты вводятся в защищённой форме банка. floby не хранит номер карты.
          </p>
        </div>
      </section>

      <aside className="rounded-2xl border border-brand-200 bg-brand-50/60 p-7">
        <div className="flex items-center gap-2 text-brand-700">
          <Gift className="size-5" />
          <h3 className="text-lg font-bold text-foreground">Скидка на уборку</h3>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Посоветуйте floby друзьям. Как только они сделают заказ — вы получите
          500 ₽ на бонусный счёт. Их можно использовать, чтобы оплатить 15%
          следующего заказа.
        </p>
        <div className="mt-5 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-4">
          <ReferralShare link={demoUser.referralLink} />
        </div>
      </aside>
    </div>
  );
}
