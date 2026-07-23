import type { Metadata, Viewport } from "next";
import { Raleway, Belanosima } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ThemeScript } from "@/components/theme/theme-toggle";
import { JsonLd } from "@/components/seo/json-ld";
import { RefCapture } from "@/components/referral/ref-capture";
import { localBusinessJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { defaultMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

// Body text — Raleway (Google, with Cyrillic)
const raleway = Raleway({
  subsets: ["latin", "cyrillic"],
  variable: "--font-raleway",
  display: "swap",
});

// Headings & nav — Involve (self-hosted, Latin only; Cyrillic falls back to Raleway)
const involve = localFont({
  src: [
    { path: "./fonts/involve/Involve-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/involve/Involve-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/involve/Involve-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/involve/Involve-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-involve",
  display: "swap",
});

// Logo wordmark — Belanosima
const belanosima = Belanosima({
  subsets: ["latin"],
  variable: "--font-belanosima",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${raleway.variable} ${involve.variable} ${belanosima.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <JsonLd data={[localBusinessJsonLd(), websiteJsonLd()]} />
        <RefCapture />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
