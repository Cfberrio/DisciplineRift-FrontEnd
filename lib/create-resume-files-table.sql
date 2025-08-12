-- Crear tabla para almacenar archivos PDF como base64
-- Ejecuta esto en tu SQL Editor de Supabase

-- 1. Crear tabla para archivos de resume
CREATE TABLE IF NOT EXISTS public.resume_files (
    id SERIAL PRIMARY KEY,
    drteam_id INTEGER,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_data TEXT NOT NULL, -- Aquí se guarda el base64
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Relación con tabla Drteam (opcional)
    CONSTRAINT fk_drteam 
        FOREIGN KEY (drteam_id) 
        REFERENCES public."Drteam"(id) 
        ON DELETE CASCADE
);

-- 2. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_resume_files_drteam_id ON public.resume_files(drteam_id);
CREATE INDEX IF NOT EXISTS idx_resume_files_created_at ON public.resume_files(created_at);

-- 3. Desactivar RLS para esta tabla también
ALTER TABLE public.resume_files DISABLE ROW LEVEL SECURITY;

-- 4. Agregar permisos
GRANT ALL ON public.resume_files TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE resume_files_id_seq TO anon, authenticated;

-- 5. Verificar que la tabla se creó correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'resume_files' 
AND table_schema = 'public'
ORDER BY ordinal_position;