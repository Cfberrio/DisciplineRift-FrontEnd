-- Script para solucionar problemas de RLS en el bucket 'resume'
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Desactivar RLS en el bucket resume (si está activado)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 2. O crear una política que permita uploads públicos
-- (Solo si necesitas mantener RLS activado por alguna razón)

-- Eliminar políticas existentes para el bucket resume
DROP POLICY IF EXISTS "Anyone can upload to resume bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view resume files" ON storage.objects;

-- Crear política para permitir uploads al bucket resume
CREATE POLICY "Anyone can upload to resume bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resume');

-- Crear política para permitir ver archivos del bucket resume
CREATE POLICY "Anyone can view resume files"
ON storage.objects FOR SELECT
USING (bucket_id = 'resume');

-- 3. Verificar configuración del bucket
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'resume';