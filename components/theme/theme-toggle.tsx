"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/** Toggles the `dark` class on <html> and persists to localStorage. */
export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = React.useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("floby-theme", next ? "dark" : "light");
    } catch {}
    setIsDark(next);
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Светлая тема" : "Тёмная тема"}
      className={cn(
        "grid size-10 place-items-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-surface",
        className
      )}
    >
      <Sun className="size-5 dark:hidden" />
      <Moon className="hidden size-5 dark:block" />
    </button>
  );
}

/**
 * Inline script that applies a saved dark theme before paint (no FOUC).
 * Light by default (matches Figma) — dark only if explicitly stored.
 */
export function ThemeScript() {
  const code = `(function(){try{if(localStorage.getItem('floby-theme')==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
