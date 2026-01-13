-- Fix RLS para la tabla Partners_Program
-- Ejecuta este script en Supabase SQL Editor

-- Opción 1: Deshabilitar RLS completamente (más simple)
ALTER TABLE public."Partners_Program" DISABLE ROW LEVEL SECURITY;

-- Opción 2: Si prefieres mantener RLS, crea estas políticas
-- (Descomenta las siguientes líneas si prefieres esta opción)

-- -- Habilitar RLS
-- ALTER TABLE public."Partners_Program" ENABLE ROW LEVEL SECURITY;

-- -- Política para INSERT (permitir a todos insertar)
-- CREATE POLICY "Allow public insert on Partners_Program"
-- ON public."Partners_Program"
-- FOR INSERT
-- TO public
-- WITH CHECK (true);

-- -- Política para SELECT (permitir a todos leer)
-- CREATE POLICY "Allow public select on Partners_Program"
-- ON public."Partners_Program"
-- FOR SELECT
-- TO public
-- USING (true);

-- -- Política para UPDATE (permitir a todos actualizar)
-- CREATE POLICY "Allow public update on Partners_Program"
-- ON public."Partners_Program"
-- FOR UPDATE
-- TO public
-- USING (true)
-- WITH CHECK (true);

-- Verificar que funcionó
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'Partners_Program';
