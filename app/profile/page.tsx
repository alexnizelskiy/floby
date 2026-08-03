import Link from "next/link";
import { Phone, ListChecks, CalendarClock, Wallet, LayoutDashboard, ArrowRight } from "lucide-react";
import { MyCleanings } from "@/components/profile/my-cleanings";
import { ExecutorOrders } from "@/components/profile/executor-orders";
import { formatPrice } from "@/lib/utils";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getBalance } from "@/lib/bonus";

export default async function ProfileHomePage() {
  const user = await getCurrentUser();

  // ── Executor: dedicated cleaner cabinet (no client booking UI) ──
  if (user?.role === "executor") {
    return <ExecutorOrders />;
  }

  // ── Staff (manager/admin): point to the management panel ──
  if (isStaff(user)) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/admin"
          className="flex items-center justify-between rounded-2xl border border-brand-300 bg-brand-50 p-6 transition-colors hover:bg-brand-100"
        >
          <span className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground">
              <LayoutDashboard className="size-5" />
            </span>
            <span>
              <span className="block font-semibold">Панель управления</span>
              <span className="block text-sm text-muted-foreground">Заявки, исполнители, аналитика</span>
            </span>
          </span>
          <ArrowRight className="size-5 text-primary" />
        </Link>
        <p className="text-sm text-muted-foreground">
          Вы вошли как {user?.role === "admin" ? "администратор" : "менеджер"}. Управление заказами и сотрудниками — в панели.
        </p>
      </div>
    );
  }

  // ── Client cabinet ──
  const balance = user ? await getBalance(user.id) : 0;
  return (
    <div className="flex flex-col gap-6">
      <MyCleanings />

      <div className="grid gap-6 md:grid-cols-2">
        {/* App promo */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold">С приложением удобнее!</h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm">
            {[
              { icon: Phone, text: "Звоните клинеру перед или во время уборки" },
              { icon: ListChecks, text: "Управляйте списком ваших клинеров" },
              { icon: CalendarClock, text: "Управляйте расписанием уборок" },
            ].map((row) => (
              <li key={row.text} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                  <row.icon className="size-4" />
                </span>
                {row.text}
              </li>
            ))}
          </ul>
          <Link
            href="/profile/bonuses"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-800"
          >
            Пригласить друга — +500 ₽
          </Link>
        </div>

        {/* Balance */}
        <div className="flex flex-col rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-brand-100 text-brand-700">
              <Wallet className="size-5" />
            </span>
            <h3 className="text-lg font-bold">Ваш баланс на уборки</h3>
          </div>
          <p className="mt-4 text-4xl font-extrabold text-primary">{formatPrice(balance)}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Вы можете оплатить бонусами до 15% стоимости уборки.
          </p>
          <Link
            href="/profile/bonuses"
            className="mt-auto pt-5 text-sm font-semibold text-primary hover:underline"
          >
            Как получить бонусы →
          </Link>
        </div>
      </div>
    </div>
  );
}
