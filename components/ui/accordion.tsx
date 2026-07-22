"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItemData {
  question: string;
  answer: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItemData[];
  className?: string;
  /** Index open by default; null = all closed. */
  defaultOpen?: number | null;
}

export function Accordion({ items, className, defaultOpen = null }: AccordionProps) {
  const [open, setOpen] = React.useState<number | null>(defaultOpen);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={cn(
              "overflow-hidden rounded-2xl border transition-colors",
              isOpen ? "border-brand-300 bg-surface" : "border-border bg-card"
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left md:px-6"
            >
              <span className="text-base font-semibold md:text-lg">
                {item.question}
              </span>
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-300",
                  isOpen
                    ? "rotate-45 border-brand-400 bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                )}
              >
                <Plus className="size-4" />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="px-5 pb-5 text-muted-foreground md:px-6 md:pb-6">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
