import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground shadow-[var(--shadow-sm)] transition-colors placeholder:text-muted-foreground focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
