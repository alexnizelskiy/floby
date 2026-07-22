import * as React from "react";
import { cn } from "@/lib/utils";

type As = "section" | "div" | "footer" | "header" | "article";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: As;
  bleed?: boolean; // full-bleed background, inner content still constrained
}

/** Vertical rhythm wrapper for page sections. */
export function Section({
  as = "section",
  className,
  bleed,
  children,
  ...props
}: SectionProps) {
  const Comp = as as React.ElementType;
  return (
    <Comp className={cn("py-16 md:py-24", className)} {...props}>
      {bleed ? children : <div className="container-page">{children}</div>}
    </Comp>
  );
}

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container-page", className)} {...props} />;
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

/** Consistent eyebrow + title + description block. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "mx-auto max-w-2xl text-center items-center" : "max-w-2xl",
        className
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-bold leading-tight md:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
