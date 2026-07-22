import type { LucideIcon } from "lucide-react";

export type ServiceSlug =
  | "regular-cleaning"
  | "deep-cleaning"
  | "window-cleaning"
  | "post-renovation"
  | "air-conditioner-cleaning"
  | "furniture-cleaning";

export interface ServiceFeature {
  title: string;
  description: string;
}

export interface Service {
  slug: ServiceSlug;
  /** Icon name resolved from the icon registry (keeps content serializable). */
  icon: string;
  title: string;
  /** Short label for cards / nav. */
  shortTitle: string;
  tagline: string;
  /** One-liner used on cards. */
  excerpt: string;
  /** Longer hero/SEO intro. */
  description: string;
  priceFrom: number;
  unit: string;
  duration: string;
  popular?: boolean;
  benefits: ServiceFeature[];
  included: string[];
  excluded: string[];
  steps: { title: string; description: string }[];
  faq: FaqItem[];
  seo: SeoMeta;
}

export interface FaqItem {
  question: string;
  answer: string;
  category?: FaqCategory;
}

export type FaqCategory =
  | "order"
  | "payment"
  | "cleaning"
  | "guarantees"
  | "staff";

export interface Review {
  id: string;
  name: string;
  initials: string;
  city: string;
  rating: number;
  date: string;
  service: ServiceSlug | "other";
  serviceLabel: string;
  text: string;
  verified?: boolean;
}

export interface PriceTier {
  id: string;
  title: string;
  area: string;
  regular: number;
  deep: number;
  popular?: boolean;
}

export interface AddonPrice {
  title: string;
  price: number;
  unit: string;
}

export type CityStatus = "active" | "coming_soon";

export interface City {
  slug: string;
  name: string;
  namePrepositional: string; // "в Ростове-на-Дону"
  status: CityStatus;
  region?: string;
}

export interface SeoMeta {
  title: string;
  description: string;
  keywords: string[];
}

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
}
