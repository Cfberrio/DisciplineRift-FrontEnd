#!/usr/bin/env tsx
/**
 * Script Maestro de Testing del Sistema de Mensajería
 * 
 * Ejecuta todos los tests disponibles y genera un reporte completo
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface TestSuite {
  name: string
  script: string
  description: string
}

const testSuites: TestSuite[] = [
  {
    name: 'Tests de UI',
    script: 'tsx scripts/test-messaging-ui.ts',
    description: 'Verifica componentes React y estructura de archivos'
  },
  {
    name: 'Tests de Sistema',
    script: 'tsx scripts/test-messaging-system.ts',
    description: 'Verifica conexión Supabase, tabla message y funcionalidad'
  }
]

async function runTestSuite(suite: TestSuite): Promise<{ success: boolean; output: string }> {
  try {
    const { stdout, stderr } = await execAsync(suite.script)
    return { success: true, output: stdout + stderr }
  } catch (error: any) {
    return { success: error.code === 0, output: error.stdout + error.stderr }
  }
}

async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║                                                              ║')
  console.log('║        🧪 TEST SUITE: SISTEMA DE MENSAJERÍA COMPLETO        ║')
  console.log('║                                                              ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log('')
  
  const results: { suite: TestSuite; success: boolean; output: string }[] = []
  
  for (let i = 0; i < testSuites.length; i++) {
    const suite = testSuites[i]
    console.log(`\n${'─'.repeat(60)}`)
    console.log(`📋 Test Suite ${i + 1}/${testSuites.length}: ${suite.name}`)
    console.log(`   ${suite.description}`)
    console.log('─'.repeat(60))
    
    const result = await runTestSuite(suite)
    results.push({ suite, success: result.success, output: result.output })
    
    console.log(result.output)
  }
  
  // Resumen final
  console.log('\n' + '═'.repeat(60))
  console.log('📊 RESUMEN GENERAL')
  console.log('═'.repeat(60))
  
  const passed = results.filter(r => r.success).length
  const total = results.length
  const percentage = Math.round((passed / total) * 100)
  
  console.log('')
  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌'
    console.log(`${icon} ${result.suite.name}`)
  })
  
  console.log('\n' + '─'.repeat(60))
  console.log(`Resultado: ${passed}/${total} test suites pasados (${percentage}%)`)
  console.log('═'.repeat(60))
  
  if (percentage === 100) {
    console.log('\n✨ ¡ÉXITO COMPLETO! El sistema de mensajería está listo.')
    console.log('\n🚀 Próximos pasos:')
    console.log('   1. Iniciar el servidor: npm run dev')
    console.log('   2. Navegar a: http://localhost:3000/dashboard/messages')
    console.log('   3. Verificar funcionalidad en el navegador')
  } else if (percentage >= 50) {
    console.log('\n⚠️  Algunos tests fallaron pero el sistema puede ser funcional.')
    console.log('   Revisar los errores específicos arriba.')
  } else {
    console.log('\n🔴 Tests críticos fallaron.')
    console.log('   Se requiere configuración adicional antes de usar el sistema.')
  }
  
  console.log('\n' + '═'.repeat(60))
  console.log('📚 Documentación adicional:')
  console.log('   - Para tests individuales:')
  console.log('     npm run test:messaging:ui')
  console.log('     npm run test:messaging:system')
  console.log('   - Para ver este reporte completo:')
  console.log('     npm run test:messaging')
  console.log('═'.repeat(60) + '\n')
  
  process.exit(percentage === 100 ? 0 : 1)
}

runAllTests()
