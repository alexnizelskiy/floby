"use client";

import * as React from "react";
import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui/section";
import { Hint } from "@/components/ui/hint";
import { roomChecklists, type RoomChecklist } from "@/content/checklist";

const COLLAPSED = 5;

function priceLabel(price: number, unit?: string) {
  return `${price} р.${unit ? ` ${unit}` : ""}`;
}

function RoomBlock({ room }: { room: RoomChecklist }) {
  const [expanded, setExpanded] = React.useState(false);
  const canExpand = room.included.length > COLLAPSED || room.addons.length > COLLAPSED;
  const included = expanded ? room.included : room.included.slice(0, COLLAPSED);
  const addons = expanded ? room.addons : room.addons.slice(0, COLLAPSED);

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr_1fr] lg:gap-10">
      {/* Title + image + expand */}
      <div className="flex flex-col gap-5">
        <h3 className="text-2xl font-bold">{room.label}</h3>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image src={room.image} alt={room.label} fill sizes="300px" className="object-cover" />
        </div>
        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="w-full rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface lg:w-auto"
          >
            {expanded ? "Свернуть" : "Показать ещё опции"}
          </button>
        )}
      </div>

      {/* Входит в стоимость */}
      <div>
        <p className="border-b border-border pb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Входит в стоимость
        </p>
        <ul>
          {included.map((item) => (
            <li
              key={item.title}
              className="flex items-center justify-between gap-3 border-b border-border py-4"
            >
              <span className="text-base font-medium">{item.title}</span>
              <Hint text={item.hint} />
            </li>
          ))}
        </ul>
      </div>

      {/* Можно добавить */}
      <div>
        <p className="border-b border-border pb-3 text-sm font-bold uppercase tracking-wide text-primary">
          Можно добавить
        </p>
        <ul>
          {addons.map((addon) => (
            <li
              key={addon.title}
              className="flex items-start justify-between gap-3 border-b border-border py-4"
            >
              <div>
                <p className="text-base font-medium text-brand-600">{addon.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {priceLabel(addon.price, addon.unit)}
                </p>
              </div>
              <Hint text={addon.hint} className="mt-1" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function CleaningChecklist() {
  return (
    <Section id="checklist" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Что входит в уборку"
        title="Наводим порядок в каждой зоне квартиры"
        description="Показываем, что входит в стоимость, и что можно добавить по желанию."
      />

      <div className="mt-12 flex flex-col gap-14 md:gap-20">
        {roomChecklists.map((room) => (
          <RoomBlock key={room.id} room={room} />
        ))}
      </div>
    </Section>
  );
}
