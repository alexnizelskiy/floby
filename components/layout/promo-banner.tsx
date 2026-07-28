"use client";

import * as React from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";

export const WELCOME_PROMO = { code: "CLEAN15", percent: 15 };
const DISMISS_KEY = "floby-promo-dismissed";

export function PromoBanner() {
  const [hidden, setHidden] = React.useState(true);

  React.useEffect(() => {
    setHidden(localStorage.getItem(DISMISS_KEY) === WELCOME_PROMO.code);
  }, []);

  if (hidden) return null;

  return (
    <div className="relative bg-brand-500 text-white">
      <Link
        href="/booking"
        className="container-page flex items-center justify-center gap-2 py-2.5 text-center text-sm font-medium hover:underline"
      >
        <Sparkles className="size-4 shrink-0" />
        <span>
          −{WELCOME_PROMO.percent}% на первую уборку по промокоду{" "}
          <span className="font-bold tracking-wide">{WELCOME_PROMO.code}</span>
        </span>
      </Link>
      <button
        type="button"
        aria-label="Скрыть"
        onClick={() => { localStorage.setItem(DISMISS_KEY, WELCOME_PROMO.code); setHidden(true); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
