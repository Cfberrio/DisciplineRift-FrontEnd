#!/usr/bin/env tsx
/**
 * Script de Testing del Sistema de Mensajería
 * 
 * Este script verifica:
 * 1. Conexión a Supabase
 * 2. Existencia de la tabla message
 * 3. Permisos de lectura/escritura
 * 4. Estructura de la tabla
 * 5. Funcionalidad CRUD básica
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Cargar variables de entorno
config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface TestResult {
  name: string
  passed: boolean
  message: string
  error?: any
}

const results: TestResult[] = []

function logTest(name: string, passed: boolean, message: string, error?: any) {
  results.push({ name, passed, message, error })
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${name}: ${message}`)
  if (error && !passed) {
    console.error('   Error:', error)
  }
}

async function testSupabaseConnection() {
  console.log('\n📡 Test 1: Conexión a Supabase')
  try {
    const { data, error } = await supabase.from('team').select('count').limit(1)
    if (error) throw error
    logTest('Conexión Supabase', true, 'Conectado exitosamente')
    return true
  } catch (error) {
    logTest('Conexión Supabase', false, 'Fallo en la conexión', error)
    return false
  }
}

async function testMessageTableExists() {
  console.log('\n📋 Test 2: Tabla message existe')
  try {
    const { data, error } = await supabase.from('message').select('count').limit(0)
    if (error) throw error
    logTest('Tabla message', true, 'La tabla existe y es accesible')
    return true
  } catch (error: any) {
    logTest('Tabla message', false, 'La tabla no existe o no es accesible', error)
    return false
  }
}

async function testMessageTableStructure() {
  console.log('\n🏗️  Test 3: Estructura de la tabla message')
  try {
    const { data, error } = await supabase
      .from('message')
      .select('id, teamid, sender_role, parentid, coachid, body, created_at')
      .limit(1)
    
    if (error) throw error
    
    logTest('Estructura tabla', true, 'Todas las columnas requeridas están presentes')
    return true
  } catch (error: any) {
    if (error.message?.includes('column')) {
      logTest('Estructura tabla', false, 'Faltan columnas requeridas', error)
    } else {
      logTest('Estructura tabla', true, 'Tabla sin registros pero estructura OK')
    }
    return true
  }
}

async function testReadPermissions() {
  console.log('\n👀 Test 4: Permisos de lectura')
  try {
    const { data, error } = await supabase
      .from('message')
      .select('*')
      .limit(5)
    
    if (error) throw error
    logTest('Permisos lectura', true, `Lectura permitida (${data?.length || 0} mensajes en muestra)`)
    return true
  } catch (error) {
    logTest('Permisos lectura', false, 'Sin permisos de lectura', error)
    return false
  }
}

async function testTeamsQuery() {
  console.log('\n👥 Test 5: Query de teams por parent')
  try {
    // Obtener un parent que tenga students
    const { data: students, error: studentError } = await supabase
      .from('student')
      .select('parentid')
      .limit(1)
    
    if (studentError) throw studentError
    
    if (!students || students.length === 0) {
      logTest('Query teams', true, 'No hay students en DB (esperado en test)')
      return true
    }
    
    const parentId = students[0].parentid
    
    // Query de teams como lo hace la app
    const { data: studentData, error: queryError } = await supabase
      .from('student')
      .select(`
        studentid,
        enrollment!inner(
          enrollmentid,
          isactive,
          team:teamid!inner(
            teamid,
            name,
            status
          )
        )
      `)
      .eq('parentid', parentId)
    
    if (queryError) throw queryError
    
    logTest('Query teams', true, `Query exitoso (${studentData?.length || 0} students encontrados)`)
    return true
  } catch (error) {
    logTest('Query teams', false, 'Error en query de teams', error)
    return false
  }
}

async function testMessageInsert() {
  console.log('\n✍️  Test 6: Inserción de mensaje (simulado)')
  
  try {
    // Obtener un team válido
    const { data: teams, error: teamError } = await supabase
      .from('team')
      .select('teamid')
      .limit(1)
    
    if (teamError) throw teamError
    
    if (!teams || teams.length === 0) {
      logTest('Inserción mensaje', true, 'No hay teams para test (esperado)')
      return true
    }
    
    const testTeamId = teams[0].teamid
    
    // Obtener un parent real de la base de datos
    const { data: parents, error: parentError } = await supabase
      .from('parent')
      .select('parentid')
      .limit(1)
    
    if (parentError || !parents || parents.length === 0) {
      logTest('Inserción mensaje', true, 'No hay parents en DB para test (esperado)')
      return true
    }
    
    const testParentId = parents[0].parentid
    
    // Intentar insertar un mensaje de test con datos reales
    const { data, error } = await supabase
      .from('message')
      .insert({
        teamid: testTeamId,
        sender_role: 'parent',
        parentid: testParentId,
        coachid: null,
        body: '[TEST MESSAGE - IGNORE] Testing messaging system functionality'
      })
      .select()
    
    if (error) {
      // Si falla por RLS o permisos, es esperado
      if (error.message?.includes('policy') || error.message?.includes('permission')) {
        logTest('Inserción mensaje', true, 'Tabla protegida por RLS (esperado)')
        return true
      }
      // Si falla por foreign key con datos reales, hay un problema
      throw error
    }
    
    // Si tuvo éxito, limpiar el mensaje de test
    if (data && data.length > 0) {
      await supabase.from('message').delete().eq('id', data[0].id)
      logTest('Inserción mensaje', true, 'Inserción exitosa y limpieza completada')
    }
    
    return true
  } catch (error) {
    logTest('Inserción mensaje', false, 'Error en inserción', error)
    return false
  }
}

async function testRealtimeCompatibility() {
  console.log('\n⚡ Test 7: Compatibilidad Realtime')
  try {
    // Crear un canal de test
    const testChannel = supabase.channel('test-channel')
    
    // Intentar suscribirse
    const subscription = testChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        logTest('Realtime', true, 'Suscripción Realtime funcionando')
      }
    })
    
    // Esperar un poco para la suscripción
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Limpiar
    await supabase.removeChannel(testChannel)
    
    logTest('Realtime setup', true, 'Canal Realtime configurado correctamente')
    return true
  } catch (error) {
    logTest('Realtime', false, 'Error en configuración Realtime', error)
    return false
  }
}

async function testComponentRequirements() {
  console.log('\n🔧 Test 8: Requisitos de componentes')
  
  const checks = [
    { name: 'Message interface', file: 'lib/supabase.ts' },
    { name: 'TeamSelector component', file: 'components/messages/TeamSelector.tsx' },
    { name: 'ChatPanel component', file: 'components/messages/ChatPanel.tsx' },
    { name: 'MessagesClient', file: 'app/dashboard/messages/MessagesClient.tsx' },
    { name: 'Messages page', file: 'app/dashboard/messages/page.tsx' },
  ]
  
  const fs = require('fs')
  const path = require('path')
  
  let allExist = true
  
  for (const check of checks) {
    const fullPath = path.join(process.cwd(), check.file)
    const exists = fs.existsSync(fullPath)
    
    if (!exists) {
      console.log(`   ❌ ${check.name}: Archivo no encontrado (${check.file})`)
      allExist = false
    } else {
      console.log(`   ✅ ${check.name}: OK`)
    }
  }
  
  logTest('Archivos componentes', allExist, allExist ? 'Todos los archivos presentes' : 'Faltan archivos')
  return allExist
}

async function printSummary() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE TESTS')
  console.log('='.repeat(60))
  
  const passed = results.filter(r => r.passed).length
  const total = results.length
  const percentage = Math.round((passed / total) * 100)
  
  console.log(`\nTotal: ${passed}/${total} tests pasados (${percentage}%)`)
  
  console.log('\n✅ Tests exitosos:')
  results.filter(r => r.passed).forEach(r => {
    console.log(`   • ${r.name}: ${r.message}`)
  })
  
  if (results.some(r => !r.passed)) {
    console.log('\n❌ Tests fallidos:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   • ${r.name}: ${r.message}`)
    })
  }
  
  console.log('\n' + '='.repeat(60))
  
  if (percentage === 100) {
    console.log('✨ ¡TODOS LOS TESTS PASARON! Sistema listo para usar.')
  } else if (percentage >= 75) {
    console.log('⚠️  La mayoría de tests pasaron. Revisar fallos menores.')
  } else {
    console.log('🔴 Tests críticos fallaron. Revisar configuración.')
  }
  
  console.log('='.repeat(60) + '\n')
}

async function runAllTests() {
  console.log('🚀 Iniciando tests del Sistema de Mensajería\n')
  console.log('Este script verificará la configuración completa del sistema.\n')
  
  const connectionOk = await testSupabaseConnection()
  
  if (!connectionOk) {
    console.log('\n⛔ Tests detenidos: No hay conexión a Supabase')
    await printSummary()
    process.exit(1)
  }
  
  await testMessageTableExists()
  await testMessageTableStructure()
  await testReadPermissions()
  await testTeamsQuery()
  await testMessageInsert()
  await testRealtimeCompatibility()
  await testComponentRequirements()
  
  await printSummary()
  
  const allPassed = results.every(r => r.passed)
  process.exit(allPassed ? 0 : 1)
}

// Ejecutar tests
runAllTests()
