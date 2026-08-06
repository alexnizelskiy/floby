import * as React from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/jsonld";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  /** Breadcrumb trail (excluding Home, which is prepended). */
  crumbs?: { label: string; href: string }[];
  children?: React.ReactNode;
}

/** Consistent top block for standalone pages. */
export function PageHeader({ eyebrow, title, description, crumbs = [], children }: PageHeaderProps) {
  const trail = [{ label: "Главная", href: "/" }, ...crumbs];
  return (
    <header className="border-b border-border bg-background">
      <div className="container-page py-10 md:py-14">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>

      {crumbs.length > 0 && (
        <JsonLd data={breadcrumbJsonLd(trail)} />
      )}
    </header>
  );
}
