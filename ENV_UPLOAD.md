# Переменные окружения: R2 + Vercel API

## Локально (`vercel dev`)

В корне `Inspire` создайте `.env.local` (не коммитьте) или задайте переменные в shell:

| Переменная | Описание |
|------------|----------|
| `R2_ACCOUNT_ID` | ID аккаунта Cloudflare |
| `R2_ACCESS_KEY_ID` | R2 API token key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET` | Имя бакета |
| `R2_PUBLIC_BASE_URL` | Например `https://cdn.example.com` (без `/` в конце) |
| `R2_ENDPOINT` | Опционально; по умолчанию `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` |
| `UPLOAD_API_TOKEN` | Длинная случайная строка; та же должна быть в `supabase-config.js` → `window.UPLOAD_API_TOKEN` |
| `SUPABASE_URL` | URL проекта Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (только сервер) |

Команда: `npm run dev:vercel` из папки `Inspire`.

## Продакшен (Vercel Dashboard)

Добавьте те же переменные в **Project → Settings → Environment Variables** для Production (и Preview при необходимости).

## Клиент (`supabase-config.js`)

Заполните:

- `window.UPLOAD_API_TOKEN` — совпадает с `UPLOAD_API_TOKEN` на Vercеле.
- `window.UPLOAD_API_BASE` — пусто для same-origin; или полный URL деплоя, если админка открыта с другого origin.
- `window.R2_PUBLIC_BASE_URL` — тот же CDN origin, что и на сервере (для `lib/media-url.js` на публичных страницах).
- `window.MEDIA_SOURCE` — `dual` \| `supabase` \| `r2` (см. план rollout).

Пока `UPLOAD_API_TOKEN` пуст, админка продолжает использовать **Supabase Storage** (`Medias`).
