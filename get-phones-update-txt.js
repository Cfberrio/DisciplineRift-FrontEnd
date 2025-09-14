// Script para obtener números de teléfono y actualizar el archivo txt
// NO ENVÍA EMAILS - SOLO ACTUALIZA EL ARCHIVO
const http = require('http');
const fs = require('fs');

console.log('🔍 Obteniendo números de teléfono de la base de datos...');
console.log('⚠️ NOTA: Este script NO envía emails, solo actualiza el archivo txt');

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

async function getPhonesAndUpdateTxt() {
  try {
    console.log('\n📞 Consultando base de datos para obtener teléfonos...');
    
    // Obtener datos con teléfonos incluidos
    const response = await makeRequest('/api/send-cancellation-emails');
    
    if (!response.data || !response.data.success) {
      console.error('❌ Error obteniendo datos:', response.data);
      return;
    }
    
    const students = response.data.students || [];
    console.log(`✅ Datos obtenidos: ${students.length} estudiantes`);
    
    if (students.length === 0) {
      console.log('⚠️ No se encontraron estudiantes');
      return;
    }
    
    // Verificar si incluye teléfonos
    const firstStudent = students[0];
    if (!firstStudent.parentPhone) {
      console.log('⚠️ Los datos no incluyen números de teléfono');
      console.log('Estructura recibida:', Object.keys(firstStudent));
      return;
    }
    
    console.log('📱 Teléfonos encontrados, generando archivo actualizado...');
    
    // Deduplicar por email de padre
    const uniqueParents = new Map();
    students.forEach(student => {
      if (!uniqueParents.has(student.parentEmail)) {
        uniqueParents.set(student.parentEmail, {
          parentName: student.parentName,
          parentEmail: student.parentEmail,
          parentPhone: student.parentPhone || 'No disponible',
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
    
    // Generar contenido del archivo
    let output = '';
    output += '================================================================\n';
    output += '📧 INFORMACIÓN DE CONTACTO COMPLETA - EMAILS DE CANCELACIÓN\n';
    output += '================================================================\n\n';
    output += `TOTAL DE EMAILS ÚNICOS A ENVIAR: ${parentsList.length}\n`;
    output += `TOTAL DE ESTUDIANTES AFECTADOS: ${students.length}\n\n`;
    output += '================================================================\n';
    output += 'LISTA COMPLETA DE PADRES Y CONTACTOS\n';
    output += '================================================================\n\n';
    
    parentsList.forEach((parent, index) => {
      output += `${(index + 1).toString().padStart(2, '0')}. PADRE/MADRE: ${parent.parentName}\n`;
      output += `    📧 Email: ${parent.parentEmail}\n`;
      output += `    📞 Teléfono: ${parent.parentPhone}\n`;
      output += `    👶 Hijos afectados: ${parent.children.length}\n`;
      
      parent.children.forEach((child, childIndex) => {
        output += `       ${childIndex + 1}. ${child.studentName}\n`;
        output += `          🏐 Equipo: ${child.teamName}\n`;
        output += `          🏫 Escuela: ${child.schoolName}\n`;
      });
      output += '\n';
    });
    
    // Resumen por equipos
    output += '================================================================\n';
    output += 'RESUMEN POR EQUIPOS\n';
    output += '================================================================\n';
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
    output += '================================================================\n';
    const schoolCounts = {};
    students.forEach(student => {
      schoolCounts[student.schoolName] = (schoolCounts[student.schoolName] || 0) + 1;
    });
    
    Object.entries(schoolCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([school, count]) => {
        output += `🏫 ${school}: ${count} estudiante(s)\n`;
      });
    
    output += '\n================================================================\n';
    output += '✅ RESUMEN FINAL\n';
    output += '================================================================\n';
    output += `📧 Total emails únicos a enviar: ${parentsList.length}\n`;
    output += `👶 Total estudiantes afectados: ${students.length}\n`;
    output += `🏐 Equipos cancelados: ${Object.keys(teamCounts).length}\n`;
    output += `🏫 Escuelas afectadas: ${Object.keys(schoolCounts).length}\n\n`;
    output += '⚠️ IMPORTANTE: Esta información es solo para revisión.\n';
    output += 'No se han enviado emails.\n\n';
    output += `Fecha de generación: ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}\n`;
    output += '================================================================\n';
    
    // Guardar archivo actualizado
    const fileName = 'lista-contactos-con-telefonos.txt';
    fs.writeFileSync(fileName, output, 'utf8');
    
    console.log('✅ Archivo actualizado exitosamente!');
    console.log(`📄 Archivo: ${fileName}`);
    console.log(`📞 Teléfonos incluidos: ${parentsList.filter(p => p.parentPhone && p.parentPhone !== 'No disponible').length}`);
    console.log(`📧 Total contactos: ${parentsList.length}`);
    
    // Mostrar algunos ejemplos
    console.log('\n📋 Ejemplos de contactos con teléfono:');
    parentsList.slice(0, 5).forEach((parent, i) => {
      console.log(`${i + 1}. ${parent.parentName} - ${parent.parentEmail} - ${parent.parentPhone}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n🔧 Posibles soluciones:');
    console.error('1. Verificar que el servidor Next.js esté corriendo (npm run dev)');
    console.error('2. Verificar que la API esté accesible en localhost:3000');
    console.error('3. Verificar la conexión a la base de datos Supabase');
  }
}

// Ejecutar
getPhonesAndUpdateTxt();


