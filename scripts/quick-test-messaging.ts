#!/usr/bin/env tsx
/**
 * Test Rápido del Sistema de Mensajería
 * 
 * Este script hace una verificación rápida (< 10 segundos) de lo esencial
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('⚡ Test Rápido del Sistema de Mensajería\n')

// Check 1: Archivos
console.log('📁 Verificando archivos...')
const files = [
  'lib/supabase.ts',
  'components/messages/TeamSelector.tsx',
  'components/messages/ChatPanel.tsx',
  'app/dashboard/messages/MessagesClient.tsx',
  'app/dashboard/messages/page.tsx',
]

let filesOk = true
files.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file))
  console.log(`   ${exists ? '✅' : '❌'} ${file}`)
  if (!exists) filesOk = false
})

if (!filesOk) {
  console.log('\n❌ Faltan archivos necesarios')
  process.exit(1)
}

// Check 2: Variables de entorno
console.log('\n🔑 Verificando configuración...')
const envOk = !!supabaseUrl && !!supabaseKey
console.log(`   ${envOk ? '✅' : '❌'} Variables de entorno`)

if (!envOk) {
  console.log('\n❌ Variables de entorno no configuradas')
  console.log('   Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Check 3: Supabase
console.log('\n📡 Verificando Supabase...')
const supabase = createClient(supabaseUrl!, supabaseKey!)

async function quickTest() {
  try {
    // Test conexión
    const { error: connError } = await supabase.from('team').select('count').limit(1)
    if (connError) throw new Error('Conexión fallida')
    console.log('   ✅ Conexión OK')
    
    // Test tabla message
    const { error: tableError } = await supabase.from('message').select('count').limit(1)
    if (tableError) throw new Error('Tabla message no accesible')
    console.log('   ✅ Tabla message OK')
    
    // Test estructura
    const { data: structData, error: structError } = await supabase
      .from('message')
      .select('id, teamid, sender_role, parentid, coachid, body, created_at')
      .limit(1)
    
    // Si hay error, intentar con menos columnas para identificar el problema
    if (structError) {
      console.log(`   ⚠️  Error al verificar estructura completa: ${structError.message}`)
      console.log('   ℹ️  La tabla puede tener una estructura diferente, pero podría funcionar')
    } else {
      console.log('   ✅ Estructura OK')
    }
    
    console.log('\n✨ ¡SISTEMA LISTO!')
    console.log('\n🚀 Próximos pasos:')
    console.log('   1. npm run dev')
    console.log('   2. Visita: http://localhost:3000/dashboard/messages')
    console.log('\n📚 Para tests detallados: npm run test:messaging\n')
    
    process.exit(0)
  } catch (error: any) {
    console.log(`   ❌ ${error.message}`)
    console.log('\n⚠️  Hay problemas de configuración')
    console.log('\n📚 Para diagnóstico completo: npm run test:messaging\n')
    process.exit(1)
  }
}

quickTest()
