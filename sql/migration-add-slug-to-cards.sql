-- ============================================
-- МИГРАЦИЯ: Добавление slug в таблицу cards
-- ============================================
-- Выполните этот SQL в Supabase Dashboard → SQL Editor
-- ============================================
-- Эта миграция:
-- 1. Добавляет колонку slug в таблицу cards
-- 2. Генерирует slug из title для существующих записей
-- 3. Создает индекс для slug
-- ============================================

-- ШАГ 1: Добавление колонки slug
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- ШАГ 2: Функция для генерации slug из title
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
                '\s+', '-', 'g'
            ),
            '-+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- ШАГ 3: Генерация slug для существующих записей
UPDATE cards
SET slug = generate_slug(title)
WHERE slug IS NULL OR slug = '';

-- ШАГ 4: Создание уникального индекса для slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_cards_slug ON cards(slug);

-- ШАГ 5: Установка NOT NULL constraint (после заполнения всех записей)
ALTER TABLE cards 
ALTER COLUMN slug SET NOT NULL;

-- ШАГ 6: Триггер для автоматической генерации slug при вставке/обновлении
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.title);
    END IF;
    
    -- Убеждаемся, что slug уникален
    WHILE EXISTS (SELECT 1 FROM cards WHERE slug = NEW.slug AND id != NEW.id) LOOP
        NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON cards;
CREATE TRIGGER trigger_auto_generate_slug
BEFORE INSERT OR UPDATE ON cards
FOR EACH ROW
EXECUTE FUNCTION auto_generate_slug();

RAISE NOTICE 'Миграция завершена! Поле slug добавлено и заполнено для всех карточек.';

