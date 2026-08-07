"use client";

import { usePathname } from "next/navigation";
import { PromoBanner } from "@/components/layout/promo-banner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/**
 * Chooses the site chrome. The pets subdomain (rewritten to /pets/*) has its
 * own header/footer via app/pets/layout, so here we skip the cleaning chrome.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/pets")) return <>{children}</>;

  return (
    <>
      <PromoBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
