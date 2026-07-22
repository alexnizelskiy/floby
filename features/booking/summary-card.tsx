import { Zap } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  summaryTitle,
  formatDateShort,
  type PriceBreakdown,
  type SubscriptionPlan,
} from "@/lib/booking";
import { subscriptions } from "@/lib/booking";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  rooms: number;
  baths: number;
  date: string;
  time: string;
  durationHours: number;
  subscription: SubscriptionPlan;
  paymentLabel?: string;
  price: PriceBreakdown;
  className?: string;
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right font-medium", muted ? "text-muted-foreground" : "text-foreground")}>
        {value}
      </span>
    </div>
  );
}

export function SummaryCard({
  rooms,
  baths,
  date,
  time,
  durationHours,
  subscription,
  paymentLabel,
  price,
  className,
}: SummaryCardProps) {
  const regularity = subscriptions.find((s) => s.id === subscription)?.title ?? "Один раз";
  const regularityText = subscription === "none" ? "Один раз" : regularity;

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6", className)}>
      <p className="text-base font-semibold leading-snug">{summaryTitle(rooms, baths)}</p>

      <div className="my-4 h-px bg-border" />

      <div className="flex flex-col gap-2.5">
        <Row label="Дата уборки" value={`${formatDateShort(date)} ${time}`} />
        <Row label="Время уборки" value={`до ${durationHours} часов`} />
        <Row label="Регулярность" value={regularityText} />
        {paymentLabel && <Row label="Способ оплаты" value={paymentLabel} />}
      </div>

      <div className="my-4 h-px bg-border" />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Стоимость уборки</span>
          <span className="font-semibold">{formatPrice(price.base + price.optionsTotal)}</span>
        </div>
        {price.surgePercent > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Повышенный тариф {price.surgePercent}%</span>
            <span>+{formatPrice(price.surgeAmount)}</span>
          </div>
        )}
      </div>

      <div className="my-4 h-px bg-border" />

      <div className="flex items-center justify-between">
        <span className="font-semibold">К оплате</span>
        <span className="flex items-center gap-1 text-lg font-bold">
          {price.surgePercent > 0 && <Zap className="size-4 fill-sky-400 text-sky-400" />}
          {formatPrice(price.total)}
        </span>
      </div>
    </div>
  );
}
