-- Script para agregar columna de resume como TEXT en la tabla Drteam
-- Ejecuta esto en tu SQL Editor de Supabase si el campo 'resume' es muy pequeño

-- 1. Verificar estructura actual de la tabla
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'Drteam' AND table_schema = 'public';

-- 2. Si la columna 'resume' es VARCHAR y muy pequeña, modificarla a TEXT
-- ALTER TABLE public."Drteam" ALTER COLUMN resume TYPE TEXT;

-- 3. O agregar una nueva columna para el PDF base64
-- ALTER TABLE public."Drteam" ADD COLUMN resume_data TEXT;

-- 4. Verificar el resultado
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'Drteam' AND table_schema = 'public'
AND column_name IN ('resume', 'resume_data');