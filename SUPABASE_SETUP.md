# Инструкция по настройке Supabase

## Шаг 1: Создание проекта в Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Запомните URL проекта и API ключи

## Шаг 2: Настройка конфигурации

Откройте файл `supabase-config.js` и замените:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co'; // Ваш URL проекта
const SUPABASE_ANON_KEY = 'your-anon-key'; // Ваш anon key
```

**Где найти ключи:**
- Supabase Dashboard → Settings → API
- Project URL → скопируйте в `SUPABASE_URL`
- anon/public key → скопируйте в `SUPABASE_ANON_KEY`

## Шаг 3: Создание таблиц в базе данных

1. Откройте Supabase Dashboard → SQL Editor
2. Скопируйте содержимое файла `sql/supabase-setup.sql`
3. Вставьте в SQL Editor и нажмите "Run"

Это создаст все необходимые таблицы:
- `authors` - авторы проектов
- `categories` - категории проектов
- `cards` - карточки проектов
- `card_categories` - связь карточек и категорий

## Шаг 4: Настройка Storage для картинок

### Создание bucket для картинок проектов:

1. Перейдите в Storage → Create bucket
2. Название: `card-images`
3. Public bucket: **Включить** ✅
4. File size limit: 5MB (или больше по необходимости)
5. Allowed MIME types: `image/*`

### Создание bucket для аватаров авторов:

1. Storage → Create bucket
2. Название: `author-avatars`
3. Public bucket: **Включить** ✅
4. File size limit: 2MB
5. Allowed MIME types: `image/*`

### Настройка прав доступа (Policies):

Для каждого bucket:

1. Откройте bucket → Policies
2. Создайте новую политику:

**Для чтения (чтение всем):**
- Policy name: `Public read access`
- Allowed operation: `SELECT`
- Policy definition: `true`

**Для записи (для админ-панели):**
- Policy name: `Public insert access`
- Allowed operation: `INSERT`
- Policy definition: `true`

> ⚠️ **Внимание:** Для продакшена рекомендуется настроить аутентификацию и ограничить права записи.

## Шаг 5: Добавление тестовых данных (опционально)

### Добавление категорий:

В SQL Editor выполните:

```sql
INSERT INTO categories (name, slug) VALUES
    ('E-Commerce', 'e-commerce'),
    ('Agency', 'agency'),
    ('SaaS', 'saas'),
    ('Retail', 'retail'),
    ('Healthcare', 'healthcare'),
    ('Education', 'education')
ON CONFLICT (slug) DO NOTHING;
```

### Добавление авторов:

```sql
INSERT INTO authors (name, slug, bio) VALUES
    ('AVA Digital', 'ava-digital', 'Digital design agency'),
    ('Studio Design', 'studio-design', 'Creative design studio')
ON CONFLICT (slug) DO NOTHING;
```

## Шаг 6: Проверка подключения

1. Откройте `index.html` в браузере
2. Откройте консоль разработчика (F12)
3. Проверьте, нет ли ошибок подключения

Если видите ошибки:
- Проверьте правильность URL и ключей в `supabase-config.js`
- Убедитесь, что таблицы созданы
- Проверьте права доступа (RLS policies)

## Шаг 7: Использование админ-панели

1. Откройте `admin-author.html` для создания авторов
2. Откройте `admin.html` для загрузки карточек проектов

## Структура базы данных

```
authors (авторы)
  ├── id (UUID)
  ├── name (TEXT)
  ├── slug (TEXT, UNIQUE)
  ├── avatar_url (TEXT)
  ├── bio (TEXT)
  └── website (TEXT)

categories (категории)
  ├── id (UUID)
  ├── name (TEXT, UNIQUE)
  └── slug (TEXT, UNIQUE)

cards (карточки)
  ├── id (UUID)
  ├── title (TEXT)
  ├── description (TEXT)
  ├── image_url (TEXT)
  ├── image_name (TEXT)
  └── author_id (UUID → authors.id)

card_categories (связь)
  ├── card_id (UUID → cards.id)
  └── category_id (UUID → categories.id)
```

## Troubleshooting

### Ошибка: "relation does not exist"
- Убедитесь, что выполнили SQL скрипт из `sql/supabase-setup.sql`

### Ошибка: "new row violates row-level security policy"
- Проверьте настройки RLS policies в Supabase
- Для тестирования можно временно отключить RLS или разрешить всем запись

### Ошибка загрузки картинок
- Проверьте, что bucket созданы и публичные
- Проверьте права доступа (policies) для Storage

### Карточки не отображаются
- Проверьте консоль браузера на ошибки
- Убедитесь, что данные есть в таблице `cards`
- Проверьте связи с авторами и категориями

## Дополнительные ресурсы

- [Документация Supabase](https://supabase.com/docs)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

