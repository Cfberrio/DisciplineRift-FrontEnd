// Script para enviar emails de Fall Season - ENVÍO REAL
// Ejecutar con: node send-fall-season-now.js

const fetch = require('node-fetch');

async function sendFallSeasonEmails() {
  try {
    console.log('🚀 === INICIANDO ENVÍO REAL DE EMAILS FALL SEASON ===\n');

    const baseUrl = 'http://localhost:3000';

    // Paso 1: Verificar padres calificados
    console.log('🔍 Verificando padres calificados...');
    
    try {
      const getResponse = await fetch(`${baseUrl}/api/send-fall-season-email`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!getResponse.ok) {
        throw new Error(`HTTP ${getResponse.status}: ${getResponse.statusText}`);
      }

      const getData = await getResponse.json();
      console.log(`✅ Padres calificados encontrados: ${getData.count}`);
      
      if (getData.count === 0) {
        console.log('⚠️ No hay padres que cumplan las condiciones:');
        console.log('   1. Email en tabla Newsletter');
        console.log('   2. Team con isactive = true');
        console.log('   3. Enrollment con isactive = false');
        console.log('\n❌ No se enviará ningún email.');
        return;
      }

      // Mostrar algunos ejemplos
      console.log('\n📋 Primeros padres calificados:');
      getData.parents.slice(0, 5).forEach((parent, index) => {
        console.log(`   ${index + 1}. ${parent.firstName} - ${parent.email}`);
      });

      console.log(`\n🎯 TOTAL A ENVIAR: ${getData.count} emails`);
      console.log('\n⏱️ Iniciando envío en 3 segundos...');
      
      // Pausa de 3 segundos
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (getError) {
      console.error('❌ Error verificando padres calificados:', getError.message);
      console.log('\n💡 Asegúrate de que el servidor esté corriendo: npm run dev');
      return;
    }

    // Paso 2: Envío real
    console.log('\n📧 === INICIANDO ENVÍO REAL ===');
    
    try {
      const sendResponse = await fetch(`${baseUrl}/api/send-fall-season-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preview: false,
          // limit: 10 // Descomenta para limitar a 10 emails en la primera prueba
        }),
      });

      if (!sendResponse.ok) {
        throw new Error(`HTTP ${sendResponse.status}: ${sendResponse.statusText}`);
      }

      const sendData = await sendResponse.json();
      
      console.log('\n📊 === RESUMEN DEL ENVÍO ===');
      console.log(`✅ Emails enviados exitosamente: ${sendData.emailsSent}`);
      console.log(`❌ Errores encontrados: ${sendData.errors}`);
      console.log(`📋 Total procesados: ${sendData.totalProcessed}`);
      
      if (sendData.emailsSent > 0) {
        console.log('\n🎉 ¡Envío completado exitosamente!');
      }
      
      if (sendData.errors > 0) {
        console.log('\n⚠️ Algunos emails tuvieron errores. Revisa los logs para más detalles.');
      }

      // Mostrar resultados detallados si hay errores
      if (sendData.results && sendData.errors > 0) {
        console.log('\n❌ Emails con errores:');
        sendData.results
          .filter(r => !r.success)
          .slice(0, 5)
          .forEach((result, index) => {
            console.log(`   ${index + 1}. ${result.parentEmail}: ${result.error}`);
          });
      }

    } catch (sendError) {
      console.error('\n💥 Error durante el envío:', sendError.message);
    }

  } catch (error) {
    console.error('\n💥 Error general:', error);
  }
}

// Ejecutar
sendFallSeasonEmails();


