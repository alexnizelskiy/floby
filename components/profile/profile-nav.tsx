"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { profileNav } from "@/content/profile";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function ProfileNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
      {profileNav.map((item) => {
        const Icon = getIcon(item.icon);
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-brand)]"
                : "text-foreground hover:bg-surface-strong"
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={logout}
        className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-strong"
      >
        <LogOut className="size-5" />
        Выйти
      </button>
    </nav>
  );
}
