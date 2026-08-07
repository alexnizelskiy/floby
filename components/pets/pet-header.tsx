"use client";

import Link from "next/link";
import { PawPrint, MapPin, User } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { siteConfig } from "@/lib/site";

const nav = [
  { label: "Выгул", href: "/#tariffs" },
  { label: "Няня", href: "/#tariffs" },
  { label: "Передержка", href: "/#tariffs" },
  { label: "Как это работает", href: "/#how" },
];

export function PetHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background font-display">
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <Link href="/" aria-label="floby Питомцы — на главную" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-500 text-white">
            <PawPrint className="size-5" />
          </span>
          <span className="text-xl font-bold">
            <span className="text-brand-500">floby</span>
            <span className="text-muted-foreground"> · Питомцы</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((l) => (
            <Link key={l.label} href={l.href} className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-1.5 text-base font-medium text-foreground md:flex">
            <MapPin className="size-4 text-muted-foreground" />
            {siteConfig.geo.city}
          </span>
          {user ? (
            <Link href="/profile" className="flex items-center gap-2 rounded-full border border-border py-1.5 pl-1.5 pr-3.5 hover:bg-surface">
              <span className="grid size-8 place-items-center overflow-hidden rounded-full bg-brand-100 text-brand-700">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt="" className="size-full object-cover" />
                ) : (
                  <User className="size-4" />
                )}
              </span>
              <span className="max-w-[120px] truncate text-sm font-medium">{user.name || "Профиль"}</span>
            </Link>
          ) : (
            <Link
              href="/order"
              className="inline-flex items-center rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Заказать выгул
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
