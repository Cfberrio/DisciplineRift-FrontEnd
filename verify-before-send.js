// Script de verificación final antes del envío masivo
console.log('🔍 === VERIFICACIÓN FINAL ANTES DEL ENVÍO MASIVO ===');

const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function verifySystem() {
  try {
    console.log('\n📊 1. Obteniendo lista completa de estudiantes...');
    
    const getResponse = await makeRequest('/api/send-cancellation-emails');
    
    if (!getResponse.data || !getResponse.data.success) {
      console.error('❌ Error obteniendo datos:', getResponse.data);
      return false;
    }
    
    const students = getResponse.data.students || [];
    console.log(`✅ Total estudiantes encontrados: ${students.length}`);
    
    if (students.length === 0) {
      console.log('⚠️ No hay estudiantes para enviar emails de cancelación');
      return false;
    }
    
    // Mostrar resumen por equipos
    const teamCounts = {};
    const schoolCounts = {};
    
    students.forEach(student => {
      teamCounts[student.teamName] = (teamCounts[student.teamName] || 0) + 1;
      schoolCounts[student.schoolName] = (schoolCounts[student.schoolName] || 0) + 1;
    });
    
    console.log('\n📋 Resumen por equipos:');
    Object.entries(teamCounts).forEach(([team, count]) => {
      console.log(`  - ${team}: ${count} estudiante(s)`);
    });
    
    console.log('\n🏫 Resumen por escuelas:');
    Object.entries(schoolCounts).forEach(([school, count]) => {
      console.log(`  - ${school}: ${count} estudiante(s)`);
    });
    
    // Verificar emails únicos
    const uniqueEmails = [...new Set(students.map(s => s.parentEmail))];
    console.log(`\n📧 Emails únicos a enviar: ${uniqueEmails.length}`);
    
    // Mostrar algunos ejemplos
    console.log('\n📝 Primeros 5 ejemplos:');
    students.slice(0, 5).forEach((student, i) => {
      console.log(`  ${i + 1}. ${student.parentName} (${student.parentEmail})`);
      console.log(`     Estudiante: ${student.studentName}`);
      console.log(`     Equipo: ${student.teamName}`);
      console.log(`     Escuela: ${student.schoolName}\n`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error durante verificación:', error.message);
    return false;
  }
}

async function sendRealEmails() {
  try {
    console.log('\n🚀 === INICIANDO ENVÍO MASIVO REAL ===');
    console.log('⚠️ ATENCIÓN: Se van a enviar emails REALES a los padres');
    
    const sendData = {
      preview: false,
      testEmail: null, // No usar email de prueba
      limit: null // Sin límite, enviar a todos
    };
    
    console.log('\n⏳ Enviando emails...');
    console.log('Esto puede tomar varios minutos...');
    
    const startTime = Date.now();
    const response = await makeRequest('/api/send-cancellation-emails', 'POST', sendData);
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log(`\n📊 === RESULTADOS DEL ENVÍO MASIVO ===`);
    console.log(`⏱️ Tiempo total: ${duration} segundos`);
    console.log(`📈 Status: ${response.status}`);
    
    if (response.data && response.data.success) {
      console.log(`✅ Emails enviados exitosamente: ${response.data.emailsSent}`);
      console.log(`❌ Errores: ${response.data.errors}`);
      console.log(`📋 Total procesados: ${response.data.totalProcessed}`);
      
      if (response.data.errors > 0 && response.data.results) {
        console.log('\n⚠️ Emails con errores:');
        response.data.results
          .filter(r => !r.success)
          .forEach(result => {
            console.log(`  - ${result.parentEmail}: ${result.error}`);
          });
      }
      
      if (response.data.emailsSent > 0) {
        console.log('\n🎉 ¡ENVÍO MASIVO COMPLETADO EXITOSAMENTE!');
        console.log(`📧 Se enviaron ${response.data.emailsSent} emails de cancelación`);
      }
      
    } else {
      console.error('❌ Error en el envío masivo:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error crítico durante el envío:', error.message);
  }
}

async function main() {
  console.log('Iniciando verificación y envío en 3 segundos...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Paso 1: Verificar sistema
  const isValid = await verifySystem();
  
  if (!isValid) {
    console.log('\n❌ El sistema no pasó la verificación. No se enviarán emails.');
    return;
  }
  
  // Paso 2: Confirmación final
  console.log('\n⚠️ CONFIRMACIÓN FINAL');
  console.log('Estás a punto de enviar emails REALES de cancelación a todos los padres.');
  console.log('Los emails se enviarán automáticamente en 10 segundos...');
  console.log('Presiona Ctrl+C para cancelar si no quieres continuar.');
  
  for (let i = 10; i > 0; i--) {
    process.stdout.write(`\r⏰ ${i} segundos restantes...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n\n🚀 Iniciando envío masivo...');
  
  // Paso 3: Envío real
  await sendRealEmails();
}

// Ejecutar
main().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});




