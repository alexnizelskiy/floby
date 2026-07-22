import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-28 w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground shadow-[var(--shadow-sm)] transition-colors placeholder:text-muted-foreground focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
