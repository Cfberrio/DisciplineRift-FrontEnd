-- SCRIPT FINAL PARA SOLUCIONAR STORAGE
-- Ejecuta EXACTAMENTE esto en Supabase SQL Editor:

-- 1. Desactivar RLS en storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas de storage.objects
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 1oi4ce1_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1oi4ce1_0" ON storage.objects;
DROP POLICY IF EXISTS "Resume bucket full access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to resume bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view resume files" ON storage.objects;
DROP POLICY IF EXISTS "Allow resume bucket access" ON storage.objects;

-- 3. Verificar el resultado
SELECT 
  'storage.objects RLS Status:' as check_name,
  CASE 
    WHEN c.relrowsecurity THEN 'ACTIVADO ❌' 
    ELSE 'DESACTIVADO ✅' 
  END as status
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'objects' AND n.nspname = 'storage'

UNION ALL

SELECT 
  'Bucket resume Status:' as check_name,
  CASE 
    WHEN public THEN 'PÚBLICO ✅' 
    ELSE 'PRIVADO ❌' 
  END as status
FROM storage.buckets 
WHERE name = 'resume';

-- 4. Si aún tienes problemas, ejecuta también esto:
-- UPDATE storage.buckets SET public = true WHERE name = 'resume';

-- 5. Resultado esperado:
-- storage.objects RLS Status: | DESACTIVADO ✅
-- Bucket resume Status:       | PÚBLICO ✅