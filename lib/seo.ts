import type { Metadata } from "next";
import { siteConfig } from "./site";

interface PageSeoInput {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  images?: string[];
  noIndex?: boolean;
}

/** Build Next.js Metadata with sensible OG/Twitter defaults. */
export function buildMetadata({
  title,
  description,
  keywords,
  path = "/",
  images,
  noIndex,
}: PageSeoInput): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const ogImages = images ?? ["/og/default.jpg"];

  return {
    // absolute: SEO titles are already complete, skip the "%s — floby" template
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title,
      description,
      images: ogImages.map((u) => ({ url: u, width: 1200, height: 630, alt: title })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
    },
  };
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  keywords: [
    "уборка квартир Ростов-на-Дону",
    "клининговая компания Ростов",
    "генеральная уборка Ростов",
    "мойка окон Ростов",
    "уборка после ремонта Ростов",
    "клининг Ростов-на-Дону",
  ],
  formatDetection: { telephone: true, address: true, email: true },
  icons: { icon: "/favicon.ico" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
  },
};
