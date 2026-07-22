import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { services } from "@/content/services";
import { cities } from "@/content/cities";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticPaths = [
    "",
    "/prices",
    "/reviews",
    "/about",
    "/contacts",
    "/help",
    "/vacancies",
    "/work-with-us",
    "/cities",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));

  const serviceEntries: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const cityEntries: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${base}/cities/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: c.status === "active" ? 0.7 : 0.4,
  }));

  return [...staticEntries, ...serviceEntries, ...cityEntries];
}
