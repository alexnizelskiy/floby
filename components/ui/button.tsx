import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Minimal Slot: render the single child element, merging className + props. */
const Slot = React.forwardRef<HTMLElement, { children: React.ReactNode } & Record<string, unknown>>(
  ({ children, ...props }, ref) => {
    if (!React.isValidElement(children)) return null;
    const child = children as React.ReactElement<Record<string, unknown>>;
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      ref,
      className: cn(props.className as string, child.props.className as string),
    });
  }
);
Slot.displayName = "Slot";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[var(--shadow-brand)] hover:bg-primary-hover hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-brand-100",
        outline:
          "border border-border bg-background text-foreground hover:bg-surface hover:border-brand-300",
        ghost: "text-foreground hover:bg-surface",
        white:
          "bg-white text-ink-900 shadow-[var(--shadow-md)] hover:bg-white/90 hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline rounded-none px-0",
      },
      size: {
        sm: "h-9 px-4 text-sm [&_svg]:size-4",
        md: "h-11 px-5 text-sm [&_svg]:size-4",
        lg: "h-13 px-7 text-base [&_svg]:size-5",
        xl: "h-14 px-8 text-base md:text-lg [&_svg]:size-5",
        icon: "size-11 [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
