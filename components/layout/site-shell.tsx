import { PromoBanner } from "@/components/layout/promo-banner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PhoneRequiredModal } from "@/components/auth/phone-required-modal";

/** Site chrome: promo banner, header, page content, footer. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PromoBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <PhoneRequiredModal />
    </>
  );
}
