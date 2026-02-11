# Inspirio — Cursor Inspire Board

Веб-сайт-доска с карточками сайтов (скриншоты, видео). Админка для добавления сайтов. Стек: Next.js 14, Supabase, Tailwind, Framer Motion.

## Требования

- Node.js 18+
- Аккаунт Supabase

## Установка и запуск

1. **Установить зависимости**

   ```bash
   npm install
   ```

2. **Настроить Supabase**

   - В [Supabase Dashboard](https://app.supabase.com) создать проект (или использовать существующий).
   - В SQL Editor выполнить скрипты из папки `supabase/migrations/` по порядку:
     - `001_sites_table.sql` — таблица `sites`
     - `002_storage_bucket.sql` — bucket `sites-media` и политики
   - Скопировать `.env.example` в `.env.local` и заполнить:
     - `NEXT_PUBLIC_SUPABASE_URL` — URL проекта
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon-ключ
     - При необходимости `SUPABASE_SERVICE_ROLE_KEY` для серверных операций

3. **Запустить проект локально**

   ```bash
   npm run dev
   ```

   Откройте в браузере:

   - Главная: [http://localhost:3000](http://localhost:3000)
   - Админка: [http://localhost:3000/admin](http://localhost:3000/admin)

## Структура

- `app/` — страницы (App Router): главная, `/site/[id]`, `/admin`
- `components/` — карточки, карусель, форма админки
- `lib/` — Supabase client/server, загрузка данных, загрузка файлов в Storage
- `types/` — типы `Site`, `SiteCard`
- `supabase/migrations/` — SQL для таблицы и Storage

## Сборка для продакшена

```bash
npm run build
npm start
```

Деплой на Vercel: подключите репозиторий и задайте переменные окружения из `.env.local` (без секретного ключа в публичных переменных).
