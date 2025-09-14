// Script para mostrar SOLO la información de contacto - NO ENVÍA EMAILS
console.log('📋 === INFORMACIÓN DE CONTACTO - MODO SOLO LECTURA ===');
console.log('⚠️ ESTE SCRIPT NO ENVÍA EMAILS, SOLO MUESTRA INFORMACIÓN');

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

async function showContactInfo() {
  try {
    console.log('\n🔍 Obteniendo información de contacto...');
    
    // Usar modo PREVIEW para NO enviar emails
    const previewData = {
      preview: true, // MODO PREVIEW - NO ENVÍA EMAILS
      testEmail: null,
      limit: null
    };
    
    const response = await makeRequest('/api/send-cancellation-emails', 'POST', previewData);
    
    if (!response.data || !response.data.success) {
      console.error('❌ Error obteniendo datos:', response.data);
      return;
    }
    
    const students = response.data.students || [];
    console.log(`\n📊 Total de estudiantes en equipos cancelados: ${students.length}`);
    console.log(`📧 Emails únicos que recibirían cancelación: ${response.data.count}`);
    
    if (students.length === 0) {
      console.log('ℹ️ No hay estudiantes en equipos cancelados');
      return;
    }
    
    console.log('\n📋 === INFORMACIÓN COMPLETA DE CONTACTO ===\n');
    
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
    
    console.log(`📧 TOTAL DE EMAILS ÚNICOS A ENVIAR: ${parentsList.length}\n`);
    
    parentsList.forEach((parent, index) => {
      console.log(`${(index + 1).toString().padStart(2, '0')}. PADRE/MADRE: ${parent.parentName}`);
      console.log(`    📧 Email: ${parent.parentEmail}`);
      console.log(`    👶 Hijos afectados: ${parent.children.length}`);
      
      parent.children.forEach((child, childIndex) => {
        console.log(`       ${childIndex + 1}. ${child.studentName}`);
        console.log(`          🏐 Equipo: ${child.teamName}`);
        console.log(`          🏫 Escuela: ${child.schoolName}`);
      });
      console.log(''); // Línea en blanco
    });
    
    // Resumen por equipos
    console.log('\n📊 === RESUMEN POR EQUIPOS ===');
    const teamCounts = {};
    students.forEach(student => {
      teamCounts[student.teamName] = (teamCounts[student.teamName] || 0) + 1;
    });
    
    Object.entries(teamCounts)
      .sort((a, b) => b[1] - a[1]) // Ordenar por cantidad
      .forEach(([team, count]) => {
        console.log(`🏐 ${team}: ${count} estudiante(s)`);
      });
    
    // Resumen por escuelas
    console.log('\n🏫 === RESUMEN POR ESCUELAS ===');
    const schoolCounts = {};
    students.forEach(student => {
      schoolCounts[student.schoolName] = (schoolCounts[student.schoolName] || 0) + 1;
    });
    
    Object.entries(schoolCounts)
      .sort((a, b) => b[1] - a[1]) // Ordenar por cantidad
      .forEach(([school, count]) => {
        console.log(`🏫 ${school}: ${count} estudiante(s)`);
      });
    
    console.log('\n✅ === RESUMEN FINAL ===');
    console.log(`📧 Total emails a enviar: ${parentsList.length}`);
    console.log(`👶 Total estudiantes afectados: ${students.length}`);
    console.log(`🏐 Equipos cancelados: ${Object.keys(teamCounts).length}`);
    console.log(`🏫 Escuelas afectadas: ${Object.keys(schoolCounts).length}`);
    console.log('\n⚠️ RECUERDA: Esta es solo información. NO se han enviado emails.');
    
  } catch (error) {
    console.error('❌ Error obteniendo información:', error.message);
  }
}

// Ejecutar
showContactInfo();



