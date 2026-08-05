/**
 * Central site configuration — brand, contacts, geo, socials.
 * PLACEHOLDER contact data: replace with real values before launch.
 */

export const siteConfig = {
  name: "floby",
  legalName: "floby — клининговая компания",
  tagline: "Клининговая компания в Ростове-на-Дону",
  description:
    "floby — уборка квартир, домов и офисов в Ростове-на-Дону. Проверенные специалисты, фиксированная цена, гарантия качества и безопасные средства.",
  url: "https://floby.ru",
  locale: "ru_RU",
  themeColor: "#23b059",

  // — Контакты —
  contacts: {
    phone: "+7 988 893-72-88",
    phoneHref: "tel:+79888937288",
    email: "madnatec1@yandex.ru",
    emailHref: "mailto:madnatec1@yandex.ru",
    telegram: "https://t.me/floby",
    telegramLabel: "@floby",
    whatsapp: "https://wa.me/79888937288",
    whatsappLabel: "WhatsApp",
    workingHours: "Ежедневно с 8:00 до 22:00",
  },

  // — География (основной город) —
  geo: {
    city: "Ростов-на-Дону",
    region: "Ростовская область",
    country: "RU",
    postalCode: "344000",
    street: "пр. Будённовский, 1",
    latitude: 47.2224,
    longitude: 39.7189,
  },

  // — Соцсети / карты —
  social: {
    vk: "https://vk.com/floby",
    instagram: "",
    yandexMaps: "https://yandex.ru/maps/39/rostov-na-donu/",
  },

  // — Юридическое (самозанятый / НПД) —
  legal: {
    sellerName: "Низельский Александр Александрович",
    sellerShort: "Самозанятый Низельский А.А., бренд floby",
    inn: "616615626580",
    taxRegime: "Налог на профессиональный доход (самозанятый)",
    selfEmployed: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
