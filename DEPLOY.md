# Деплой floby на Vercel + свой домен

Проект — Next.js 15 (App Router). Собирается: `npm run build`. Прод-БД — Postgres.

## 0. Что понадобится (ваши аккаунты)
- **Vercel** (новый аккаунт) — хостинг.
- **GitHub** (или Vercel CLI) — источник кода.
- **Neon** (или другой Postgres) — база данных. Бесплатного тарифа хватит на старт.
- **Домен** — уже куплен. Нужен доступ к его DNS у регистратора.
- Позже: **SMSC.ru** (SMS) и **ЮKassa** (оплата).

---

## 1. База данных — Neon Postgres
1. Зарегистрируйтесь на https://neon.tech → **Create project** (регион ближе к вам/Vercel).
2. Скопируйте **Connection string** (Pooled — с `-pooler` в хосте, для serverless).
   Формат: `postgres://user:pass@ep-...-pooler.region.aws.neon.tech/neondb?sslmode=require`
3. Это значение пойдёт в переменную `DATABASE_URL` на Vercel.
   Таблицы создаются автоматически при первом запросе (в коде `ensureSchema`).

## 2. Код в репозиторий
Вариант А — GitHub (рекомендую):
```bash
git add -A && git commit -m "floby: production-ready"
# создайте пустой репозиторий на github.com, затем:
git remote add origin https://github.com/<вы>/floby.git
git branch -M main && git push -u origin main
```
Вариант Б — без GitHub, через Vercel CLI: `npx vercel` (см. шаг 3).

## 3. Vercel
1. https://vercel.com → войдите/создайте аккаунт → **Add New → Project**.
2. Импортируйте репозиторий (или `npx vercel` из папки проекта). Framework определится как **Next.js** автоматически, ничего менять не нужно.
3. **Environment Variables** (Settings → Environment Variables), для Production:
   | Переменная | Значение |
   |---|---|
   | `DATABASE_URL` | строка подключения Neon (шаг 1) — **обязательно** |
   | `SMSC_LOGIN` | логин SMSC.ru *(без него SMS не отправляются)* |
   | `SMSC_PASSWORD` | пароль SMSC.ru |
   | `SMSC_SENDER` | имя отправителя (если согласовано) — опционально |
   | `YOOKASSA_SHOP_ID` | shopId ЮKassa *(без него оплата в тест-симуляции)* |
   | `YOOKASSA_SECRET_KEY` | секретный ключ ЮKassa |
4. **Deploy**. Получите адрес вида `floby-xxx.vercel.app` — проверьте, что работает.

## 4. Домен
1. Vercel → проект → **Settings → Domains → Add** → введите ваш домен (`example.ru` и `www.example.ru`).
2. Vercel покажет DNS-записи. У регистратора домена добавьте:
   - **A** запись `@` → IP от Vercel (обычно `76.76.21.21`), **или**
   - **CNAME** `www` → `cname.vercel-dns.com` (для www),
   - для корневого домена часто удобнее делегировать NS на Vercel — Vercel подскажет конкретно.
3. Дождитесь проверки (DNS обновляется до ~1 часа). SSL Vercel выпустит сам.

## 5. Оплата (ЮKassa) — включить боевой режим
1. Подключите ЮKassa (для самозанятых доступно), получите `shopId` + секретный ключ → добавьте в env (шаг 3).
2. В ЛК ЮKassa → HTTP-уведомления (webhook) укажите:
   `https://ВАШ_ДОМЕН/api/payments/webhook`  (события `payment.succeeded`).
3. Redeploy. Оплата картой пойдёт через защищённую страницу ЮKassa.

## Примечания
- Без `DATABASE_URL` в проде приложение осознанно падает с понятной ошибкой (serverless не хранит файлы, встроенный PGlite только для локальной разработки).
- Локальная разработка: `npm run dev` — БД встроенная (PGlite, папка `.pglite/`), SMS-код показывается на экране, оплата симулируется.
