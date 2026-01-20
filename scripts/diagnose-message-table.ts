#!/usr/bin/env tsx
/**
 * Diagnóstico de la tabla message
 * Este script verifica la estructura actual y proporciona el SQL para corregirla
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnoseTable() {
  console.log('🔍 Diagnosticando tabla message...\n')
  
  try {
    // Intentar hacer un SELECT simple
    const { data, error } = await supabase
      .from('message')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Error al consultar la tabla:', error.message)
      console.log('\n📋 La tabla message necesita ser creada o corregida.\n')
      printCorrectSQL()
      process.exit(1)
    }
    
    console.log('✅ Tabla message existe y es accesible')
    
    if (data && data.length > 0) {
      console.log('\n📊 Estructura detectada (columnas encontradas):')
      const columns = Object.keys(data[0])
      columns.forEach(col => {
        console.log(`   • ${col}`)
      })
      
      console.log('\n🔎 Verificando columnas requeridas:')
      const required = ['id', 'teamid', 'sender_role', 'parentid', 'coachid', 'body', 'created_at']
      const missing = required.filter(col => !columns.includes(col))
      
      if (missing.length > 0) {
        console.log('\n❌ Faltan las siguientes columnas:')
        missing.forEach(col => {
          console.log(`   • ${col}`)
        })
        console.log('\n📋 SQL para agregar columnas faltantes:\n')
        printAlterSQL(missing)
      } else {
        console.log('   ✅ Todas las columnas requeridas están presentes')
        console.log('\n✨ ¡La tabla está correctamente configurada!')
      }
    } else {
      console.log('   ℹ️  La tabla está vacía (sin mensajes aún)')
      console.log('   ⚠️  No se puede verificar estructura completa')
      console.log('\n📋 Verifica que la tabla tenga esta estructura:\n')
      printCorrectSQL()
    }
    
  } catch (error: any) {
    console.log('❌ Error inesperado:', error.message)
    console.log('\n📋 SQL para crear la tabla correctamente:\n')
    printCorrectSQL()
  }
}

function printCorrectSQL() {
  console.log('```sql')
  console.log(`-- Crear tabla message (si no existe)
CREATE TABLE IF NOT EXISTS public.message (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teamid UUID NOT NULL REFERENCES team(teamid),
  sender_role TEXT NOT NULL CHECK (sender_role IN ('parent', 'coach')),
  parentid UUID REFERENCES parent(parentid),
  coachid UUID REFERENCES staff(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_message_teamid ON public.message(teamid);
CREATE INDEX IF NOT EXISTS idx_message_created_at ON public.message(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_sender ON public.message(sender_role, parentid, coachid);

-- Habilitar Realtime (IMPORTANTE)
ALTER PUBLICATION supabase_realtime ADD TABLE message;

-- Comentario descriptivo
COMMENT ON TABLE public.message IS 'Mensajes entre parents y coaches por team';
`)
  console.log('```')
  console.log('\n📝 Instrucciones:')
  console.log('   1. Ve a tu Dashboard de Supabase')
  console.log('   2. Navega a: SQL Editor')
  console.log('   3. Copia y pega el SQL de arriba')
  console.log('   4. Ejecuta el query')
  console.log('   5. Ejecuta: npm run test:messaging:quick\n')
}

function printAlterSQL(missing: string[]) {
  console.log('```sql')
  missing.forEach(col => {
    switch (col) {
      case 'id':
        console.log('ALTER TABLE public.message ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;')
        break
      case 'teamid':
        console.log('ALTER TABLE public.message ADD COLUMN teamid UUID NOT NULL REFERENCES team(teamid);')
        break
      case 'sender_role':
        console.log("ALTER TABLE public.message ADD COLUMN sender_role TEXT NOT NULL CHECK (sender_role IN ('parent', 'coach'));")
        break
      case 'parentid':
        console.log('ALTER TABLE public.message ADD COLUMN parentid UUID REFERENCES parent(parentid);')
        break
      case 'coachid':
        console.log('ALTER TABLE public.message ADD COLUMN coachid UUID REFERENCES staff(id);')
        break
      case 'body':
        console.log('ALTER TABLE public.message ADD COLUMN body TEXT NOT NULL;')
        break
      case 'created_at':
        console.log('ALTER TABLE public.message ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();')
        break
    }
  })
  console.log('```')
}

diagnoseTable()
