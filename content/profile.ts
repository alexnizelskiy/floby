/** Демо-данные личного кабинета (без реальной авторизации). */

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export const profileNav: NavItem[] = [
  { label: "Мои уборки", href: "/profile", icon: "sparkles" },
  { label: "Бонусы", href: "/profile/bonuses", icon: "star" },
  { label: "Оплата", href: "/profile/payment", icon: "card" },
  { label: "Настройки профиля", href: "/profile/settings", icon: "users" },
];

const executorNav: NavItem[] = [
  { label: "Кабинет клинера", href: "/profile", icon: "schedule" },
  { label: "Настройки профиля", href: "/profile/settings", icon: "users" },
];

const staffNav: NavItem[] = [
  { label: "Панель управления", href: "/admin", icon: "dashboard" },
  { label: "Настройки профиля", href: "/profile/settings", icon: "users" },
];

/** Sidebar / dropdown items depend on the user's role. */
export function navForRole(role?: string | null): NavItem[] {
  if (role === "executor") return executorNav;
  if (role === "admin" || role === "manager") return staffNav;
  return profileNav;
}

export const demoUser = {
  name: "Гость",
  phone: "+7 (988) 893-72-88",
  bonusBalance: 0,
  referralLink: "https://floby.ru/w/1h2fg",
  referralReward: 500,
};

export const referralSteps: { icon: string; title: string; description: string }[] = [
  {
    icon: "card",
    title: "Поделитесь ссылкой",
    description: "Отправьте персональную ссылку друзьям в мессенджере или соцсетях.",
  },
  {
    icon: "sparkles",
    title: "Друг заказывает уборку",
    description: "Друг получает 500 ₽ на первый заказ поддерживающей уборки.",
  },
  {
    icon: "star",
    title: "Вы получаете бонусы",
    description: "После уборки друга вам начисляется 500 ₽ на бонусный счёт.",
  },
];

export const savedCards: { id: string; brand: string; last4: string }[] = [];

export const scheduledCleanings: {
  id: string;
  service: string;
  date: string;
  address: string;
  status: string;
}[] = [];
