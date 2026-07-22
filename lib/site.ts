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
  themeColor: "#1eae54",

  // — Контакты (заглушки, заменить на реальные) —
  contacts: {
    phone: "+7 900 000-00-00",
    phoneHref: "tel:+79000000000",
    email: "hello@floby.ru",
    emailHref: "mailto:hello@floby.ru",
    telegram: "https://t.me/floby",
    telegramLabel: "@floby",
    whatsapp: "https://wa.me/79000000000",
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

  // — Юридическое (заглушки) —
  legal: {
    inn: "0000000000",
    ogrnip: "000000000000000",
    selfEmployed: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
