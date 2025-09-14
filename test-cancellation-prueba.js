// Script específico para probar el email del equipo "prueba"
console.log('🚀 Prueba específica del equipo "prueba"...');

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

async function testPruebaTeam() {
  try {
    console.log('\n📋 1. Verificando datos del equipo "prueba"...');
    
    // Primero obtener todos los estudiantes
    const getResponse = await makeRequest('/api/send-cancellation-emails');
    
    if (getResponse.data && getResponse.data.students) {
      const allStudents = getResponse.data.students;
      
      // Filtrar solo estudiantes del equipo "prueba"
      const pruebaStudents = allStudents.filter(student => 
        student.teamName.toLowerCase() === 'prueba'
      );
      
      if (pruebaStudents.length === 0) {
        console.log('❌ No se encontraron estudiantes en el equipo "prueba"');
        return;
      }
      
      console.log(`✅ Encontrados ${pruebaStudents.length} estudiantes en equipo "prueba"`);
      
      const student = pruebaStudents[0];
      console.log('\n📧 Datos del estudiante del equipo "prueba":');
      console.log(`  - Estudiante: "${student.studentName}"`);
      console.log(`  - Padre: "${student.parentName}"`);
      console.log(`  - Email: "${student.parentEmail}"`);
      console.log(`  - Equipo: "${student.teamName}"`);
      console.log(`  - Escuela: "${student.schoolName}"`);
      
      console.log('\n🧪 2. Enviando email de prueba específico para equipo "prueba"...');
      console.log('⏳ Procesando...');
      
      // Crear un POST request que incluya solo este estudiante específico
      // Para esto vamos a hacer una simulación directa con los datos correctos
      const specificTestData = {
        preview: false,
        testEmail: student.parentEmail,
        limit: 100, // Usar límite alto para asegurar que incluye el estudiante correcto
        specificTeam: 'prueba' // Parámetro adicional para filtrar
      };

      const response = await makeRequest('/api/send-cancellation-emails', 'POST', specificTestData);
      
      console.log(`\n📊 Status: ${response.status}`);
      console.log('📋 Resultado:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success && response.data.emailsSent > 0) {
        console.log('\n✅ ¡Email enviado!');
        console.log('🔍 Revisa tu email para verificar que los datos sean correctos:');
        console.log(`   - Subject debe contener: "prueba"`);
        console.log(`   - Padre debe ser: "${student.parentName}"`);
        console.log(`   - Equipo debe ser: "${student.teamName}"`);
        console.log(`   - Escuela debe ser: "${student.schoolName}"`);
      } else {
        console.log('\n❌ Error enviando email');
        if (response.data.results) {
          response.data.results.forEach(result => {
            if (!result.success) {
              console.log(`Error: ${result.error}`);
            }
          });
        }
      }
      
    } else {
      console.log('❌ Error obteniendo datos de estudiantes');
    }

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message);
  }
}

// Ejecutar prueba
testPruebaTeam();




