# Cloudflare R2 + CDN для Inspire

Публичная раздача медиа идёт с **custom domain** поверх R2. Загрузка — presigned `PUT` из браузера (см. Vercel `api/upload-sign.js`).

## 1. Бакет R2

1. Cloudflare Dashboard → R2 → Create bucket (например `inspire-media`).
2. Settings → CORS policy — добавьте правило для origin админки и превью:

```json
[
  {
    "AllowedOrigins": ["https://YOUR-VERCEL-DOMAIN.vercel.app", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

Без CORS браузер заблокирует `PUT` на presigned URL.

## 2. Custom domain (CDN)

1. R2 → bucket → **Settings** → **Public access** (или custom domain, в зависимости от UI).
2. Подключите домен вида `cdn.example.com` к бакету (Cloudflare DNS на том же аккаунте проще всего).
3. Запишите полный origin **без** завершающего слэша — это значение `R2_PUBLIC_BASE_URL` на Vercel.

## 3. Cache Rules

В Cloudflare → Rules → Cache Rules:

- Если запрос к hostname `cdn.example.com`: кэшировать, Edge TTL / Browser TTL по необходимости (для immutable ключей — до 1 года, как в исходном плане).

## 4. Закрыть прямой S3 endpoint (опционально)

В WAF или отдельном правиле можно ограничить доступ к `https://<accountid>.r2.cloudflarestorage.com` только с ваших IP / сервисов. Публичный сайт должен использовать только **CDN hostname**.

## 5. Переменные Vercel

См. [ENV_UPLOAD.md](../../ENV_UPLOAD.md) в корне `Inspire` (или список ниже):

- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`
- `R2_PUBLIC_BASE_URL` — публичный URL бакета (custom domain)
- `UPLOAD_API_TOKEN` — общий секрет с `supabase-config.js` (`window.UPLOAD_API_TOKEN`)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — только на сервере Vercel

## 6. Worker для poster / вариантов изображений

Не обязателен для MVP: после загрузки в R2 в `media.url` уже записывается готовый публичный URL. Отдельный Worker (R2 ObjectCreated → WebP) можно добавить позже по исходному `cursor-prompt-plan.md` §6.
