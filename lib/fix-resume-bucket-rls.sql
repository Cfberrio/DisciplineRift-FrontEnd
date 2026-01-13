-- Script para solucionar el problema de RLS en el bucket 'resume'
-- Ejecuta esto en el SQL Editor de Supabase

-- OPCIÓN 1: Deshabilitar RLS completamente en el bucket (MÁS SIMPLE)
-- Esto hace que el bucket sea completamente público para operaciones de storage
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- OPCIÓN 2: Si prefieres mantener RLS habilitado, crear políticas específicas
-- (Comenta la línea de arriba y descomenta las siguientes)

/*
-- Habilitar RLS en la tabla de objetos de storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Política para permitir INSERT (upload) a todos en el bucket 'resume'
CREATE POLICY "Allow public uploads to resume bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'resume');

-- Política para permitir SELECT (download/view) a todos en el bucket 'resume'
CREATE POLICY "Allow public downloads from resume bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'resume');

-- Política para permitir UPDATE a todos en el bucket 'resume'
CREATE POLICY "Allow public updates in resume bucket"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'resume')
WITH CHECK (bucket_id = 'resume');

-- Política para permitir DELETE a todos en el bucket 'resume'
CREATE POLICY "Allow public deletes in resume bucket"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'resume');
*/

-- Verificar que el bucket existe y es público
UPDATE storage.buckets
SET public = true
WHERE id = 'resume';

-- Verificar las políticas existentes (solo para consulta)
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
