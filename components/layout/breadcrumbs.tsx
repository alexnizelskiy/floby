import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/jsonld";

export interface Crumb {
  label: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: "Главная", href: "/" }, ...items];
  return (
    <nav aria-label="Хлебные крошки" className="container-page pt-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-1.5">
              {last ? (
                <span className="font-medium text-foreground">{c.label}</span>
              ) : (
                <Link href={c.href} className="transition-colors hover:text-primary">
                  {c.label}
                </Link>
              )}
              {!last && <ChevronRight className="size-3.5" />}
            </li>
          );
        })}
      </ol>
      <JsonLd data={breadcrumbJsonLd(all)} />
    </nav>
  );
}
