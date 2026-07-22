"use client";

import * as React from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** «?» icon with a dark popover explanation. Click to toggle; outside click closes. */
export function Hint({ text, className }: { text: string; className?: string }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label="Подробнее"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full transition-colors",
          open ? "bg-ink-950 text-white" : "bg-muted text-muted-foreground hover:bg-surface-strong"
        )}
      >
        <HelpCircle className="size-4" />
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute right-0 top-full z-30 mt-2 w-64 rounded-2xl bg-ink-950 px-4 py-3 text-sm leading-snug text-white shadow-[var(--shadow-lg)]"
        >
          <span className="absolute -top-1.5 right-1.5 size-3 rotate-45 rounded-[2px] bg-ink-950" />
          {text}
        </span>
      )}
    </span>
  );
}
