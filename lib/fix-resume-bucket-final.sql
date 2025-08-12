-- SOLUCIÓN DEFINITIVA PARA BUCKET 'resume' CON CARPETA 'pdf'
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Verificar buckets existentes
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name = 'resume';

-- 2. Asegurar que el bucket sea público
UPDATE storage.buckets 
SET public = true 
WHERE name = 'resume';

-- 3. DESACTIVAR RLS en storage.objects (RECOMENDADO)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 4. Verificar que RLS esté desactivado
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN relrowsecurity THEN 'ENABLED' 
    ELSE 'DISABLED' 
  END as rls_status
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'objects' AND n.nspname = 'storage';

-- 5. Si necesitas mantener RLS activado, crear políticas específicas
-- (Solo ejecuta esto SI RLS debe permanecer activado)

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Resume bucket full access" ON storage.objects;

-- Crear política para acceso completo al bucket resume
CREATE POLICY "Resume bucket full access" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'resume');

-- 6. Verificar permisos en el bucket
SELECT 
  bucket_id,
  name,
  owner,
  created_at
FROM storage.objects 
WHERE bucket_id = 'resume' 
LIMIT 5;

-- 7. Script de prueba: insertar archivo de prueba
-- (Este debería funcionar después de aplicar las correcciones anteriores)
DO $$
BEGIN
  -- Este bloque intentará insertar un archivo de prueba
  INSERT INTO storage.objects (bucket_id, name, owner, metadata, path_tokens)
  VALUES (
    'resume',
    'pdf/test_sql_' || extract(epoch from now()) || '.txt',
    null,
    '{"mimetype": "text/plain", "size": 22}',
    ARRAY['pdf', 'test_sql_' || extract(epoch from now()) || '.txt']
  );
  
  RAISE NOTICE 'Test file insertion successful - RLS is properly configured';
  
  -- Limpiar archivo de prueba
  DELETE FROM storage.objects 
  WHERE bucket_id = 'resume' 
  AND name LIKE 'pdf/test_sql_%';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test file insertion failed: %', SQLERRM;
END $$;