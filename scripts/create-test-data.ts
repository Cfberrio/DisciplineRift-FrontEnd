#!/usr/bin/env npx tsx

/**
 * Script para crear datos de prueba para el sistema de recordatorios
 */

// Cargar variables de entorno
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { DateTime } from 'luxon';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const TIMEZONE = 'America/New_York';

const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

async function createTestData() {
  try {
    console.log('🧪 === CREANDO DATOS DE PRUEBA ===');
    
    const supabase = createSupabaseClient();
    const now = DateTime.now().setZone(TIMEZONE);
    const testDate = now.plus({ days: 30 }).toISODate(); // 30 días en el futuro
    
    console.log(`📅 Creando sesión de prueba para: ${testDate}`);
    
    // 1. Crear un padre de prueba
    const testParentId = randomUUID();
    console.log('👨‍👩‍👧‍👦 Creando padre de prueba...');
    
    const { data: parent, error: parentError } = await supabase
      .from('parent')
      .insert({
        parentid: testParentId,
        firstname: 'Juan',
        lastname: 'Pérez',
        email: 'test.parent@example.com', // Cambia esto por tu email real para recibir la prueba
        phone: '555-0123'
      })
      .select()
      .single();
    
    if (parentError) {
      console.error('❌ Error creando padre:', parentError);
      return;
    }
    
    console.log('✅ Padre creado:', parent.firstname, parent.lastname);
    
    // 2. Crear un estudiante de prueba
    const testStudentId = randomUUID();
    console.log('👨‍🎓 Creando estudiante de prueba...');
    
    const { data: student, error: studentError } = await supabase
      .from('student')
      .insert({
        studentid: testStudentId,
        parentid: testParentId,
        firstname: 'María',
        lastname: 'Pérez',
        dob: '2008-06-15', // Fecha de nacimiento
        grade: '10th Grade',
        ecname: 'Ana Pérez',     // Emergency contact name
        ecphone: '555-0124',     // Emergency contact phone
        ecrelationship: 'Aunt'   // Emergency contact relationship
      })
      .select()
      .single();
    
    if (studentError) {
      console.error('❌ Error creando estudiante:', studentError);
      return;
    }
    
    console.log('✅ Estudiante creado:', student.firstname, student.lastname);
    
    // 3. Crear un equipo de prueba
    const testTeamId = randomUUID();
    console.log('🏐 Creando equipo de prueba...');
    
    const { data: team, error: teamError } = await supabase
      .from('team')
      .insert({
        teamid: testTeamId,
        name: 'Volleyball Test Team',
        description: 'Equipo de prueba para sistema de recordatorios'
      })
      .select()
      .single();
    
    if (teamError) {
      console.error('❌ Error creando equipo:', teamError);
      return;
    }
    
    console.log('✅ Equipo creado:', team.name);
    
    // 4. Crear una sesión de prueba
    const testSessionId = randomUUID();
    console.log('📅 Creando sesión de prueba...');
    
    const { data: session, error: sessionError } = await supabase
      .from('session')
      .insert({
        sessionid: testSessionId,
        teamid: testTeamId,
        startdate: testDate,
        enddate: now.plus({ days: 60 }).toISODate(), // 60 días en el futuro
        starttime: '18:00',
        endtime: '19:30',
        daysofweek: 'Monday,Wednesday,Friday'
      })
      .select()
      .single();
    
    if (sessionError) {
      console.error('❌ Error creando sesión:', sessionError);
      return;
    }
    
    console.log('✅ Sesión creada:', session.startdate, 'al', session.enddate);
    
    // 5. Crear inscripción activa
    const testEnrollmentId = randomUUID();
    console.log('📝 Creando inscripción de prueba...');
    
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollment')
      .insert({
        enrollmentid: testEnrollmentId,
        studentid: testStudentId,
        teamid: testTeamId,
        isactive: true
      })
      .select()
      .single();
    
    if (enrollmentError) {
      console.error('❌ Error creando inscripción:', enrollmentError);
      return;
    }
    
    console.log('✅ Inscripción creada:', enrollment.enrollmentid);
    
    // 6. Resumen
    console.log('\n📊 === RESUMEN DE DATOS DE PRUEBA ===');
    console.log(`👨‍👩‍👧‍👦 Padre: ${parent.firstname} ${parent.lastname} (${parent.email})`);
    console.log(`👨‍🎓 Estudiante: ${student.firstname} ${student.lastname}`);
    console.log(`🏐 Equipo: ${team.name}`);
    console.log(`📅 Sesión: ${session.startdate} - ${session.enddate}`);
    console.log(`⏰ Horario: ${session.starttime} - ${session.endtime}`);
    console.log(`📆 Días: ${session.daysofweek}`);
    console.log(`✅ Inscripción activa: ${enrollment.isactive}`);
    
    console.log('\n🎯 === DATOS PARA PRUEBA ===');
    console.log(`Para probar, ejecuta:`);
    console.log(`npm run season-reminders -- --date=${now.toISODate()}`);
    console.log(`\nEsto debería encontrar la sesión y enviar un email a: ${parent.email}`);
    
    return {
      parentId: testParentId,
      studentId: testStudentId,
      teamId: testTeamId,
      sessionId: testSessionId,
      enrollmentId: testEnrollmentId,
      testDate,
      parentEmail: parent.email
    };
    
  } catch (error) {
    console.error('💥 Error creando datos de prueba:', error);
    throw error;
  }
}

