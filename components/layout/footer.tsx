import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { footerNav } from "@/content/nav";
import { activeCities } from "@/content/cities";
import { siteConfig } from "@/lib/site";

export function Footer() {
  const { contacts, geo } = siteConfig;
  const cityPrep = activeCities[0]?.namePrepositional ?? `в ${geo.city}`;
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Локальная клининговая компания {cityPrep}. Качество, честность и
              персональный подход к каждому дому.
            </p>
            <div className="flex gap-2">
              <a
                href={contacts.telegram}
                aria-label="Telegram"
                className="grid size-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-brand-50 hover:text-primary"
              >
                <Send className="size-5" />
              </a>
              <a
                href={contacts.whatsapp}
                aria-label="WhatsApp"
                className="grid size-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-brand-50 hover:text-primary"
              >
                <MessageCircle className="size-5" />
              </a>
            </div>
          </div>

          {footerNav.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 rounded-2xl border border-border bg-background p-5 md:grid-cols-4 md:p-6">
          <a href={contacts.phoneHref} className="flex items-center gap-3">
            <Phone className="size-5 text-primary" />
            <span className="text-sm font-medium">{contacts.phone}</span>
          </a>
          <a href={contacts.emailHref} className="flex items-center gap-3">
            <Mail className="size-5 text-primary" />
            <span className="text-sm font-medium">{contacts.email}</span>
          </a>
          <div className="flex items-center gap-3">
            <MapPin className="size-5 text-primary" />
            <span className="text-sm font-medium">{geo.city}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="size-5 text-primary" />
            <span className="text-sm font-medium">{contacts.workingHours}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} floby. Клининговая компания в {geo.city}.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-foreground">
              Политика конфиденциальности
            </Link>
            <Link href="/help" className="hover:text-foreground">
              Помощь
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
