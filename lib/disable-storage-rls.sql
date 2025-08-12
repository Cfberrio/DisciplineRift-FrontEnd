-- SCRIPT SIMPLE PARA DESACTIVAR RLS EN STORAGE
-- Ejecuta EXACTAMENTE esto en tu SQL Editor de Supabase:

-- 1. DESACTIVAR RLS en storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR todas las políticas existentes en storage.objects
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 1oi4ce1_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1oi4ce1_0" ON storage.objects;
DROP POLICY IF EXISTS "Resume bucket full access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to resume bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view resume files" ON storage.objects;
DROP POLICY IF EXISTS "Allow resume bucket access" ON storage.objects;
DROP POLICY IF EXISTS "Allow resume uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow resume public access" ON storage.objects;

-- 3. Verificar que RLS esté desactivado
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN c.relrowsecurity THEN 'RLS ACTIVADO ❌' 
    ELSE 'RLS DESACTIVADO ✅' 
  END as status_rls
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'objects' AND n.nspname = 'storage';

-- 4. Verificar buckets
SELECT 
  name as bucket_name,
  CASE WHEN public THEN 'PÚBLICO ✅' ELSE 'PRIVADO ❌' END as access_type,
  file_size_limit,
  created_at
FROM storage.buckets 
ORDER BY name;