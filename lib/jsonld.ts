import { siteConfig } from "./site";
import type { FaqItem, Service } from "@/types";

/** LocalBusiness schema for the organization. */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CleaningService",
    "@id": `${siteConfig.url}#business`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.contacts.phone,
    email: siteConfig.contacts.email,
    priceRange: "₽₽",
    image: `${siteConfig.url}/og/default.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.geo.city,
      addressRegion: siteConfig.geo.region,
      postalCode: siteConfig.geo.postalCode,
      streetAddress: siteConfig.geo.street,
      addressCountry: siteConfig.geo.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    areaServed: { "@type": "City", name: siteConfig.geo.city },
    openingHours: "Mo-Su 08:00-22:00",
    sameAs: [siteConfig.social.vk].filter(Boolean),
  };
}

/** Service schema for a service page. */
export function serviceJsonLd(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    serviceType: service.title,
    description: service.description,
    url: `${siteConfig.url}/services/${service.slug}`,
    provider: { "@type": "CleaningService", name: siteConfig.name, "@id": `${siteConfig.url}#business` },
    areaServed: { "@type": "City", name: siteConfig.geo.city },
    offers: {
      "@type": "Offer",
      price: service.priceFrom,
      priceCurrency: "RUB",
      availability: "https://schema.org/InStock",
    },
  };
}

/** FAQPage schema. */
export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** BreadcrumbList schema from label/href pairs. */
export function breadcrumbJsonLd(crumbs: { label: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: new URL(c.href, siteConfig.url).toString(),
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "ru-RU",
  };
}

/** Renderable <script> props for a JSON-LD object. */
export function jsonLdScript(data: object) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  } as const;
}
