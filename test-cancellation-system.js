/**
 * Script de prueba para el sistema de emails de cancelación
 * Ejecuta: node test-cancellation-system.js
 */

const BASE_URL = 'http://localhost:3000/api/admin'

// Helper para fetch con timeout
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

async function testCancellationSystem() {
  console.log('🧪 === PRUEBA DEL SISTEMA DE CANCELACIONES ===\n')

  try {
    // Verificar que el servidor esté corriendo
    console.log('🔍 Verificando servidor...')
    try {
      await fetchWithTimeout('http://localhost:3000/api/health', {}, 5000)
      console.log('✅ Servidor corriendo\n')
    } catch (error) {
      console.log('❌ Servidor no disponible. Asegurate de que esté corriendo con npm run dev')
      console.error('Error:', error.message)
      return
    }
    // 1. Configurar equipo de prueba
    console.log('1️⃣ Configurando equipo de prueba "prueba"...')
    const setupResponse = await fetchWithTimeout(`${BASE_URL}/setup-test-team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const setupData = await setupResponse.json()
    console.log('📊 Resultado setup:', setupData.success ? '✅' : '❌')
    if (!setupData.success) {
      console.error('Error en setup:', setupData.error)
    } else {
      console.log(`   Equipo: ${setupData.team?.name}`)
      console.log(`   Padre: ${setupData.parent?.firstname} ${setupData.parent?.lastname}`)
      console.log(`   Email: ${setupData.parent?.email}`)
      console.log(`   Estudiante: ${setupData.student?.firstname} ${setupData.student?.lastname}`)
      console.log(`   Escuela: ${setupData.school?.name}`)
    }
    console.log()

    // 2. Ejecutar diagnósticos
    console.log('2️⃣ Ejecutando diagnósticos del sistema...')
    const diagResponse = await fetchWithTimeout(`${BASE_URL}/cancellation-diagnostics`)
    const diagData = await diagResponse.json()
    
    console.log('📊 Resultado diagnósticos:', diagData.success ? '✅' : '❌')
    if (diagData.success) {
      const diag = diagData.diagnostics
      console.log(`   📋 Tablas verificadas: ${Object.keys(diag.tables).length}`)
      console.log(`   🏐 Total equipos: ${diag.teams.length}`)
      console.log(`   ❌ Equipos inactivos: ${diag.inactiveTeams.length}`)
      console.log(`   🎯 Equipo "prueba": ${diag.pruebaTeam ? '✅ Encontrado' : '❌ No encontrado'}`)
      
      if (diag.sampleQuery) {
        console.log(`   📧 Candidatos para cancelación: ${diag.sampleQuery.count || 0}`)
      }
    }
    console.log()

    // 3. Dry run - preview de emails
    console.log('3️⃣ Ejecutando dry run (preview)...')
    const dryRunResponse = await fetchWithTimeout(`${BASE_URL}/send-cancellations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dryRun: true,
        limit: 5
      })
    })
    
    const dryRunData = await dryRunResponse.json()
    console.log('📊 Resultado dry run:', dryRunData.success ? '✅' : '❌')
    
    if (dryRunData.success) {
      console.log(`   📧 Destinatarios encontrados: ${dryRunData.summary.totalFound}`)
      console.log(`   📝 Para procesar: ${dryRunData.summary.toProcess}`)
      
      if (dryRunData.recipients && dryRunData.recipients.length > 0) {
        console.log('   📋 Primeros destinatarios:')
        dryRunData.recipients.slice(0, 3).forEach((recipient, index) => {
          console.log(`      ${index + 1}. ${recipient.parentName} (${recipient.parentEmail})`)
          console.log(`         Equipo: ${recipient.teamName}`)
          console.log(`         Escuela: ${recipient.schoolName}`)
        })
        
        if (dryRunData.sampleEmail) {
          console.log(`   ✉️  Asunto del email: "${dryRunData.sampleEmail.subject}"`)
        }
      } else {
        console.log('   ⚠️  No se encontraron destinatarios')
      }
    } else {
      console.error('Error en dry run:', dryRunData.error)
    }
    console.log()

    // 4. Test send (solo si hay destinatarios)
    if (dryRunData.success && dryRunData.recipients && dryRunData.recipients.length > 0) {
      console.log('4️⃣ Ejecutando test send con email de prueba...')
      const testSendResponse = await fetchWithTimeout(`${BASE_URL}/send-cancellations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dryRun: false,
          limit: 1,
          testEmail: 'test.cancellation@example.com'
        })
      })
      
      const testSendData = await testSendResponse.json()
      console.log('📊 Resultado test send:', testSendData.success ? '✅' : '❌')
      
      if (testSendData.success) {
        console.log(`   📧 Intentos: ${testSendData.summary.attempted}`)
        console.log(`   ✅ Enviados: ${testSendData.summary.sent}`)
        console.log(`   ❌ Fallidos: ${testSendData.summary.failed}`)
        console.log(`   🎯 Email de prueba: ${testSendData.testEmail}`)
        
        if (testSendData.results && testSendData.results.length > 0) {
          const result = testSendData.results[0]
          console.log(`   📨 Primer resultado: ${result.success ? '✅' : '❌'} ${result.parentEmail}`)
          if (result.messageId) {
            console.log(`   📫 Message ID: ${result.messageId}`)
          }
        }
      } else {
        console.error('Error en test send:', testSendData.error)
      }
    } else {
      console.log('4️⃣ Saltando test send - no hay destinatarios')
    }

    console.log('\n🎉 === PRUEBA COMPLETADA ===')
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message)
    console.error('Stack:', error.stack)
  }
}

// Ejecutar prueba
testCancellationSystem().catch(console.error)
