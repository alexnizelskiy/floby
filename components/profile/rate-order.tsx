"use client";

import * as React from "react";
import { Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function RateOrder({ bookingId, onDone }: { bookingId: string; onDone?: () => void }) {
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [text, setText] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function submit() {
    if (!rating) return;
    setBusy(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, rating, text }),
      });
      setSent(true);
      onDone?.();
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
        <Check className="size-4" /> Спасибо за оценку!
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Оценить уборку
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} звёзд`}
          >
            <Star
              className={cn(
                "size-8 transition-colors",
                (hover || rating) >= n ? "fill-warning text-warning" : "text-border"
              )}
            />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Расскажите, как прошла уборка (необязательно)"
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={!rating || busy}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          Отправить отзыв
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface"
        >
          Позже
        </button>
      </div>
    </div>
  );
}
