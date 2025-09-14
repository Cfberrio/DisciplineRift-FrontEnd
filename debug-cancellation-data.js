// Script para debuggear exactamente qué datos están llegando desde Supabase
console.log('🔍 Debugging datos de cancelación...');

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

async function debugData() {
  try {
    console.log('\n📋 1. Obteniendo todos los estudiantes en equipos cancelados...');
    
    const getResponse = await makeRequest('/api/send-cancellation-emails');
    
    if (getResponse.data && getResponse.data.students) {
      const students = getResponse.data.students;
      console.log(`\nTotal estudiantes: ${students.length}`);
      
      // Buscar específicamente el equipo "prueba"
      const pruebaStudents = students.filter(s => 
        s.teamName.toLowerCase().includes('prueba') || 
        s.schoolName.toLowerCase().includes('prueba')
      );
      
      console.log(`\n🎯 Estudiantes en equipo "prueba": ${pruebaStudents.length}`);
      
      if (pruebaStudents.length > 0) {
        pruebaStudents.forEach((student, index) => {
          console.log(`\n📧 Estudiante ${index + 1} en equipo "prueba":`);
          console.log(`  - Nombre estudiante: "${student.studentName}"`);
          console.log(`  - Nombre padre: "${student.parentName}"`);
          console.log(`  - Email padre: "${student.parentEmail}"`);
          console.log(`  - Equipo: "${student.teamName}"`);
          console.log(`  - Escuela: "${student.schoolName}"`);
        });
        
        // Probar envío con el primer estudiante del equipo prueba
        console.log('\n🧪 2. Probando envío SOLO con estudiante del equipo "prueba"...');
        
        const pruebaStudent = pruebaStudents[0];
        console.log(`Enviando a: ${pruebaStudent.parentEmail}`);
        console.log(`Datos que DEBERÍAN aparecer en el email:`);
        console.log(`  - Padre: ${pruebaStudent.parentName}`);
        console.log(`  - Equipo: ${pruebaStudent.teamName}`);
        console.log(`  - Escuela: ${pruebaStudent.schoolName}`);
        
        const testEmailData = {
          preview: false,
          testEmail: pruebaStudent.parentEmail,
          limit: 1
        };

        const postResponse = await makeRequest('/api/send-cancellation-emails', 'POST', testEmailData);
        console.log(`\n📊 Status del envío: ${postResponse.status}`);
        console.log('📋 Resultado detallado:', JSON.stringify(postResponse.data, null, 2));
        
      } else {
        console.log('\n❌ No se encontró ningún estudiante en equipo "prueba"');
        console.log('\n📋 Equipos disponibles:');
        const uniqueTeams = [...new Set(students.map(s => s.teamName))];
        uniqueTeams.forEach(team => console.log(`  - "${team}"`));
      }
      
      // Buscar por Cristian Berrio específicamente
      console.log('\n🔍 3. Buscando específicamente a "Cristian Berrio"...');
      const cristianStudents = students.filter(s => 
        s.studentName.toLowerCase().includes('cristian') && 
        s.studentName.toLowerCase().includes('berrio')
      );
      
      if (cristianStudents.length > 0) {
        console.log('\n✅ Encontrado Cristian Berrio:');
        cristianStudents.forEach(student => {
          console.log(`  - Estudiante: "${student.studentName}"`);
          console.log(`  - Padre: "${student.parentName}"`);
          console.log(`  - Email: "${student.parentEmail}"`);
          console.log(`  - Equipo: "${student.teamName}"`);
          console.log(`  - Escuela: "${student.schoolName}"`);
        });
      } else {
        console.log('❌ No se encontró "Cristian Berrio"');
      }
      
    } else {
      console.log('❌ No se recibieron datos de estudiantes');
    }

  } catch (error) {
    console.error('\n❌ Error durante debug:', error.message);
  }
}

// Ejecutar debug
debugData();




