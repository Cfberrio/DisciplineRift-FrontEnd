// Script simple para probar el sistema de cancelación
console.log('🚀 Iniciando prueba del sistema de cancelación...');

// Función simple para hacer request HTTP
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

async function testCancellationSystem() {
  try {
    console.log('\n📋 1. Verificando qué estudiantes están en equipos cancelados...');
    
    const getResponse = await makeRequest('/api/send-cancellation-emails');
    console.log(`Status: ${getResponse.status}`);
    console.log('Respuesta:', JSON.stringify(getResponse.data, null, 2));

    if (getResponse.data && getResponse.data.students && getResponse.data.students.length > 0) {
      console.log(`\n✅ Encontrados ${getResponse.data.students.length} estudiantes en equipos cancelados`);
      
      // Mostrar primer estudiante como ejemplo
      const firstStudent = getResponse.data.students[0];
      console.log('\n📧 Ejemplo de estudiante:');
      console.log(`  - Padre: ${firstStudent.parentName} (${firstStudent.parentEmail})`);
      console.log(`  - Estudiante: ${firstStudent.studentName}`);
      console.log(`  - Equipo: ${firstStudent.teamName}`);
      console.log(`  - Escuela: ${firstStudent.schoolName}`);
      
      // Preguntar si enviar email de prueba
      console.log('\n🧪 2. Enviando email de prueba...');
      console.log('NOTA: Cambia "test@example.com" por tu email real para recibir la prueba');
      
      const testEmailData = {
        preview: false,
        testEmail: 'test@example.com', // ⚠️ CAMBIAR ESTE EMAIL
        limit: 1
      };

      const postResponse = await makeRequest('/api/send-cancellation-emails', 'POST', testEmailData);
      console.log(`\nStatus del envío: ${postResponse.status}`);
      console.log('Resultado:', JSON.stringify(postResponse.data, null, 2));

    } else {
      console.log('\n⚠️ No se encontraron estudiantes en equipos cancelados');
      console.log('Asegúrate de que:');
      console.log('1. Hay al menos un equipo con isactive = false en la tabla team');
      console.log('2. Hay al least un enrollment con isactive = true para ese equipo');
      console.log('3. El estudiante tiene un padre con email válido');
    }

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message);
    console.error('\nVerifica que:');
    console.error('1. El servidor Next.js esté corriendo en localhost:3000');
    console.error('2. Las variables de entorno estén configuradas en .env.local');
    console.error('3. La base de datos de Supabase esté accesible');
  }
}

// Ejecutar la prueba
console.log('Iniciando en 2 segundos...');
setTimeout(testCancellationSystem, 2000);




