// Script para conectar directamente a Supabase y obtener teléfonos
// NO ENVÍA EMAILS - SOLO CONSULTA BD Y ACTUALIZA ARCHIVO TXT

// Cargar variables de entorno
if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const dotenv = require('dotenv');
    const path = require('path');
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
  } catch (error) {
    console.warn('⚠️ No se pudo cargar dotenv');
  }
}

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('🔍 Conectando directamente a Supabase para obtener teléfonos...');
console.log('⚠️ NOTA: Este script NO envía emails, solo consulta la BD');

async function getPhonesDirect() {
  try {
    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables de entorno de Supabase no encontradas');
      console.error('Verificar: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
      return;
    }
    
    console.log('✅ Variables de entorno encontradas');
    console.log(`🔗 URL: ${supabaseUrl.substring(0, 30)}...`);
    
    // Crear cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('\n📋 Consultando base de datos...');
    console.log('Query: enrollment (isactive=true) -> student -> parent (con phone) -> team (isactive=false)');
    
    // Query completa para obtener estudiantes en equipos cancelados con teléfonos
    const { data: enrollments, error } = await supabase
      .from('enrollment')
      .select(`
        enrollmentid,
        isactive,
        student:studentid (
          studentid,
          firstname,
          lastname,
          parent:parentid (
            parentid,
            firstname,
            lastname,
            email,
            phone
          )
        ),
        team:teamid (
          teamid,
          name,
          isactive,
          school:schoolid (
            schoolid,
            name
          )
        )
      `)
      .eq('isactive', true)  // Solo enrollments activos
      .limit(1000);

    if (error) {
      console.error('❌ Error en la consulta:', error);
      return;
    }

    console.log(`📊 Enrollments obtenidos: ${enrollments?.length || 0}`);

    if (!enrollments || enrollments.length === 0) {
      console.log('⚠️ No se encontraron enrollments activos');
      return;
    }

    // Filtrar solo los que están en equipos cancelados (isactive = false)
    const studentsInCancelledTeams = enrollments
      .filter(enrollment => {
        const team = enrollment.team;
        return team && team.isactive === false;
      })
      .map(enrollment => {
        const student = enrollment.student;
        const parent = student?.parent;
        const team = enrollment.team;
        const school = team?.school;

        return {
          studentName: `${student?.firstname || ''} ${student?.lastname || ''}`.trim(),
          parentName: `${parent?.firstname || ''} ${parent?.lastname || ''}`.trim(),
          parentEmail: parent?.email || '',
          parentPhone: parent?.phone || 'No disponible',
          teamName: team?.name || '',
          schoolName: school?.name || ''
        };
      })
      .filter(student => 
        student.parentEmail && // Debe tener email
        student.parentName && // Debe tener nombre del padre
        student.teamName // Debe tener nombre del equipo
      );

    console.log(`✅ Estudiantes en equipos cancelados: ${studentsInCancelledTeams.length}`);

    if (studentsInCancelledTeams.length === 0) {
      console.log('⚠️ No se encontraron estudiantes en equipos cancelados');
      return;
    }

    // Deduplicar por email de padre
    const uniqueParents = new Map();
    studentsInCancelledTeams.forEach(student => {
      if (!uniqueParents.has(student.parentEmail)) {
        uniqueParents.set(student.parentEmail, {
          parentName: student.parentName,
          parentEmail: student.parentEmail,
          parentPhone: student.parentPhone,
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
    console.log(`📞 Padres únicos con teléfonos: ${parentsList.length}`);

    // Contar teléfonos disponibles
    const phonesAvailable = parentsList.filter(p => p.parentPhone && p.parentPhone !== 'No disponible').length;
    console.log(`📱 Teléfonos disponibles: ${phonesAvailable}/${parentsList.length}`);

    // Generar contenido del archivo
    let output = '';
    output += '================================================================\n';
    output += '📧 INFORMACIÓN DE CONTACTO COMPLETA - EMAILS DE CANCELACIÓN\n';
    output += '================================================================\n\n';
    output += `TOTAL DE EMAILS ÚNICOS A ENVIAR: ${parentsList.length}\n`;
    output += `TOTAL DE ESTUDIANTES AFECTADOS: ${studentsInCancelledTeams.length}\n`;
    output += `TELÉFONOS DISPONIBLES: ${phonesAvailable}/${parentsList.length}\n\n`;
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
    studentsInCancelledTeams.forEach(student => {
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
    studentsInCancelledTeams.forEach(student => {
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
    output += `👶 Total estudiantes afectados: ${studentsInCancelledTeams.length}\n`;
    output += `📞 Teléfonos disponibles: ${phonesAvailable}\n`;
    output += `🏐 Equipos cancelados: ${Object.keys(teamCounts).length}\n`;
    output += `🏫 Escuelas afectadas: ${Object.keys(schoolCounts).length}\n\n`;
    output += '⚠️ IMPORTANTE: Esta información es solo para revisión.\n';
    output += 'No se han enviado emails.\n\n';
    output += `Fecha de consulta: ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}\n`;
    output += '================================================================\n';

    // Guardar archivo
    const fileName = 'lista-contactos-con-telefonos.txt';
    fs.writeFileSync(fileName, output, 'utf8');

    console.log('\n✅ ¡Archivo creado exitosamente!');
    console.log(`📄 Archivo: ${fileName}`);
    console.log(`📞 Teléfonos incluidos: ${phonesAvailable}/${parentsList.length}`);
    console.log(`📧 Total contactos: ${parentsList.length}`);

    // Mostrar algunos ejemplos
    console.log('\n📋 Primeros 3 contactos:');
    parentsList.slice(0, 3).forEach((parent, i) => {
      console.log(`${i + 1}. ${parent.parentName}`);
      console.log(`   📧 ${parent.parentEmail}`);
      console.log(`   📞 ${parent.parentPhone}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n🔧 Verificar:');
    console.error('1. Variables de entorno en .env.local');
    console.error('2. Conexión a internet');
    console.error('3. Credenciales de Supabase');
  }
}

// Ejecutar
getPhonesDirect();


