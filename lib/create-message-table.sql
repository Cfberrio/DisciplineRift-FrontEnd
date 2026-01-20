-- ============================================================
-- TABLA MESSAGE - Sistema de Mensajería
-- ============================================================
-- Este script crea la tabla para el sistema de mensajería
-- entre parents y coaches por equipo
-- ============================================================

-- Crear tabla message
CREATE TABLE IF NOT EXISTS public.message (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teamid UUID NOT NULL REFERENCES team(teamid) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('parent', 'coach')),
  parentid UUID REFERENCES parent(parentid) ON DELETE CASCADE,
  coachid UUID REFERENCES staff(id) ON DELETE SET NULL,
  body TEXT NOT NULL CHECK (length(body) > 0 AND length(body) <= 5000),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_message_teamid ON public.message(teamid);
CREATE INDEX IF NOT EXISTS idx_message_created_at ON public.message(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_sender ON public.message(sender_role, parentid, coachid);
CREATE INDEX IF NOT EXISTS idx_message_composite ON public.message(teamid, created_at DESC);

-- Habilitar Realtime (MUY IMPORTANTE para chat en tiempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE message;

-- Comentarios descriptivos
COMMENT ON TABLE public.message IS 'Mensajes entre parents y coaches organizados por team';
COMMENT ON COLUMN public.message.id IS 'ID único del mensaje';
COMMENT ON COLUMN public.message.teamid IS 'ID del team al que pertenece el mensaje';
COMMENT ON COLUMN public.message.sender_role IS 'Rol del emisor: parent o coach';
COMMENT ON COLUMN public.message.parentid IS 'ID del parent si sender_role=parent';
COMMENT ON COLUMN public.message.coachid IS 'ID del coach si sender_role=coach';
COMMENT ON COLUMN public.message.body IS 'Contenido del mensaje (máximo 5000 caracteres)';
COMMENT ON COLUMN public.message.created_at IS 'Fecha y hora de creación del mensaje';

-- Políticas RLS (Row Level Security) - OPCIONAL
-- NOTA: Actualmente el proyecto tiene RLS desactivado
-- Descomenta estas líneas si decides activar RLS en el futuro

-- -- Habilitar RLS
-- ALTER TABLE public.message ENABLE ROW LEVEL SECURITY;
-- 
-- -- Política: Parents pueden ver mensajes de sus teams
-- CREATE POLICY "Parents can view their team messages"
-- ON public.message FOR SELECT
-- USING (
--   teamid IN (
--     SELECT DISTINCT e.teamid
--     FROM student s
--     JOIN enrollment e ON e.studentid = s.studentid
--     WHERE s.parentid = auth.uid()
--     AND e.isactive = true
--   )
-- );
-- 
-- -- Política: Parents pueden enviar mensajes a sus teams
-- CREATE POLICY "Parents can send messages to their teams"
-- ON public.message FOR INSERT
-- WITH CHECK (
--   sender_role = 'parent'
--   AND parentid = auth.uid()
--   AND teamid IN (
--     SELECT DISTINCT e.teamid
--     FROM student s
--     JOIN enrollment e ON e.studentid = s.studentid
--     WHERE s.parentid = auth.uid()
--     AND e.isactive = true
--   )
-- );
-- 
-- -- Política: Coaches pueden ver mensajes de sus teams
-- CREATE POLICY "Coaches can view their team messages"
-- ON public.message FOR SELECT
-- USING (
--   teamid IN (
--     SELECT DISTINCT teamid
--     FROM session
--     WHERE coachid = auth.uid()
--   )
-- );
-- 
-- -- Política: Coaches pueden enviar mensajes a sus teams
-- CREATE POLICY "Coaches can send messages to their teams"
-- ON public.message FOR INSERT
-- WITH CHECK (
--   sender_role = 'coach'
--   AND coachid = auth.uid()
--   AND teamid IN (
--     SELECT DISTINCT teamid
--     FROM session
--     WHERE coachid = auth.uid()
--   )
-- );

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
-- Ejecuta esta query para verificar que todo está correcto:
-- SELECT 
--   table_name,
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'message'
-- ORDER BY ordinal_position;
