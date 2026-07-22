import type { City } from "@/types";

export const cities: City[] = [
  {
    slug: "rostov-na-donu",
    name: "Ростов-на-Дону",
    namePrepositional: "в Ростове-на-Дону",
    status: "active",
    region: "Ростовская область",
  },
  { slug: "krasnodar", name: "Краснодар", namePrepositional: "в Краснодаре", status: "coming_soon", region: "Краснодарский край" },
  { slug: "sochi", name: "Сочи", namePrepositional: "в Сочи", status: "coming_soon", region: "Краснодарский край" },
  { slug: "voronezh", name: "Воронеж", namePrepositional: "в Воронеже", status: "coming_soon", region: "Воронежская область" },
  { slug: "volgograd", name: "Волгоград", namePrepositional: "в Волгограде", status: "coming_soon", region: "Волгоградская область" },
  { slug: "moscow", name: "Москва", namePrepositional: "в Москве", status: "coming_soon", region: "Москва" },
  { slug: "spb", name: "Санкт-Петербург", namePrepositional: "в Санкт-Петербурге", status: "coming_soon", region: "Санкт-Петербург" },
  { slug: "kazan", name: "Казань", namePrepositional: "в Казани", status: "coming_soon", region: "Республика Татарстан" },
  { slug: "nizhny-novgorod", name: "Нижний Новгород", namePrepositional: "в Нижнем Новгороде", status: "coming_soon", region: "Нижегородская область" },
  { slug: "samara", name: "Самара", namePrepositional: "в Самаре", status: "coming_soon", region: "Самарская область" },
  { slug: "ekaterinburg", name: "Екатеринбург", namePrepositional: "в Екатеринбурге", status: "coming_soon", region: "Свердловская область" },
];

export const activeCities = cities.filter((c) => c.status === "active");
export const comingSoonCities = cities.filter((c) => c.status === "coming_soon");

export function getCity(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}
