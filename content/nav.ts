import { services } from "./services";

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

/** Услуги для мега-меню (из data-driven контента). */
export const serviceNavLinks: NavLink[] = services.map((s) => ({
  label: s.shortTitle,
  href: `/services/${s.slug}`,
  description: s.excerpt,
}));

/** Верхняя навигация шапки (как в Figma). */
export const topNav: NavLink[] = [
  { label: "Уборка", href: "/#services" },
  { label: "Химчистка", href: "/services/furniture-cleaning" },
];

/** Строка услуг под шапкой (табы с разделителями, как в Figma). */
export const serviceTabs: (NavLink & { bold?: boolean })[] = [
  { label: "Поддерживающая", href: "/services/regular-cleaning" },
  { label: "Окна", href: "/services/window-cleaning" },
  { label: "Генеральная", href: "/services/deep-cleaning" },
  { label: "После ремонта", href: "/services/post-renovation" },
  { label: "Кондиционеры", href: "/services/air-conditioner-cleaning" },
  { label: "Премиум", href: "/prices", bold: true },
];

/** Основная навигация в шапке. */
export const primaryNav: NavLink[] = [
  { label: "Услуги", href: "/#services" },
  { label: "Цены", href: "/prices" },
  { label: "Отзывы", href: "/reviews" },
  { label: "О компании", href: "/about" },
  { label: "Контакты", href: "/contacts" },
];

/** Доп. ссылки (в мобильном меню и футере). */
export const secondaryNav: NavLink[] = [
  { label: "Города", href: "/cities" },
  { label: "Вакансии", href: "/vacancies" },
  { label: "Работа в floby", href: "/work-with-us" },
  { label: "Помощь", href: "/help" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Услуги",
    links: serviceNavLinks,
  },
  {
    title: "Компания",
    links: [
      { label: "О нас", href: "/about" },
      { label: "Отзывы", href: "/reviews" },
      { label: "Цены", href: "/prices" },
      { label: "Города", href: "/cities" },
      { label: "Контакты", href: "/contacts" },
    ],
  },
  {
    title: "Сотрудникам",
    links: [
      { label: "Вакансии", href: "/vacancies" },
      { label: "Работа в floby", href: "/work-with-us" },
      { label: "Помощь", href: "/help" },
    ],
  },
];
