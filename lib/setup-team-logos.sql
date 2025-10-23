-- SCRIPT COMPLETO PARA CONFIGURAR LOGOS DE EQUIPOS
-- Ejecuta este script en el SQL Editor de Supabase

-- ========================================
-- PASO 1: Verificar si la columna 'logo' existe en la tabla 'team'
-- ========================================
DO $$ 
BEGIN
    -- Verificar si la columna existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'team' 
        AND column_name = 'logo'
    ) THEN
        -- Si no existe, crearla
        ALTER TABLE public.team ADD COLUMN logo TEXT;
        RAISE NOTICE '✅ Columna "logo" creada en la tabla "team"';
    ELSE
        RAISE NOTICE 'ℹ️ La columna "logo" ya existe en la tabla "team"';
    END IF;
END $$;

-- ========================================
-- PASO 2: Verificar estructura de la tabla team
-- ========================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'team'
ORDER BY ordinal_position;

-- ========================================
-- PASO 3: Verificar buckets de storage existentes
-- ========================================
SELECT 
    name,
    id,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
ORDER BY created_at DESC;

-- ========================================
-- PASO 4: Crear bucket 'team-logo' si no existe
-- ========================================
DO $$ 
BEGIN
    -- Verificar si el bucket existe
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'team-logo'
    ) THEN
        -- Crear el bucket
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'team-logo',
            'team-logo',
            true,
            5242880, -- 5MB
            ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
        );
        RAISE NOTICE '✅ Bucket "team-logo" creado';
    ELSE
        RAISE NOTICE 'ℹ️ El bucket "team-logo" ya existe';
    END IF;
END $$;

-- ========================================
-- PASO 5: Asegurar que el bucket sea público
-- ========================================
UPDATE storage.buckets 
SET public = true 
WHERE name = 'team-logo';

-- ========================================
-- PASO 6: Configurar políticas de acceso para el bucket
-- ========================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Anyone can view team logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload team logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update team logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete team logos" ON storage.objects;
DROP POLICY IF EXISTS "Public access to team-logo bucket" ON storage.objects;

-- Crear política para acceso público de lectura
CREATE POLICY "Public access to team-logo bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-logo');

-- Crear política para que usuarios autenticados puedan subir
CREATE POLICY "Authenticated users can upload team logos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'team-logo' AND 
    auth.role() = 'authenticated'
);

-- Crear política para que usuarios autenticados puedan actualizar
CREATE POLICY "Authenticated users can update team logos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'team-logo' AND 
    auth.role() = 'authenticated'
);

-- Crear política para que usuarios autenticados puedan eliminar
CREATE POLICY "Authenticated users can delete team logos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'team-logo' AND 
    auth.role() = 'authenticated'
);

-- ========================================
-- PASO 7: Verificar configuración final
-- ========================================
SELECT 
    '1. Columna logo en tabla team' as verificacion,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'team' AND column_name = 'logo'
        ) THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END as estado

UNION ALL

SELECT 
    '2. Bucket team-logo existe' as verificacion,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'team-logo')
        THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END as estado

UNION ALL

SELECT 
    '3. Bucket team-logo es público' as verificacion,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'team-logo' AND public = true)
        THEN '✅ PÚBLICO'
        ELSE '❌ PRIVADO'
    END as estado

UNION ALL

SELECT 
    '4. Políticas de storage configuradas' as verificacion,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage'
            AND policyname LIKE '%team-logo%'
        )
        THEN '✅ CONFIGURADAS'
        ELSE '⚠️ SIN POLÍTICAS'
    END as estado;

-- ========================================
-- PASO 8: Mostrar equipos actuales y sus logos
-- ========================================
SELECT 
    teamid,
    name,
    logo,
    CASE 
        WHEN logo IS NULL THEN '❌ Sin logo'
        WHEN logo = '' THEN '⚠️ Logo vacío'
        ELSE '✅ Tiene logo'
    END as estado_logo
FROM public.team
ORDER BY name
LIMIT 10;

-- ========================================
-- INFORMACIÓN ADICIONAL
-- ========================================
-- Para subir un logo y actualizar la URL en la base de datos:
-- 
-- 1. Sube la imagen al bucket 'team-logo' en la carpeta 'teams' desde el dashboard de Supabase
-- 2. Copia la URL pública del archivo
-- 3. Ejecuta este UPDATE (reemplaza los valores):
--
-- UPDATE public.team 
-- SET logo = 'https://tu-proyecto.supabase.co/storage/v1/object/public/team-logo/teams/nombre-archivo.png'
-- WHERE teamid = 'id-del-equipo';
--
-- Formato de URL esperado:
-- https://[PROJECT_ID].supabase.co/storage/v1/object/public/team-logo/teams/[ARCHIVO]
--
-- Ejemplo de estructura:
-- team-logo/
--   └── teams/
--       ├── logo-equipo-1.png
--       ├── logo-equipo-2.jpg
--       └── logo-equipo-3.webp

