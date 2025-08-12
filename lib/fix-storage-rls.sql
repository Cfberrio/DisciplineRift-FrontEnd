-- SCRIPT PARA SOLUCIONAR RLS EN SUPABASE STORAGE
-- Ejecuta este script COMPLETO en el SQL Editor de Supabase

-- 1. Verificar estado actual del bucket
SELECT 
  name,
  id,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'resume';

-- 2. Verificar políticas actuales en storage.objects
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 3. DESACTIVAR RLS completamente en storage.objects (RECOMENDADO)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 4. O si necesitas mantener RLS, crear políticas específicas para el bucket 'resume'
-- (Solo ejecuta esto SI el paso 3 no funciona)

-- Eliminar políticas existentes para resume
DROP POLICY IF EXISTS "Allow resume bucket access" ON storage.objects;
DROP POLICY IF EXISTS "Allow resume uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow resume public access" ON storage.objects;

-- Crear política permisiva para el bucket resume
CREATE POLICY "Allow resume bucket access" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'resume');

-- 5. Verificar que el bucket sea público
UPDATE storage.buckets 
SET public = true 
WHERE name = 'resume';

-- 6. Verificar resultado final
SELECT 
  'Bucket Configuration' as check_type,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE name = 'resume'

UNION ALL

SELECT 
  'RLS Status' as check_type,
  'storage.objects' as name,
  CASE 
    WHEN relrowsecurity THEN 'ENABLED'::text 
    ELSE 'DISABLED'::text 
  END as public,
  NULL as file_size_limit
FROM pg_class 
WHERE relname = 'objects' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage');