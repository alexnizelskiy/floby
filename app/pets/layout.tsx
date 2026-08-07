import Link from "next/link";
import { PetHeader } from "@/components/pets/pet-header";
import { siteConfig } from "@/lib/site";

export default function PetsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PetHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-background">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} floby Питомцы. Забота о питомцах в {siteConfig.geo.city}.</p>
          <div className="flex gap-5">
            <a href={siteConfig.contacts.phoneHref} className="hover:text-foreground">{siteConfig.contacts.phone}</a>
            <Link href="/privacy" className="hover:text-foreground">Политика конфиденциальности</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
