// Genera archivo con información de contacto
const http = require('http');
const fs = require('fs');

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

async function generateContactList() {
  try {
    console.log('Obteniendo información...');
    
    const previewData = {
      preview: true,
      testEmail: null,
      limit: null
    };
    
    const response = await makeRequest('/api/send-cancellation-emails', 'POST', previewData);
    
    if (!response.data || !response.data.success) {
      console.error('Error:', response.data);
      return;
    }
    
    const students = response.data.students || [];
    
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
    
    let output = '';
    output += '📧 INFORMACIÓN DE CONTACTO - EMAILS DE CANCELACIÓN\n';
    output += '='.repeat(50) + '\n\n';
    output += `TOTAL DE EMAILS ÚNICOS A ENVIAR: ${parentsList.length}\n`;
    output += `TOTAL DE ESTUDIANTES AFECTADOS: ${students.length}\n\n`;
    
    parentsList.forEach((parent, index) => {
      output += `${(index + 1).toString().padStart(2, '0')}. PADRE/MADRE: ${parent.parentName}\n`;
      output += `    📧 Email: ${parent.parentEmail}\n`;
      output += `    👶 Hijos afectados: ${parent.children.length}\n`;
      
      parent.children.forEach((child, childIndex) => {
        output += `       ${childIndex + 1}. ${child.studentName}\n`;
        output += `          🏐 Equipo: ${child.teamName}\n`;
        output += `          🏫 Escuela: ${child.schoolName}\n`;
      });
      output += '\n';
    });
    
    // Resumen por equipos
    output += '\n📊 RESUMEN POR EQUIPOS\n';
    output += '='.repeat(30) + '\n';
    const teamCounts = {};
    students.forEach(student => {
      teamCounts[student.teamName] = (teamCounts[student.teamName] || 0) + 1;
    });
    
    Object.entries(teamCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([team, count]) => {
        output += `🏐 ${team}: ${count} estudiante(s)\n`;
      });
    
    // Resumen por escuelas
    output += '\n🏫 RESUMEN POR ESCUELAS\n';
    output += '='.repeat(30) + '\n';
    const schoolCounts = {};
    students.forEach(student => {
      schoolCounts[student.schoolName] = (schoolCounts[student.schoolName] || 0) + 1;
    });
    
    Object.entries(schoolCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([school, count]) => {
        output += `🏫 ${school}: ${count} estudiante(s)\n`;
      });
    
    output += '\n✅ RESUMEN FINAL\n';
    output += '='.repeat(20) + '\n';
    output += `📧 Total emails a enviar: ${parentsList.length}\n`;
    output += `👶 Total estudiantes afectados: ${students.length}\n`;
    output += `🏐 Equipos cancelados: ${Object.keys(teamCounts).length}\n`;
    output += `🏫 Escuelas afectadas: ${Object.keys(schoolCounts).length}\n`;
    
    // Guardar en archivo
    const fileName = 'lista-contactos-cancelacion.txt';
    fs.writeFileSync(fileName, output, 'utf8');
    
    console.log(`✅ Información guardada en: ${fileName}`);
    console.log(`📊 Total emails a enviar: ${parentsList.length}`);
    console.log(`👶 Total estudiantes: ${students.length}`);
    
    // También mostrar en consola
    console.log('\n' + output);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

generateContactList();



