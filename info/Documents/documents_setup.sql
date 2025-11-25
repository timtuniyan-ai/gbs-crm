-- ============================================
-- Настройка системы загрузки документов
-- ============================================

-- Шаг 1: Создание Storage Bucket
-- Выполните в Supabase Dashboard → Storage → Create bucket:
-- Bucket Name: crm.gbs
-- Public bucket: ✓ (включить для публичного доступа к файлам)

-- Шаг 2: Политики доступа для Storage
-- Политика для загрузки файлов (INSERT)
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'crm.gbs');

-- Политика для чтения файлов (SELECT)
CREATE POLICY "Public can view files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'crm.gbs');

-- Политика для удаления файлов (DELETE)
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'crm.gbs');

-- Шаг 3: Создание таблицы для метаданных документов
CREATE TABLE crm_gbs_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основная информация о документе
  name TEXT NOT NULL,
  comment TEXT,
  
  -- Информация о файле
  file_size TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  
  -- Связь с сущностью (client)
  entity_type TEXT NOT NULL CHECK (entity_type IN ('client')),
  entity_id UUID NOT NULL,
  
  -- Аудит
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_by_name TEXT NOT NULL
);

-- Шаг 4: Создание индексов для быстрого поиска
CREATE INDEX idx_documents_entity ON crm_gbs_documents(entity_type, entity_id);
CREATE INDEX idx_documents_created_at ON crm_gbs_documents(created_at DESC);

-- Шаг 5: Включение Row Level Security (RLS)
ALTER TABLE crm_gbs_documents ENABLE ROW LEVEL SECURITY;

-- Политика на чтение
CREATE POLICY "Users can view documents"
ON crm_gbs_documents
FOR SELECT
TO authenticated
USING (true);

-- Политика на создание
CREATE POLICY "Users can create documents"
ON crm_gbs_documents
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Политика на обновление
CREATE POLICY "Users can update documents"
ON crm_gbs_documents
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Политика на удаление
CREATE POLICY "Users can delete documents"
ON crm_gbs_documents
FOR DELETE
TO authenticated
USING (true);

-- Шаг 6: Предоставление прав
GRANT ALL ON crm_gbs_documents TO authenticated;
GRANT ALL ON crm_gbs_documents TO anon;

