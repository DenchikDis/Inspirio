-- ============================================
-- НАСТРОЙКА БАЗЫ ДАННЫХ SUPABASE
-- ============================================
-- Скопируйте и выполните этот SQL в Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- 1. ТАБЛИЦА АВТОРОВ
-- ============================================
CREATE TABLE IF NOT EXISTS authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);

-- ============================================
-- 2. ТАБЛИЦА КАТЕГОРИЙ
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Примечание: Домены хранятся в таблице categories
-- ============================================

-- ============================================
-- 3. ТАБЛИЦА КАРТОЧЕК
-- ============================================
CREATE TABLE IF NOT EXISTS cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT NOT NULL,
  image_name TEXT NOT NULL,
  thumbnail_url TEXT,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  -- domain_id удален - домены теперь хранятся через card_categories (мульти-выбор)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cards_author ON cards(author_id);
CREATE INDEX IF NOT EXISTS idx_cards_slug ON cards(slug);
-- idx_cards_domain удален, так как domain_id больше не используется
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at DESC);

-- ============================================
-- 4. ТАБЛИЦА СВЯЗИ КАРТОЧЕК И КАТЕГОРИЙ
-- ============================================
CREATE TABLE IF NOT EXISTS card_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(card_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_card_categories_card ON card_categories(card_id);
CREATE INDEX IF NOT EXISTS idx_card_categories_category ON card_categories(category_id);

-- ============================================
-- 5. ТАБЛИЦА ИЗОБРАЖЕНИЙ ПРОЕКТА
-- ============================================
CREATE TABLE IF NOT EXISTS project_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_images_card ON project_images(card_id);
CREATE INDEX IF NOT EXISTS idx_project_images_order ON project_images(card_id, display_order);

-- ============================================
-- 6. ТРИГГЕР ДЛЯ ОБНОВЛЕНИЯ updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_authors_updated_at ON authors;
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. НАСТРОЙКА ПРАВ ДОСТУПА (RLS Policies)
-- ============================================
-- Включите Row Level Security для всех таблиц
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

-- Политики для чтения (все могут читать)
CREATE POLICY "Anyone can read authors" ON authors
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read cards" ON cards
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read card_categories" ON card_categories
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read project_images" ON project_images
    FOR SELECT USING (true);

-- Политики для записи (только авторизованные пользователи)
-- ВАЖНО: Для работы админ-панели вам нужно либо:
-- 1. Отключить RLS для записи (не рекомендуется для продакшена)
-- 2. Настроить аутентификацию в Supabase
-- 3. Использовать service_role key для админ-панели

-- Для тестирования можно временно разрешить всем запись:
-- CREATE POLICY "Anyone can insert authors" ON authors
--     FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Anyone can insert cards" ON cards
--     FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Anyone can insert card_categories" ON card_categories
--     FOR INSERT WITH CHECK (true);

-- Для тестирования можно временно разрешить всем запись в project_images:
-- CREATE POLICY "Anyone can insert project_images" ON project_images
--     FOR INSERT WITH CHECK (true);

-- ============================================
-- 8. ПРИМЕРЫ ДАННЫХ (опционально)
-- ============================================
-- Раскомментируйте для добавления тестовых данных

-- INSERT INTO categories (name, slug) VALUES
--     ('E-Commerce', 'e-commerce'),
--     ('Agency', 'agency'),
--     ('SaaS', 'saas'),
--     ('Retail', 'retail'),
--     ('Healthcare', 'healthcare'),
--     ('Education', 'education')
-- ON CONFLICT (slug) DO NOTHING;

-- Добавление категории Healthcare
INSERT INTO categories (name, slug) VALUES
    ('Healthcare', 'healthcare')
ON CONFLICT (slug) DO NOTHING;

-- INSERT INTO authors (name, slug, bio) VALUES
--     ('AVA Digital', 'ava-digital', 'Digital design agency'),
--     ('Studio Design', 'studio-design', 'Creative design studio')
-- ON CONFLICT (slug) DO NOTHING;

