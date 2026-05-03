-- ============================================
-- МИГРАЦИЯ: Мульти-выбор доменов для карточек
-- ============================================
-- Выполните этот SQL в Supabase Dashboard → SQL Editor
-- ============================================
-- Эта миграция:
-- 1. Удаляет колонку domain_id из таблицы cards
-- 2. Использует существующую таблицу card_categories для связи карточек с доменами
-- 3. Мигрирует существующие данные из domain_id в card_categories
-- ============================================

DO $$ 
DECLARE
    card_record RECORD;
BEGIN
    -- ШАГ 1: Миграция существующих данных из domain_id в card_categories
    -- Если у карточки есть domain_id, создаем связь в card_categories
    FOR card_record IN 
        SELECT id, domain_id 
        FROM cards 
        WHERE domain_id IS NOT NULL
    LOOP
        -- Проверяем, нет ли уже такой связи
        IF NOT EXISTS (
            SELECT 1 
            FROM card_categories 
            WHERE card_id = card_record.id 
            AND category_id = card_record.domain_id
        ) THEN
            -- Создаем связь
            INSERT INTO card_categories (card_id, category_id)
            VALUES (card_record.id, card_record.domain_id)
            ON CONFLICT (card_id, category_id) DO NOTHING;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Данные из domain_id мигрированы в card_categories';
END $$;

-- ШАГ 2: Удаление индекса для domain_id
DROP INDEX IF EXISTS idx_cards_domain;

-- ШАГ 3: Удаление колонки domain_id из таблицы cards
ALTER TABLE cards DROP COLUMN IF EXISTS domain_id;

RAISE NOTICE 'Миграция завершена успешно! Теперь домены хранятся через таблицу card_categories.';

