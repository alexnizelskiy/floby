"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { OrderCta } from "@/components/forms/order-cta";
import { plural } from "@/lib/utils";

function Stepper({
  label,
  value,
  onChange,
  min = 1,
  max = 6,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-background px-2 py-2">
      <button
        type="button"
        aria-label="Убрать"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="grid size-10 place-items-center rounded-lg text-foreground transition-colors hover:bg-surface disabled:opacity-40"
        disabled={value <= min}
      >
        <Minus className="size-5" />
      </button>
      <span className="text-sm font-semibold">{label}</span>
      <button
        type="button"
        aria-label="Добавить"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="grid size-10 place-items-center rounded-lg text-foreground transition-colors hover:bg-surface disabled:opacity-40"
        disabled={value >= max}
      >
        <Plus className="size-5" />
      </button>
    </div>
  );
}

export function QuickOrder() {
  const [rooms, setRooms] = React.useState(1);
  const [baths, setBaths] = React.useState(1);

  const summary = `${rooms} ${plural(rooms, ["комната", "комнаты", "комнат"])}, ${baths} ${plural(baths, ["санузел", "санузла", "санузлов"])}`;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <h2 className="text-center text-xl font-bold md:text-2xl">
        У вас пока нет запланированных уборок
      </h2>
      <p className="mt-2 text-center text-muted-foreground">
        Но это легко исправить. Например, прямо сейчас.
      </p>

      <div className="mx-auto mt-6 flex max-w-md flex-col gap-3">
        <Stepper
          label={`${rooms}-комнатная`}
          value={rooms}
          onChange={setRooms}
        />
        <Stepper
          label={`${baths} ${plural(baths, ["санузел", "санузла", "санузлов"])}`}
          value={baths}
          onChange={setBaths}
        />
        <OrderCta
          size="lg"
          className="mt-1 w-full"
          source="profile-quick-order"
          label="Заказать уборку"
          defaultService="Поддерживающая уборка"
        />
        <p className="text-center text-xs text-muted-foreground">
          Нажимая «Заказать уборку», вы соглашаетесь с обработкой персональных
          данных и условиями сервиса. Выбрано: {summary}.
        </p>
      </div>
    </div>
  );
}
