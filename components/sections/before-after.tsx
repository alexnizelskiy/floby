"use client";

import * as React from "react";
import { MoveHorizontal } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { cn } from "@/lib/utils";

interface GalleryItem {
  id: string;
  before_url: string;
  after_url: string;
  title: string | null;
  cleaning_type: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  regular: "Поддерживающая уборка",
  general: "Генеральная уборка",
  post_renovation: "Уборка после ремонта",
};

/** Draggable before/after comparison. */
function Compare({ item }: { item: GalleryItem }) {
  const [pos, setPos] = React.useState(50);
  const ref = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  const moveTo = React.useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    moveTo(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) moveTo(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
    if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
  };

  const label = item.cleaning_type ? TYPE_LABEL[item.cleaning_type] : null;

  return (
    <figure className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-sm)]">
      <div
        ref={ref}
        className="relative aspect-[4/3] w-full cursor-ew-resize touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* After (bottom layer, fully visible) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.after_url}
          alt={`После — ${item.title ?? "уборка floby"}`}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        {/* Before (top layer, clipped from the right) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.before_url}
            alt={`До — ${item.title ?? "уборка floby"}`}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        </div>

        {/* Corner labels */}
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
          До
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
          После
        </span>

        {/* Divider + knob */}
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
          style={{ left: `${pos}%` }}
        >
          <button
            type="button"
            aria-label="Сравнить до и после"
            aria-valuenow={Math.round(pos)}
            aria-valuemin={0}
            aria-valuemax={100}
            role="slider"
            onKeyDown={onKeyDown}
            className="pointer-events-auto absolute top-1/2 left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-brand-600 shadow-[var(--shadow-md)] outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <MoveHorizontal className="size-5" />
          </button>
        </div>
      </div>

      {(item.title || label) && (
        <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-4">
          {item.title && <span className="font-semibold text-foreground">{item.title}</span>}
          {label && <span className="text-sm text-brand-700">{label}</span>}
        </figcaption>
      )}
    </figure>
  );
}

export function BeforeAfter() {
  const [items, setItems] = React.useState<GalleryItem[] | null>(null);

  React.useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => setItems(d.ok ? (d.items as GalleryItem[]) : []))
      .catch(() => setItems([]));
  }, []);

  // Nothing published yet — hide the section entirely.
  if (items === null || items.length === 0) return null;

  return (
    <Section id="before-after" className="scroll-mt-24">
      <SectionHeading
        eyebrow="До и после"
        title="Результат, который видно"
        description="Реальные квартиры наших клиентов в Ростове-на-Дону. Потяните ползунок, чтобы сравнить."
      />
      <div className={cn("mt-12 grid gap-6", "sm:grid-cols-2")}>
        {items.map((item) => (
          <Compare key={item.id} item={item} />
        ))}
      </div>
    </Section>
  );
}