async function cleanupTestData() {
  try {
    console.log('🧹 === LIMPIANDO DATOS DE PRUEBA ===');
    
    const supabase = createSupabaseClient();
    
    // Buscar y eliminar datos de prueba (buscar por nombres de prueba en lugar de IDs)
    const cleanupQueries = [
      { table: 'enrollment', condition: { teamid: 'in.(select teamid from team where teamname like \'%Test%\')' }},
      { table: 'session', condition: { teamid: 'in.(select teamid from team where teamname like \'%Test%\')' }},
      { table: 'student', condition: { firstname: 'eq.María', lastname: 'eq.Pérez' }},
      { table: 'parent', condition: { firstname: 'eq.Juan', lastname: 'eq.Pérez' }},
      { table: 'team', condition: { name: 'like.%Test%' }}
    ];
    
    for (const query of cleanupQueries) {
      try {
        let deleteQuery = supabase.from(query.table).delete();
        
        // Aplicar condiciones
        for (const [key, value] of Object.entries(query.condition)) {
          if (value.startsWith('eq.')) {
            deleteQuery = deleteQuery.eq(key, value.substring(3));
          } else if (value.startsWith('like.')) {
            deleteQuery = deleteQuery.like(key, value.substring(5));
          } else if (value.startsWith('in.')) {
            // Para consultas complejas, usar rpc o similar
            console.log(`⚠️ Saltando limpieza compleja para ${query.table}`);
            continue;
          }
        }
        
        const { error } = await deleteQuery;
        
        if (!error) {
          console.log(`✅ Limpiado tabla ${query.table}`);
        } else {
          console.log(`⚠️ Error limpiando ${query.table}:`, error.message);
        }
      } catch (cleanupError) {
        console.log(`⚠️ Error en limpieza de ${query.table}:`, cleanupError);
      }
    }
    
    console.log('✅ Limpieza completada');
    
  } catch (error) {
    console.error('💥 Error limpiando datos de prueba:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isCleanup = args.includes('--cleanup');
  
  if (isCleanup) {
    await cleanupTestData();
  } else {
    await createTestData();
  }
}

// Manejar señales de interrupción
process.on('SIGINT', () => {
  console.log('\n⚠️ Operación interrumpida');
  process.exit(0);
});

// Ejecutar
main().catch((error) => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
