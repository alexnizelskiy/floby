"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, MapPin, X, ChevronRight, User, ChevronDown, LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { topNav, serviceTabs, secondaryNav } from "@/content/nav";
import { navForRole } from "@/content/profile";
import { getIcon } from "@/lib/icons";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useAuth, type AuthUser } from "@/components/auth/auth-provider";

function useActive() {
  const pathname = usePathname();
  return React.useCallback(
    (href: string) => {
      const path = href.split("#")[0];
      if (path === "/" || path === "") return pathname === "/";
      return pathname === path || pathname.startsWith(path + "/");
    },
    [pathname]
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isActive = useActive();
  const pathname = usePathname();
  const homeActive = pathname === "/";
  const { user } = useAuth();

  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-background font-display">
      {/* ── Top row ── */}
      <div className="border-b border-border/60">
        <div className="container-page flex h-[72px] items-center justify-between gap-4 md:h-[88px]">
          {/* Left: burger (mobile) + main nav (desktop) */}
          <div className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Открыть меню"
              className="grid size-10 place-items-center rounded-full text-foreground lg:hidden"
            >
              <Menu className="size-6" />
            </button>
            <nav className="hidden items-center gap-10 lg:flex">
              {topNav.map((link) => {
                // "Уборка" stays active on home and on any service-tab (sub-menu) page
                const active =
                  link.label === "Уборка"
                    ? homeActive || serviceTabs.some((t) => isActive(t.href))
                    : isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-base font-medium transition-colors",
                      active ? "text-brand-500" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center: logo */}
          <Link href="/" aria-label="floby — на главную" className="shrink-0">
            <Logo />
          </Link>

          {/* Right: city + login */}
          <div className="flex flex-1 items-center justify-end gap-4 md:gap-6">
            <Link
              href="/cities"
              className="hidden items-center gap-1.5 text-base font-medium text-foreground transition-colors hover:text-brand-500 md:flex"
            >
              <MapPin className="size-4 text-muted-foreground" />
              {siteConfig.geo.city}
            </Link>
            {user ? (
              <ProfileMenu user={user} />
            ) : (
              <Link
                href="/profile"
                className="hidden items-center justify-center rounded-full border border-ink-950 px-6 py-2.5 text-base font-medium text-ink-950 transition-colors hover:bg-ink-950 hover:text-white lg:inline-flex"
              >
                Войти
              </Link>
            )}
            <Link
              href="/profile"
              aria-label="Личный кабинет"
              className="grid size-10 place-items-center overflow-hidden rounded-full border border-border text-foreground lg:hidden"
            >
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt="" className="size-full object-cover" />
              ) : (
                <User className="size-5" />
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Service tabs row ── */}
      <div className="shadow-[0px_2px_6px_0px_rgba(9,8,37,0.08)]">
        <div className="container-page">
          <nav className="flex items-center gap-6 overflow-x-auto py-3.5 md:gap-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {serviceTabs.map((tab) => {
              const active =
                isActive(tab.href) ||
                (homeActive && tab.href === "/services/regular-cleaning");
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "shrink-0 whitespace-nowrap text-sm transition-colors",
                    tab.bold ? "font-bold" : "font-medium",
                    active
                      ? "text-brand-accent"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} isActive={isActive} user={user} />
    </header>
  );
}

/** Avatar + dropdown shown in the header when the user is logged in (desktop). */
function ProfileMenu({ user }: { user: AuthUser }) {
  const [open, setOpen] = React.useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  async function onLogout() {
    setOpen(false);
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full border border-border py-1.5 pl-1.5 pr-3.5 transition-colors hover:bg-surface"
      >
        <span className="grid size-9 place-items-center overflow-hidden rounded-full bg-brand-100 text-brand-700">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt="" className="size-full object-cover" />
          ) : (
            <User className="size-5" />
          )}
        </span>
        <span className="max-w-[120px] truncate text-base font-medium text-foreground">
          {user.name || "Профиль"}
        </span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+8px)] w-60 overflow-hidden rounded-2xl border border-border bg-background p-1.5 shadow-[var(--shadow-lg)]"
          >
            {navForRole(user.role).map((item) => {
              const Icon = getIcon(item.icon);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                >
                  <Icon className="size-5 text-muted-foreground" />
                  {item.label}
                </Link>
              );
            })}
            <div className="my-1 h-px bg-border" />
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-surface"
            >
              <LogOut className="size-5" />
              Выйти
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileMenu({
  open,
  onClose,
  isActive,
  user,
}: {
  open: boolean;
  onClose: () => void;
  isActive: (href: string) => boolean;
  user: AuthUser | null;
}) {
  const { logout } = useAuth();
  const router = useRouter();
  async function onLogout() {
    onClose();
    await logout();
    router.push("/");
    router.refresh();
  }
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] lg:hidden"
        >
          <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-background shadow-[var(--shadow-lg)]"
          >
            <div className="flex h-[72px] items-center justify-between border-b border-border px-5">
              <Logo />
              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть меню"
                className="grid size-10 place-items-center rounded-full border border-border"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              <div className="flex flex-col">
                {topNav.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="rounded-xl px-3 py-3 text-lg font-semibold hover:bg-surface"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="my-4 h-px bg-border" />
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Услуги
              </p>
              <div className="mt-2 flex flex-col">
                {serviceTabs.map((tab) => (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-3 text-base hover:bg-surface",
                      isActive(tab.href) ? "text-brand-accent font-semibold" : "font-medium"
                    )}
                  >
                    {tab.label}
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>

              <div className="my-4 h-px bg-border" />
              <div className="flex flex-col">
                {secondaryNav.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="rounded-xl px-3 py-3 text-base font-medium hover:bg-surface"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-border p-5">
              <Link
                href="/cities"
                onClick={onClose}
                className="mb-3 flex items-center gap-2 px-3 text-sm font-medium text-muted-foreground"
              >
                <MapPin className="size-4" /> {siteConfig.geo.city}
              </Link>
              {user ? (
                <div className="flex flex-col gap-1">
                  <div className="mb-1 flex items-center gap-3 px-3">
                    <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-100 text-brand-700">
                      {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatar} alt="" className="size-full object-cover" />
                      ) : (
                        <User className="size-5" />
                      )}
                    </span>
                    <span className="truncate font-semibold">{user.name || "Профиль"}</span>
                  </div>
                  {navForRole(user.role).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="rounded-xl px-3 py-2.5 text-base font-medium hover:bg-surface"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-base font-medium text-muted-foreground hover:bg-surface"
                  >
                    <LogOut className="size-5" /> Выйти
                  </button>
                </div>
              ) : (
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="flex items-center justify-center rounded-full border border-ink-950 px-6 py-3 text-base font-medium text-ink-950"
                >
                  Войти
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
