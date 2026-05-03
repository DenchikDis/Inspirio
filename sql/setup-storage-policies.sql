-- ============================================
-- НАСТРОЙКА ПОЛИТИК ДОСТУПА ДЛЯ STORAGE
-- ============================================
-- Выполните этот SQL в Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- ПОЛИТИКИ ДЛЯ BUCKET "Medias"
-- ============================================

-- 1. Разрешить всем читать файлы из bucket Medias
CREATE POLICY "Anyone can read from Medias"
ON storage.objects
FOR SELECT
USING (bucket_id = 'Medias');

-- 2. Разрешить всем загружать файлы в bucket Medias
CREATE POLICY "Anyone can upload to Medias"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'Medias');

-- 3. Разрешить всем обновлять файлы в bucket Medias
CREATE POLICY "Anyone can update in Medias"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'Medias');

-- 4. Разрешить всем удалять файлы из bucket Medias
CREATE POLICY "Anyone can delete from Medias"
ON storage.objects
FOR DELETE
USING (bucket_id = 'Medias');

-- ============================================
-- ПРИМЕЧАНИЕ:
-- ============================================
-- Эти политики разрешают всем (включая неавторизованных пользователей)
-- работать с bucket "Medias". Для продакшена рекомендуется:
-- 1. Использовать аутентификацию
-- 2. Ограничить доступ только авторизованным пользователям
-- 3. Или использовать service_role key для админ-панели

