const http = require('http');

const data = JSON.stringify({
  preview: true,
  testEmail: null,
  limit: null
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/send-cancellation-emails',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(responseData);
      
      if (jsonData.success && jsonData.students) {
        const students = jsonData.students;
        
        console.log('='.repeat(60));
        console.log('📧 INFORMACIÓN DE CONTACTO - EMAILS DE CANCELACIÓN');
        console.log('='.repeat(60));
        console.log(`TOTAL DE EMAILS ÚNICOS A ENVIAR: ${jsonData.count}`);
        console.log(`TOTAL DE ESTUDIANTES AFECTADOS: ${students.length}`);
        console.log('='.repeat(60));
        
        // Deduplicar por email de padre
        const uniqueParents = new Map();
        students.forEach(student => {
          if (!uniqueParents.has(student.parentEmail)) {
            uniqueParents.set(student.parentEmail, {
              parentName: student.parentName,
              parentEmail: student.parentEmail,
              children: []
            });
          }
          uniqueParents.get(student.parentEmail).children.push({
            studentName: student.studentName,
            teamName: student.teamName,
            schoolName: student.schoolName
          });
        });
        
        const parentsList = Array.from(uniqueParents.values());
        
        parentsList.forEach((parent, index) => {
          console.log(`\n${(index + 1).toString().padStart(2, '0')}. PADRE/MADRE: ${parent.parentName}`);
          console.log(`    📧 Email: ${parent.parentEmail}`);
          console.log(`    👶 Hijos afectados: ${parent.children.length}`);
          
          parent.children.forEach((child, childIndex) => {
            console.log(`       ${childIndex + 1}. ${child.studentName}`);
            console.log(`          🏐 Equipo: ${child.teamName}`);
            console.log(`          🏫 Escuela: ${child.schoolName}`);
          });
        });
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ RESUMEN FINAL');
        console.log('='.repeat(60));
        console.log(`📧 Total emails únicos a enviar: ${parentsList.length}`);
        console.log(`👶 Total estudiantes afectados: ${students.length}`);
        
      } else {
        console.log('Error:', jsonData);
      }
    } catch (error) {
      console.log('Error parsing JSON:', error);
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.log('Request error:', error);
});

req.write(data);
req.end();



